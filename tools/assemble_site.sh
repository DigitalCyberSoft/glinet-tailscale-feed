#!/usr/bin/env bash
# Assemble the full opkg feed site into $1 for GitHub Pages:
#   static root files + per-arch dirs holding the static GUI ipks + the newest
#   $KEEP tailscale releases' ipks + regenerated Packages/Packages.gz.
#
# Requires: gh (authenticated via GITHUB_TOKEN), python3.
set -euo pipefail

SITE="${1:?usage: assemble_site.sh <output-site-dir>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS="$ROOT/tools"
KEEP="${KEEP:-7}"
ARCHES="mips_24kc mipsel_24kc arm_cortex-a7 arm_cortex-a7_neon-vfpv4 arm_cortex-a15_neon-vfpv4 arm_cortex-a9_vfpv3-d16 aarch64_cortex-a53"

rm -rf "$SITE"; mkdir -p "$SITE"

# static root files
for f in index.html README.md INSTALL.md setup.sh .nojekyll; do
  [ -e "$ROOT/$f" ] && cp "$ROOT/$f" "$SITE/"
done

# per-arch dirs seeded with the static GUI ipks (Architecture: all)
for a in $ARCHES; do
  mkdir -p "$SITE/$a"
  cp "$ROOT"/gui/*_all.ipk "$SITE/$a/"
done

# newest $KEEP tailscale releases (tag ts-<ver>) -> place per-arch ipks
mapfile -t rels < <(gh release list -R "$GITHUB_REPOSITORY" --limit 300 \
  --json tagName --jq '.[].tagName' | grep '^ts-' | sort -V | tail -"$KEEP")
echo "retaining ${#rels[@]} release(s): ${rels[*]:-<none yet>}"

tmp="$(mktemp -d)"
for r in "${rels[@]:-}"; do
  [ -n "$r" ] || continue
  gh release download "$r" -R "$GITHUB_REPOSITORY" -D "$tmp/$r" -p '*.ipk'
  for a in $ARCHES; do
    # arch-specific ipks end in _<arch>.ipk; the longer arch strings don't
    # collide because the suffix must match exactly.
    find "$tmp/$r" -name "*_${a}.ipk" -exec cp {} "$SITE/$a/" \;
  done
done

python3 "$TOOLS/mkindex.py" $(for a in $ARCHES; do printf '%s ' "$SITE/$a"; done)

echo "== assembled site =="
find "$SITE" -maxdepth 2 -name '*.ipk' -printf '%P\n' | sort
