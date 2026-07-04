#!/usr/bin/env bash
# Build tailscale (full + micro) from a tailscale source checkout for every GL
# target architecture and package each as a gzip-tar .ipk under $OUT/<arch>/.
#
# gzip-tar (not ar) is mandatory: GL's opkg silently fails to extract the data
# member of an ar/deb-2.0 ipk. See tools/mkipk.py and the repo history.
#
# Env:
#   TS_SRC   path to a tailscale checkout at the release tag (has build_dist.sh)
#   TS_VER   tailscale version, e.g. 1.98.8
#   PKG_REV  packaging revision (default 1)
#   OUT      output dir (creates $OUT/<arch>/*.ipk and $OUT/bin/*)
set -euo pipefail

TS_SRC="${TS_SRC:?set TS_SRC to a tailscale checkout}"
TS_VER="${TS_VER:?set TS_VER e.g. 1.98.8}"
PKG_REV="${PKG_REV:-1}"
OUT="${OUT:?set OUT}"
TOOLS="$(cd "$(dirname "$0")" && pwd)"

DEPS="libc, ca-bundle, kmod-tun"
mkdir -p "$OUT/bin"

# --- compile: one binary per instruction set --------------------------------
# build_dist.sh --box => ts_include_cli (combined tailscaled+CLI, argv0 dispatch)
#                --extra-small => minimized feature set (the "micro" build)
build() { # $1=label $2=goarch $3="ENV=VAL ..." $4=extra_flags
  local label="$1" goarch="$2" goenv="$3" flags="$4"
  echo ">>> build $label ($goarch $goenv $flags)"
  ( cd "$TS_SRC"
    env CGO_ENABLED=0 GOOS=linux GOARCH="$goarch" $goenv \
      ./build_dist.sh $flags --box -o "$OUT/bin/tailscaled-$label" ./cmd/tailscaled )
}

build mips   mips   "GOMIPS=softfloat" ""
build mipsle mipsle "GOMIPS=softfloat" ""
build arm    arm    "GOARM=7"          ""
build arm64  arm64  ""                 ""
build micro-mips mips "GOMIPS=softfloat" "--extra-small"

# --- package: stage installed layout then build the ipk ---------------------
pack() { # $1=archdir $2=binary_path $3=pkgname(tailscale|tailscale-micro)
  local archdir="$1" bin="$2" pkg="$3" ver deps prov conf desc s
  s="$OUT/stage/${pkg}_${archdir}"
  rm -rf "$s"; mkdir -p "$s/usr/sbin" "$s/lib/upgrade/keep.d"
  install -m0755 "$bin" "$s/usr/sbin/tailscaled"
  ln -sf tailscaled "$s/usr/sbin/tailscale"
  printf '/etc/config/tailscale\n/etc/tailscale/\n' > "$s/lib/upgrade/keep.d/tailscale"
  if [ "$pkg" = tailscale ]; then
    ver="${TS_VER}-${PKG_REV}"; prov="tailscaled"; conf=""
    desc="Tailscale (tailscale) for ${archdir}, current ${TS_VER} softfloat/vfp. Binary only; GUI via gl-sdk4-tailscale."
  else
    ver="${TS_VER}-micro${PKG_REV}"; prov="tailscale, tailscaled"; conf="tailscale"
    desc="Tailscale (tailscale-micro) for ${archdir}, current ${TS_VER}, size-minimized. Binary only; GUI via gl-sdk4-tailscale."
  fi
  mkdir -p "$OUT/$archdir"
  python3 "$TOOLS/mkipk.py" --name "$pkg" --version "$ver" --arch "$archdir" \
    --section net --depends "$DEPS" --provides "$prov" ${conf:+--conflicts "$conf"} \
    --desc "$desc" --data-dir "$s" \
    --out "$OUT/$archdir/${pkg}_${ver}_${archdir}.ipk"
}

# archdir  ->  which compiled binary it uses
pack mips_24kc                 "$OUT/bin/tailscaled-mips"   tailscale
pack mipsel_24kc               "$OUT/bin/tailscaled-mipsle" tailscale
pack arm_cortex-a7             "$OUT/bin/tailscaled-arm"    tailscale
pack arm_cortex-a7_neon-vfpv4  "$OUT/bin/tailscaled-arm"    tailscale
pack arm_cortex-a15_neon-vfpv4 "$OUT/bin/tailscaled-arm"    tailscale
pack arm_cortex-a9_vfpv3-d16   "$OUT/bin/tailscaled-arm"    tailscale
pack aarch64_cortex-a53        "$OUT/bin/tailscaled-arm64"  tailscale
# micro: mips_24kc only (matches the shipped feed)
pack mips_24kc                 "$OUT/bin/tailscaled-micro-mips" tailscale-micro

echo ">>> done. ipks:"
find "$OUT" -name '*.ipk' -printf '  %p  %s bytes\n' | sort
