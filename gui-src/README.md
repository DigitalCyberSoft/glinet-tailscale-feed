# GUI package sources

Editable source for the two GL.iNet admin-panel packages this feed ships. The
built `.ipk`s in [`../gui/`](../gui) are produced from here by `build.py`; edit
the source, rerun the builder, and republish.

## Packages

- **`gl-sdk4-tailscale/`** — the Tailscale integration: the `gl_tailscale`
  control script, the oui-httpd RPC handler (`usr/lib/oui-httpd/rpc/tailscale`),
  the firewall helper (`etc/firewall.tailscale.sh`), init/hotplug, and config.
- **`gl-sdk4-ui-tailscaleview/`** — the Vue panel: the view bundle
  (`data/www/views/view.js`, *decompressed* and editable), i18n, and the menu.

Each package dir holds `control` (the `Version:` line is the source of truth for
the built filename) and `data/` (the exact installed file layout).

## Build

```sh
./build.py                 # rebuild every package -> ../gui/
./build.py gl-sdk4-tailscale   # rebuild one
```

`build.py` writes the **gzip-tar** container GL's opkg actually extracts
(`gzip(tar(./debian-binary, ./data.tar.gz, ./control.tar.gz))`) — an ar/deb-2.0
`.ipk` installs zero files on GL's opkg. Output is deterministic (fixed mtime,
sorted entries, uid/gid 0), so repeated builds are byte-stable.

For `gl-sdk4-ui-tailscaleview`, the editable `data/www/views/view.js` is gzipped
into the shipped `gl-sdk4-ui-tailscaleview.common.js.gz` at build time; `view.js`
itself is not packaged. To change the panel, edit `view.js` (it is the compiled
Vue render bundle — minified but valid JS; `node --check view.js` after editing),
rebuild, and republish.

## Publish

`.github/workflows/build-feed.yml` runs `tools/assemble_site.sh`, which copies
`gui/*_all.ipk` into every arch dir and regenerates the `Packages` index. After
rebuilding, commit the new `../gui/*.ipk` and trigger the workflow
(`gh workflow run build-feed.yml`).

## Bumping a version

Increment the packaging revision (the trailing `-N`) in the package's `control`
`Version:` line, rebuild, remove the old `../gui/*.ipk`, and publish. opkg uses
the version to decide upgrades.

## Notes

- Installed-Size in `control` is informational; it is left at GL's original
  declared value and not recomputed.
- The Tailscale *binary* (`tailscale`/`tailscale-micro`) is a separate build
  from upstream source; see [`../tools/build_release.sh`](../tools/build_release.sh).
