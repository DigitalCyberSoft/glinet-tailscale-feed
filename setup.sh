#!/bin/sh
# glinet-tailscale-feed installer
#   Restores current Tailscale + the GL.iNet admin-UI Tailscale panel on GL routers
#   that GL.iNet dropped it from (GL-E750/E750V2 Mudi and others).
#
# Usage (on the router, as root):
#   curl -fsSL https://digitalcybersoft.github.io/glinet-tailscale-feed/setup.sh -o /tmp/setup.sh
#   sh /tmp/setup.sh --dry-run     # inspect only; changes NOTHING on the device
#   sh /tmp/setup.sh               # detect arch + space, install full or -micro
#   sh /tmp/setup.sh --micro       # force the smaller build
#   sh /tmp/setup.sh --full        # force the full build
#
# Piping `curl ... | sh` also works but can't prompt or take args; download first
# if you want --dry-run, --micro/--full, or the "space is tight" question.
#
# The feed is UNSIGNED. GL firmware ships opkg with `check_signature` on, which
# both deletes an unsigned Packages list on `opkg update` and refuses to install
# from it -- unless `--force-signature` is passed. This script passes it on both.
# Verified against opkg-lede source (libopkg/opkg_cmd.c, libopkg/opkg_install.c).

set -eu

BASE="https://digitalcybersoft.github.io/glinet-tailscale-feed"
FEED_NAME="glits"
CUSTOMFEEDS="/etc/opkg/customfeeds.conf"

# Measured installed footprints (KB), largest arch, from the built .ipks:
#   full tailscale binary: mips 25600, arm/arm64 ~22208; GUI pkgs ~60
#   tailscale-micro (all arches): ~17000
FULL_INSTALL_KB=26000     # full binary worst case + GUI
MICRO_INSTALL_KB=17000    # micro binary + GUI
HEADROOM_KB=2048          # opkg control files + flash slack (.ipk downloads to RAM /tmp)
COMFORT_KB=4096           # free-space cushion above the bare requirement before we call it "tight"
# RAM, not flash, is the binding constraint at runtime: full tailscale links netstack
# (gVisor userspace TCP/IP) and its RSS can OOM a small router. On a router netstack
# isn't needed (kernel TUN does subnet routing), so -micro is the correct build there.
LOWRAM_KB=262144          # <=256 MB RAM -> prefer -micro (verified: full OOM'd a 128 MB e750)

NEED_FULL=$((FULL_INSTALL_KB + HEADROOM_KB))
NEED_MICRO=$((MICRO_INSTALL_KB + HEADROOM_KB))

DRY=0
FORCE_TIER=""   # "", full, micro

for a in "$@"; do
	case "$a" in
		--dry-run|-n) DRY=1 ;;
		--micro)      FORCE_TIER=micro ;;
		--full)       FORCE_TIER=full ;;
		-h|--help)
			sed -n '2,20p' "$0"; exit 0 ;;
		*) echo "unknown argument: $a" >&2; exit 2 ;;
	esac
done

