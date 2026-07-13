# glinet-tailscale-feed

**Full install + device→arch guide: [INSTALL.md](INSTALL.md)**

Self-hosted opkg feed that restores **Tailscale + the GL.iNet admin-UI Tailscale panel** on
GL.iNet **GL-E750 / GL-E750V2 (Mudi / Mudi V2)** and other `ath79 / mips_24kc` (QCA95xx) routers,
after GL.iNet stopped shipping it.

Built for **seven** GL architectures (see the table below); GL-E750/E750V2 = QCA9533 / ath79 / `mips_24kc`.

![GL.iNet admin panel: Tailscale page, showing the restored panel plus the "Allow LAN Devices to Use Tailscale" and "Advertise as Exit Node" toggles this feed adds.](glinet-tailscale-panel.png)

Beyond GL's stock panel, this feed's panel adds: LAN-gateway and advertise-exit-node
toggles, an exit-node kill switch, keep-through-firmware-upgrade, in-panel package updates,
a binary-source picker, **auth key login** (paste a pre-generated key instead of using the
browser bind link) and **custom login server support for self-hosted control planes such
as [Headscale](https://headscale.net/)**.

## Packages

| Package | Version | Download | Purpose |
|---|---|---|---|
| `tailscale` | current stable | ~8.2MB | Current tailscaled+CLI, one binary. Full features (incl. netstack). |
| `tailscale-micro` | current stable, `-micro` | ~5.6MB | Size-minimized: drops netstack/gVisor only. Keeps DNS, subnet-router and exit-node (kernel-TUN routing). Built for all 7 arches. Conflicts with `tailscale`. |

Versions track upstream Tailscale stable and are rebuilt automatically (see [Automatic updates](#automatic-updates)); the sizes above are approximate.
| `gl-sdk4-tailscale` | git-2025.115 | ~7KB | GL backend: init, rpcd handler, firewall/hotplug, `gl_tailscale`. |
| `gl-sdk4-ui-tailscaleview` | git-2025.244 | ~18KB | The admin-UI Tailscale panel (menu + web view + i18n). |
| `gl-sdk4-tailscale-mullvad` | 0.1.6 | ~13KB | Mullvad exit-node picker inside the panel: country (flag) → city selects, active-node indicator, live switching. Verified end-to-end on a GL-XE3000. Needs the Tailscale Mullvad add-on and a device slot for the router (see the source repo README for the ACL/tag gotchas). Source + docs: [glinet-tailscale-mullvad](https://github.com/DigitalCyberSoft/glinet-tailscale-mullvad). |

The two `gl-sdk4-*` packages were extracted from GL's own XE3000 firmware image (they are
architecture-independent shell/Lua/JS — no compiled code) and repackaged for `mips_24kc`.
The `tailscale` binary is cross-compiled from upstream source (`GOARCH=mips GOMIPS=softfloat`,
`ts_include_cli`, `-s -w`), the same approach as GL's `small-tailscale` branch.

## Architectures

GL.iNet dropped Tailscale across several device families. This feed rebuilds it for all of them.
Find your device's arch with `opkg print-architecture`, then use the matching feed path:

| Feed path (arch) | GL devices (examples) |
|---|---|
| `mips_24kc` | ath79 / QCA95xx — GL-E750, E750V2, AR750, MT300N |
| `mipsel_24kc` | ramips mt7621/mt7628 — MT1300 Beryl, MT300N-V2, SFT1200 |
| `arm_cortex-a7` / `arm_cortex-a7_neon-vfpv4` | ipq40xx — AR750S Slate, B1300, A1300 |
| `arm_cortex-a15_neon-vfpv4` | ipq806x — B2200 |
| `arm_cortex-a9_vfpv3-d16` | mvebu (armada-38x) |
| `aarch64_cortex-a53` | mt7981 / ipq807x / ipq60xx — Flint, Spitz AX, XE3000 |

Every arch feed ships the same GL GUI panel (`gl-sdk4-*`, `Architecture: all`) **plus both a full
`tailscale` and a size-minimized `tailscale-micro`** — `-micro` is now built for all seven arches,
not just `mips_24kc`. See [Low-resource devices](#low-resource-devices-use-tailscale-micro) for which
to install.

## Install (any device)

Easiest — the script auto-detects arch, checks free space, and picks full vs `-micro`:

```sh
# inspect only, changes nothing:
curl -fsSL https://digitalcybersoft.github.io/glinet-tailscale-feed/setup.sh | sh -s -- --dry-run
# install:
curl -fsSL https://digitalcybersoft.github.io/glinet-tailscale-feed/setup.sh | sh
```

Piping is safe: the script never `read`s from a non-tty, so it won't hang or eat stdin.
Download it first only if you want the interactive "flash is tight, use -micro?" prompt during
a real install (piped, that question auto-answers "keep full"):
```sh
curl -fsSL https://digitalcybersoft.github.io/glinet-tailscale-feed/setup.sh -o /tmp/setup.sh
sh /tmp/setup.sh --dry-run     # or --full / --micro to force a tier
sh /tmp/setup.sh
```

Manual equivalent:

```sh
ARCH=$(opkg print-architecture | awk '$1=="arch" && $2!="all" && $2!="noarch"{print $3, $2}' | sort -rn | awk 'NR==1{print $2}')
echo "src/gz glits https://digitalcybersoft.github.io/glinet-tailscale-feed/$ARCH" >> /etc/opkg/customfeeds.conf
opkg update  --force-signature
opkg install --force-signature tailscale gl-sdk4-tailscale gl-sdk4-ui-tailscaleview
```

Panel appears under **Applications -> Tailscale** in the GL admin UI (postinst reloads rpcd/nginx;
refresh or reboot if needed). If opkg rejects the arch, add `--force-architecture`.

### The `--force-signature` flag is required (unsigned feed)
GL firmware ships opkg with `check_signature` enabled. This feed is **unsigned**, so:
- `opkg update` **without** `--force-signature` downloads then **deletes** this feed's package
  list (it has no `Packages.sig`). Always update with `opkg update --force-signature`.
- The installer drops a helper: run **`glits-update`** instead of plain `opkg update` to refresh
  and keep this feed, then `opkg install --force-signature tailscale` to pull a newer build.
- Already-installed packages keep working after a plain `opkg update`; only the update list is pruned.
- `--nocheck-signature` does **not** exist in OpenWrt/GL opkg — use `--force-signature`.


### Low-resource devices: use `tailscale-micro`
`setup.sh` picks the tier for you: it installs **`-micro` whenever RAM is ≤256 MB or the writable
overlay is too tight for the full build**. RAM is the binding constraint, not flash: full `tailscale`
links netstack (gVisor userspace TCP/IP) and its RSS can OOM a 128 MB router, whereas a router routes
subnets and exit-node traffic through the kernel TUN, so `-micro` gives up nothing it needs. `-micro`
now exists for all seven arches, so this path works on every supported device. Force it with
`sh setup.sh --micro`.

GL models in this class (128 MB RAM or less, small internal flash — `setup.sh` measures your actual
device, so treat this as a recognition aid, not a lookup table):

| Arch | Low-resource GL models |
|---|---|
| `mips_24kc` (ath79) | GL-E750 / E750V2 (Mudi), GL-AR750 (Creta), GL-AR750S (Slate), GL-AR300M / AR300M16 (Shadow), GL-AR300M-Lite, GL-X750 (Spitz), GL-USB150 (Microuter) |
| `mipsel_24kc` (ramips) | GL-MT300N-V2 (Mango, 16 MB flash / 128 MB RAM), GL-MT300A, GL-SFT1200 (Opal), GL-MT1300 (Beryl, 256 MB RAM) |
| `arm_cortex-a7` (ipq40xx) | GL-B1300 (Convexa-B), GL-A1300 (Slate Plus) — 256 MB RAM, so `setup.sh` defaults these to `-micro` too |

If even `-micro` will not fit the internal flash, `setup.sh` detects attached USB/SD and points you at
extroot (per-package relocation does not work — `tailscaled` lives at a fixed absolute path). You can
also install to a mounted `sd` dest manually: `opkg install -d sd ...` with an `sd` entry in
`/etc/opkg.conf`.

## Verified / not verified
- Verified: binaries are ELF32 big-endian MIPS32 **soft-float**, run under qemu (`tailscale version`,
  `up --help`); GUI packages contain no ELF; e750 firmware 4.8.5 has the `oui-httpd`/`menu.d`/`libuci-lua`/
  `coreutils-timeout` framework the panel needs; served files match their index SHA256.
- NOT verified on real hardware for every arch. The GUI view JS is GL 4.8.3-built; the e750 should be
  on 4.8.x. `tailscale-micro` omits netstack (userspace TCP/IP) only; it keeps DNS and does subnet /
  exit-node routing through the kernel TUN. On low-RAM boxes `-micro` is the safer build, not a fallback.

## Automatic updates
The feed rebuilds itself. A GitHub Actions workflow (`.github/workflows/build-feed.yml`) checks the
upstream `tailscale/tailscale` tags on a schedule, takes the newest **stable** release (even minor
version), and if that version has no build yet it cross-compiles every arch (full + `-micro`),
publishes the ipks as a GitHub Release, and redeploys the Pages feed (keeping the newest 7 versions).
No manual step is involved; `workflow_dispatch` allows a manual run or a forced rebuild.

On the device, run **`glits-update`** (not plain `opkg update`, which drops this unsigned feed) then
`opkg install --force-signature tailscale` (or `tailscale-micro`) to pull the newest build.

## Known deviation
Stock Tailscale firewall mark (`0x80000`)/route table. GL's e750v2 build remaps these; not applied here.
