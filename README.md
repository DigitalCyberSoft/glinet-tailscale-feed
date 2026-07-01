# glinet-tailscale-feed

Self-hosted opkg feed that restores **Tailscale + the GL.iNet admin-UI Tailscale panel** on
GL.iNet **GL-E750 / GL-E750V2 (Mudi / Mudi V2)** and other `ath79 / mips_24kc` (QCA95xx) routers,
after GL.iNet stopped shipping it.

Architecture: **mips_24kc** only (GL-E750/E750V2 = QCA9533 / ath79). NOT for aarch64 (XE3000).

## Packages

| Package | Version | Download | Purpose |
|---|---|---|---|
| `tailscale` | 1.98.8-2 | ~8.2MB | Current tailscaled+CLI, one binary (soft-float mips). Full features. |
| `tailscale-micro` | 1.98.8-micro2 | ~5.6MB | Size-minimized (no netstack/DNS). Conflicts with `tailscale`. |
| `gl-sdk4-tailscale` | git-2025.115 | ~7KB | GL backend: init, rpcd handler, firewall/hotplug, `gl_tailscale`. |
| `gl-sdk4-ui-tailscaleview` | git-2025.244 | ~18KB | The admin-UI Tailscale panel (menu + web view + i18n). |

The two `gl-sdk4-*` packages were extracted from GL's own XE3000 firmware image (they are
architecture-independent shell/Lua/JS — no compiled code) and repackaged for `mips_24kc`.
The `tailscale` binary is cross-compiled from upstream source (`GOARCH=mips GOMIPS=softfloat`,
`ts_include_cli`, `-s -w`), the same approach as GL's `small-tailscale` branch.

## Install (full GUI panel)

```sh
echo "src/gz glimips https://digitalcybersoft.github.io/glinet-tailscale-feed/mips_24kc" >> /etc/opkg/customfeeds.conf
opkg update
opkg install --nocheck-signature tailscale gl-sdk4-tailscale gl-sdk4-ui-tailscaleview
```
The panel appears under **Applications → Tailscale** in the GL admin UI (the postinst reloads
rpcd/nginx; refresh the page, or reboot if it doesn't show). If `opkg` rejects the unsigned feed,
comment out `option check_signature` in `/etc/opkg.conf`.

### Low flash (GL-E750 ~16MB internal)
Use `tailscale-micro` instead of `tailscale`, and/or install to attached storage
(`opkg install -d sd ...` with an `sd` dest in `/etc/opkg.conf`).

## Verified / not verified
- Verified: binaries are ELF32 big-endian MIPS32 **soft-float**, run under qemu (`tailscale version`,
  `up --help`); GUI packages contain no ELF; e750 firmware 4.8.5 has the `oui-httpd`/`menu.d`/`libuci-lua`/
  `coreutils-timeout` framework the panel needs; served files match their index SHA256.
- NOT verified on real hardware. The GUI view JS is GL 4.8.3-built; the e750 should be on 4.8.x.
  `tailscale-micro` omits netstack/DNS; pair the GUI with the full `tailscale` unless flash forces micro.

## Known deviation
Stock Tailscale firewall mark (`0x80000`)/route table. GL's e750v2 build remaps these; not applied here.