log()  { printf '%s\n' "$*" >&2; }
die()  { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
head_() { printf '\n== %s ==\n' "$*" >&2; }

command -v opkg >/dev/null 2>&1 || die "opkg not found -- this is not an OpenWrt/GL.iNet device."
command -v curl >/dev/null 2>&1 || die "curl not found. Install it: opkg update && opkg install curl"
if [ "$DRY" = 0 ] && [ "$(id -u)" != 0 ]; then
	die "run as root (installing packages). Use --dry-run to inspect without root."
fi

# ---- detect the device architecture that this feed actually serves --------------
head_ "Architecture"
ARCH=""
# opkg print-architecture emits: "arch <name> <priority>"; skip the virtual all/noarch.
for a in $(opkg print-architecture 2>/dev/null \
		| awk '$1=="arch" && $2!="all" && $2!="noarch"{print $3":"$2}' \
		| sort -t: -k1,1 -rn | cut -d: -f2); do
	if curl -fsIL "$BASE/$a/Packages" >/dev/null 2>&1; then
		ARCH="$a"
		break
	fi
	log "  (no feed for $a, trying next)"
done
[ -n "$ARCH" ] || die "no matching feed for this device. opkg print-architecture reports:
$(opkg print-architecture)
Report this arch list on the repo and I'll add a build."
log "  device arch: $ARCH  ->  $BASE/$ARCH"

# does this arch ship a -micro build? (all arches ship one; probed, not assumed) --
MICRO_OK=0
if curl -fsSL "$BASE/$ARCH/Packages" 2>/dev/null | grep -q '^Package: tailscale-micro$'; then
	MICRO_OK=1
fi

# ---- free space on the writable overlay -----------------------------------------
head_ "Free space"
AVAIL=0
for m in /overlay /; do
	v=$(df -k "$m" 2>/dev/null | awk 'NR>=2 && $4 ~ /^[0-9]+$/ {print $4; exit}')
	if [ -n "${v:-}" ]; then AVAIL="$v"; MP="$m"; break; fi
done
[ "$AVAIL" -gt 0 ] 2>/dev/null || die "could not read free space from df."
log "  writable overlay ($MP): ${AVAIL} KB free (~$((AVAIL/1024)) MB)"
log "  full stack needs ~$((NEED_FULL/1024)) MB; micro needs ~$((NEED_MICRO/1024)) MB (installed)."

# ---- RAM: the binding runtime constraint (full links netstack; can OOM) ----------
head_ "Memory"
MEM_KB=$(awk '/^MemTotal:/{print $2; exit}' /proc/meminfo 2>/dev/null)
[ -n "${MEM_KB:-}" ] && [ "$MEM_KB" -gt 0 ] 2>/dev/null || MEM_KB=0
LOWRAM=0
if [ "$MEM_KB" -gt 0 ] && [ "$MEM_KB" -le "$LOWRAM_KB" ]; then LOWRAM=1; fi
if [ "$MEM_KB" -eq 0 ]; then
	log "  RAM: could not read /proc/meminfo; not forcing micro on RAM grounds."
elif [ "$LOWRAM" = 1 ]; then
	log "  RAM: ~$((MEM_KB/1024)) MB  [low-RAM: full+netstack can OOM -> -micro preferred]"
else
	log "  RAM: ~$((MEM_KB/1024)) MB  [enough for full]"
fi

# ---- external storage (only relevant if nothing fits) ---------------------------
ext_report() {
	df -k 2>/dev/null | awk '
		$1 ~ /^\/dev\/(sd|mmcblk|nvme)/ {
			printf "    %s  mounted %s  %d MB free\n", $1, $NF, $4/1024
		}'
}

# ---- choose tier ----------------------------------------------------------------
head_ "Plan"
TIGHT=0
LOWRAM_NOMICRO=0
if [ -n "$FORCE_TIER" ]; then
	TIER="$FORCE_TIER"
	if [ "$TIER" = micro ] && [ "$MICRO_OK" != 1 ]; then
		die "no -micro build exists for $ARCH. Re-run without --micro, or report the arch on the repo to add a build."
	fi
	if [ "$TIER" = full ] && [ "$LOWRAM" = 1 ]; then
		log "  WARNING: forcing full on a low-RAM device (~$((MEM_KB/1024)) MB); full links netstack and may OOM. -micro is safer."
	fi
	log "  tier forced by argument: $TIER"
elif [ "$LOWRAM" = 1 ] && [ "$MICRO_OK" = 1 ] && [ "$AVAIL" -ge "$NEED_MICRO" ]; then
	# RAM gates first: on a small router, full+netstack risks OOM regardless of flash.
	TIER=micro
	log "  low RAM (~$((MEM_KB/1024)) MB) -> micro (full links netstack; would risk OOM)"
elif [ "$LOWRAM" = 1 ] && [ "$MICRO_OK" != 1 ] && [ "$AVAIL" -ge "$NEED_FULL" ]; then
	# low RAM but no micro built for this arch: full is the only option; warn loudly.
	TIER=full; LOWRAM_NOMICRO=1
	log "  low RAM (~$((MEM_KB/1024)) MB) but no -micro build for $ARCH -> full (RISKS OOM under load)"
elif [ "$AVAIL" -ge $((NEED_FULL + COMFORT_KB)) ]; then
	TIER=full
	log "  ample space -> full build"
elif [ "$AVAIL" -ge "$NEED_FULL" ]; then
	TIER=full; TIGHT=1
	log "  full build fits but space is tight (< ${COMFORT_KB} KB to spare)"
elif [ "$MICRO_OK" = 1 ] && [ "$AVAIL" -ge "$NEED_MICRO" ]; then
	TIER=micro
	log "  full build will NOT fit; the smaller -micro build fits -> micro"
else
	TIER=none
fi

if [ "$TIER" = none ]; then
	log ""
	log "  Neither build fits the ${AVAIL} KB free on this device."
	log "  Full needs ~$((NEED_FULL/1024)) MB; micro ~$((NEED_MICRO/1024)) MB."
	EXT="$(ext_report)"
	if [ -n "$EXT" ]; then
		log "  External storage detected:"
		log "$EXT"
		log "  Fix: set up extroot to move the overlay onto that device, then re-run."
		log "  (Per-package relocation won't work: tailscaled lives at an absolute path"
		log "   the init script expects; extroot is the correct mechanism.)"
	else
		log "  No USB/SD storage mounted. Attach one and configure extroot, then re-run."
	fi
	log "  GL GUI: More Settings -> handle external storage; or OpenWrt block-mount + fstab."
	exit 1
fi

# offer micro when full is the pick but space is tight and micro exists -----------
ask() {  # $1 = question. yes -> 0. Non-interactive -> the given default ($2: y|n).
	if [ ! -t 0 ]; then
		[ "${2:-n}" = y ] && return 0 || return 1
	fi
	printf '%s [y/N] ' "$1" >&2
	read -r r || return 1
	case "$r" in y|Y|yes|YES) return 0;; *) return 1;; esac
}

