# glinet-tailscale-feed

Self-hosted opkg feed serving a **current** Tailscale for GL.iNet **GL-E750 / GL-E750V2 (Mudi / Mudi V2)** and other `ath79 / mips_24kc` (QCA95xx) routers, after GL.iNet stopped shipping Tailscale in their feeds.

## What this is
- One combined `tailscaled` binary (CLI included via `ts_include_cli`), symlinked as `tailscale`.
- Cross-compiled from upstream Tailscale source: `GOARCH=mips GOMIPS=softfloat` (big-endian, FPU-less QCA9533), `-s -w`, feature-omit tags for size (the approach GL uses in its `small-tailscale` branch).
- Ships GL's `procd` init (`/etc/init.d/tailscale`) and `/etc/config/tailscale`.

Architecture: **mips_24kc** only (GL-E750/E750V2 = QCA9533 / ath79). Will NOT run on aarch64 (e.g. XE3000).

## Install (on the router)
```sh
echo "src/gz glimips https://digitalcybersoft.github.io/glinet-tailscale-feed/mips_24kc" >> /etc/opkg/customfeeds.conf
opkg update
opkg install --nocheck-signature tailscale
uci set tailscale.settings.enabled='1'; uci commit tailscale
/etc/init.d/tailscale enable; /etc/init.d/tailscale start
tailscale up
```
If `opkg` rejects the unsigned feed, comment out `option check_signature 1` in `/etc/opkg.conf`, then `opkg update`.

### Low flash (GL-E750 ~16MB): install to attached storage
```sh
opkg install -d sd tailscale    # 'sd' = a dest defined in /etc/opkg.conf pointing at your microSD/USB mount
```

## Known deviations from GL's build
- Stock Tailscale firewall mark (`0x80000`) / route table (52). GL's e750v2 build remaps these (`0x800000` / 55) to avoid colliding with GL's firewall when the GL GUI backend drives it. This feed ships the daemon for **CLI** management.
- The GL admin-UI Tailscale panel (`gl-sdk4-tailscale`, `gl-sdk4-ui-tailscaleview`) is **not** included — GL's closed packages, shipped only inside firmware images.
