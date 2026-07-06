#!/usr/bin/env bash
# Package the static GUI ipks from gui-src/ into gui/ as gzip-tar containers (the
# only .ipk format GL's opkg extracts; see tools/mkipk.py for the ar-vs-gzip-tar
# history). Architecture: all.
#
# Per-package transform:
#   gl-sdk4-ui-tailscaleview ships its view as www/views/<pkg>.common.js.gz -- that
#   is the exact path GL's panel loads (nginx gzip_static serves it for the
#   uncompressed request). gui-src keeps the readable, beautified view.js for small
#   diffs; this script renames+gzips it at pack time. Shipping the raw view.js
#   instead leaves /views/<pkg>.common.js absent and the panel dies with a request
#   timeout -- and drops the file the Mullvad patch (patch-view.lua) rewrites.
#
# Container: gzip( tar( ./debian-binary, ./data.tar.gz, ./control.tar.gz ) ),
# member order and tar flags matching tools/mkipk.py so all our ipks are uniform.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/gui-src"
OUT="$ROOT/gui"
# gl-sdk4-tailscale-mullvad lives in its own repo (glinet-tailscale-mullvad) and is
# built there; it is not packaged here.
PKGS=(gl-sdk4-tailscale gl-sdk4-ui-tailscaleview)

TARFLAGS=(--numeric-owner --owner=0 --group=0 --mtime=@0 --format=gnu)

pack() { # $1 = package source dir name
  local name="$1" src="$SRC/$1"
  [ -d "$src" ] || { echo "skip $1 (no gui-src dir)"; return 0; }

  local ver arch filever
  ver="$(sed -n 's/^Version:[[:space:]]*//p' "$src/control")"
  arch="$(sed -n 's/^Architecture:[[:space:]]*//p' "$src/control")"
  filever="${ver#*:}"   # strip epoch for the filename (Debian convention)

  local work; work="$(mktemp -d)"
  trap 'rm -rf "$work"' RETURN
  mkdir -p "$work/data" "$work/ctrl"

  # staged installed tree
  cp -a "$src/data/." "$work/data/"

  # view package: view.js -> <pkg>.common.js.gz (the panel's real entry point)
  if [ -f "$work/data/www/views/view.js" ]; then
    gzip -9 -n -c "$work/data/www/views/view.js" > "$work/data/www/views/${name}.common.js.gz"
    rm -f "$work/data/www/views/view.js"
  fi

  # debian-binary
  printf '2.0\n' > "$work/debian-binary"
  # data.tar.gz (./ prefixed, modes preserved from source)
  tar "${TARFLAGS[@]}" -C "$work/data" -czf "$work/data.tar.gz" ./

  # control.tar.gz: control (644) + maintainer scripts (755) if present
  cp "$src/control" "$work/ctrl/control"; chmod 644 "$work/ctrl/control"
  local members="./control" s
  for s in preinst postinst prerm postrm; do
    if [ -f "$src/$s" ]; then cp "$src/$s" "$work/ctrl/$s"; chmod 755 "$work/ctrl/$s"; members="$members ./$s"; fi
  done
  ( cd "$work/ctrl" && tar "${TARFLAGS[@]}" -czf "$work/control.tar.gz" $members )

  local ipk="$OUT/${name}_${filever}_${arch}.ipk"
  rm -f "$ipk"
  tar "${TARFLAGS[@]}" -C "$work" -czf "$ipk" ./debian-binary ./data.tar.gz ./control.tar.gz
  echo "built ${ipk#$ROOT/}  (Version: $ver)"
}

for p in "${PKGS[@]}"; do pack "$p"; done