if [ -z "$FORCE_TIER" ] && [ "$TIER" = full ] && [ "$TIGHT" = 1 ] && [ "$MICRO_OK" = 1 ]; then
	if ask "  Space is tight. Install the smaller -micro build instead?" n; then
		TIER=micro
		log "  -> switching to micro"
	fi
fi

if [ "$LOWRAM_NOMICRO" = 1 ]; then
	log ""
	log "  !! This device has ~$((MEM_KB/1024)) MB RAM and no -micro build exists for $ARCH."
	log "  !! Full tailscale links netstack and may OOM under load. If it crashes, either"
	log "  !! ask for a -micro build for $ARCH, or run tailscaled with --tun and no netstack."
fi

# ---- assemble the commands ------------------------------------------------------
FEED_LINE="src/gz $FEED_NAME $BASE/$ARCH"
if [ "$TIER" = micro ]; then
	# Install micro FIRST so gl-sdk4-tailscale's `Depends: tailscale` resolves to
	# micro's Provides, instead of opkg pulling the full 25 MB `tailscale`.
	INSTALL_1="opkg install --force-signature tailscale-micro"
	INSTALL_2="opkg install --force-signature gl-sdk4-tailscale gl-sdk4-ui-tailscaleview"
else
	INSTALL_1="opkg install --force-signature tailscale gl-sdk4-tailscale gl-sdk4-ui-tailscaleview"
	INSTALL_2=""
fi

log ""
log "  Selected: $TIER"
log "  Commands:"
log "    add feed line -> $CUSTOMFEEDS :  $FEED_LINE"
log "    opkg update --force-signature"
log "    $INSTALL_1"
[ -n "$INSTALL_2" ] && log "    $INSTALL_2"
log "    /etc/init.d/tailscale enable && /etc/init.d/tailscale start"
log "    /etc/init.d/rpcd restart   # load the panel's rpc handler"
log "    install /usr/bin/glits-update  (wraps 'opkg update --force-signature')"

if [ "$DRY" = 1 ]; then
	head_ "Dry run"
	# Prove the feed + packages are actually reachable from THIS device, no mutation.
	if curl -fsSL "$BASE/$ARCH/Packages" 2>/dev/null | grep -qE '^Package: (tailscale|gl-sdk4-tailscale|gl-sdk4-ui-tailscaleview)$'; then
		log "  feed reachable and serves the expected packages: OK"
	else
		log "  WARNING: could not confirm packages at $BASE/$ARCH/Packages from this device."
	fi
	log "  No changes made. Re-run without --dry-run to install."
	exit 0
fi

# ---- execute --------------------------------------------------------------------
head_ "Installing"

# add feed line idempotently; drop any stale line pointing at this base first
if [ -f "$CUSTOMFEEDS" ] && grep -q "$BASE/" "$CUSTOMFEEDS" 2>/dev/null; then
	grep -v "$BASE/" "$CUSTOMFEEDS" > "$CUSTOMFEEDS.new" || true
	mv "$CUSTOMFEEDS.new" "$CUSTOMFEEDS"
fi
printf '%s\n' "$FEED_LINE" >> "$CUSTOMFEEDS"
log "  feed line written."

# `opkg update` returns nonzero because the unsigned-feed sig 404s (expected).
# --force-signature keeps our Packages list from being deleted; we then confirm
# the list is really present rather than trusting the exit code.
opkg update --force-signature || log "  (opkg update reported errors; verifying our feed anyway)"
if ! opkg info tailscale >/dev/null 2>&1 && ! opkg info tailscale-micro >/dev/null 2>&1; then
	die "feed package list not available after update. Check the router's DNS/network
and that $BASE/$ARCH/Packages is reachable."
fi

# real install -- do NOT swallow failures; opkg's error is the signal.
$INSTALL_1
[ -n "$INSTALL_2" ] && $INSTALL_2

/etc/init.d/tailscale enable  2>/dev/null || log "  note: could not enable tailscale service"
/etc/init.d/tailscale start   2>/dev/null || log "  note: could not start tailscale service"
/etc/init.d/rpcd restart      2>/dev/null || true

# helper: the feed is unsigned, so a PLAIN `opkg update` deletes this feed's list
# (GL opkg has check_signature on). Run this instead to refresh + keep the feed,
# then `opkg upgrade tailscale` (or opkg install --force-signature tailscale) to pull newer builds.
cat > /usr/bin/glits-update <<'HELPER'
#!/bin/sh
# Refresh package lists including the unsigned glinet-tailscale-feed.
# Plain `opkg update` prunes an unsigned feed; --force-signature keeps it.
exec opkg update --force-signature "$@"
HELPER
chmod 0755 /usr/bin/glits-update
log "  installed /usr/bin/glits-update"

head_ "Done"
log "  Web UI: Applications -> Tailscale (hard-refresh if the menu is missing;"
log "          if still missing: /etc/init.d/rpcd restart)."
log "  CLI:    tailscale up      then open the printed login URL."
log ""
log "  To pull newer builds later, use 'glits-update' (NOT plain 'opkg update',"
log "  which would drop this unsigned feed's list), then:"
log "    opkg install --force-signature tailscale   # or tailscale-micro"
