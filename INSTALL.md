# Installing Tailscale + GL GUI panel from this feed

Base URL: `https://digitalcybersoft.github.io/glinet-tailscale-feed`

## Step 1 — find your architecture

On the router (SSH in):
```sh
opkg print-architecture
```
This prints the arch names your device accepts, e.g.:
```
arch all 1
arch noarch 1
arch mips_24kc 10
```
The specific one (here `mips_24kc`) is your arch. If unsure, match your SoC in the table below.

## Step 2 — add the feed source

opkg feeds are configured in `/etc/opkg/customfeeds.conf` (one `src/gz <name> <url>` line per feed).
Add your arch's feed:
```sh
ARCH=mips_24kc   # <-- replace with YOUR arch from step 1
echo "src/gz glits https://digitalcybersoft.github.io/glinet-tailscale-feed/$ARCH" >> /etc/opkg/customfeeds.conf
```
`/etc/opkg/customfeeds.conf` is for your own feeds; `/etc/opkg/distfeeds.conf` is GL's (leave it alone).

## Step 3 — signatures

This feed is **unsigned**. opkg verifies signatures globally, so either install with the
override flag each time:
```sh
opkg update
opkg install --nocheck-signature tailscale gl-sdk4-tailscale gl-sdk4-ui-tailscaleview
```
…or disable the global check once by editing `/etc/opkg.conf` and commenting the line:
```
# option check_signature 1
```
Your device keeps verifying GL's own signed feeds regardless (those live in distfeeds.conf).

## Step 4 — install

```sh
opkg update
opkg install tailscale gl-sdk4-tailscale gl-sdk4-ui-tailscaleview
```
- `tailscale` — the daemon+CLI (one binary).
- `gl-sdk4-tailscale` — GL backend (service init, rpcd handler, firewall/routing glue).
- `gl-sdk4-ui-tailscaleview` — the admin-UI panel.

If opkg complains the package arch is incompatible, append `--force-architecture` (the binary is
built for your instruction set; only the arch *string* may differ from what your firmware lists).

Low-flash devices (GL-E750 has ~16MB internal): use `tailscale-micro` instead of `tailscale`
(mips_24kc only for now), or install to storage: `opkg install -d sd tailscale` after defining an
`sd` dest in `/etc/opkg.conf`.

## Step 5 — use it

The panel appears under **Applications -> Tailscale** in the GL admin web UI (the postinst reloads
rpcd/nginx; hard-refresh the page, or reboot, if it doesn't show immediately). Or from CLI:
```sh
uci set tailscale.settings.enabled='1'; uci commit tailscale
/etc/init.d/tailscale enable; /etc/init.d/tailscale start
tailscale up
```

## Uninstall
```sh
opkg remove gl-sdk4-ui-tailscaleview gl-sdk4-tailscale tailscale
```

---

# Device → architecture map

Architecture is set by the SoC. The **SoC family** rows are authoritative; device names are
examples. Always confirm with `opkg print-architecture`.

| Feed arch | SoC family (OpenWrt target) | Endian/FPU | GL device examples |
|---|---|---|---|
| `mips_24kc` | Qualcomm QCA953x/956x, AR9331 (ath79) | big-endian, softfloat | GL-AR150, AR300M, AR750 (Creta), AR750S (Slate), **E750/E750V2 (Mudi)**, X750 (Spitz), X300B, USB150 |
| `mipsel_24kc` | MediaTek MT7620/MT7628/MT7621 (ramips) | little-endian, softfloat | GL-MT300N-V2 (Mango), MT300A, MT1300 (Beryl), SFT1200 (Opal) |
| `arm_cortex-a7` | Qualcomm IPQ40xx (ipq40xx) | little-endian, VFPv4 | GL-B1300 (Convexa-B), A1300 (Slate Plus), B2200 (Convexa-S) |
| `arm_cortex-a7_neon-vfpv4` | IPQ40xx on some firmware builds | little-endian, VFPv4 | same as above if `opkg print-architecture` shows this string |
| `arm_cortex-a15_neon-vfpv4` | Qualcomm IPQ806x | little-endian, VFPv4 | IPQ806x-based units |
| `arm_cortex-a9_vfpv3-d16` | Marvell Armada 38x (mvebu) | little-endian, VFPv3 | Armada-based units |
| `aarch64_cortex-a53` | MediaTek MT7981/MT7986 (filogic), Qualcomm IPQ60xx/IPQ807x | 64-bit | GL-MT3000 (Beryl AX), MT6000 (Flint 2), AX1800 (Flint), AXT1800 (Slate AX), MT2500 (Brume 2), X3000 (Spitz AX), XE3000 (Puli AX) |

Notes:
- The four ARM rows share **one** binary (Go `GOARM=7`, uses D0–D15 so it is valid on VFPv3-d16 and
  VFPv4 alike). If your device reports an ARM arch string not listed, use the closest ARM feed with
  `--force-architecture`.
- The two `gl-sdk4-*` GUI packages are `Architecture: all` (pure shell/Lua/JS) and work on every arch;
  each arch feed carries a copy so one feed line is all you need.
