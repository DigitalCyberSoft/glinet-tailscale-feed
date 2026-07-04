#!/usr/bin/env python3
"""Build an OpenWrt .ipk in the gzip-tar container format that GL.iNet opkg
actually extracts. (ar/deb-2.0 ipks install with zero files on GL's opkg build;
see the repo history for the on-device diagnosis.)

Container layout (matches GL's own packages):
    <ipk> = gzip( tar( ./debian-binary, ./data.tar.gz, ./control.tar.gz ) )

Usage:
    mkipk.py --name tailscale --version 1.98.8-2 --arch mips_24kc \
             --section net --depends "libc, ca-bundle, kmod-tun" \
             --provides tailscaled --desc "..." \
             --data-dir staged/ --out out/tailscale_1.98.8-2_mips_24kc.ipk
"""
import argparse, io, os, subprocess, tarfile, tempfile, gzip, shutil, sys

def dir_installed_size(path):
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files + _dirs:
            fp = os.path.join(root, f)
            try:
                total += os.lstat(fp).st_size
            except OSError:
                pass
    return total

def make_tar_gz(src_dir, out_path):
    """gzip-tar of the contents of src_dir with ./ prefixed, numeric root owner,
    reproducible (fixed mtime), so repeated builds are byte-stable."""
    # Deterministic: sort entries, fixed mtime, uid/gid 0.
    entries = []
    for root, dirs, files in os.walk(src_dir):
        dirs.sort()
        for name in sorted(dirs) + sorted(files):
            full = os.path.join(root, name)
            rel = "./" + os.path.relpath(full, src_dir)
            entries.append((full, rel))
    entries.sort(key=lambda e: e[1])
    raw = io.BytesIO()
    with tarfile.open(fileobj=raw, mode="w") as tar:
        # include the top-level "./" dir entry
        top = tarfile.TarInfo("./"); top.type = tarfile.DIRTYPE; top.mode = 0o755
        top.mtime = 0
        tar.addfile(top)
        for full, rel in entries:
            ti = tar.gettarinfo(full, rel)
            ti.uid = ti.gid = 0
            ti.uname = ti.gname = ""
            ti.mtime = 0
            if ti.isreg():
                with open(full, "rb") as f:
                    tar.addfile(ti, f)
            else:
                tar.addfile(ti)
    with open(out_path, "wb") as fo:
        with gzip.GzipFile(fileobj=fo, mode="wb", mtime=0) as gz:
            gz.write(raw.getvalue())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True)
    ap.add_argument("--version", required=True)
    ap.add_argument("--arch", required=True)
    ap.add_argument("--section", default="net")
    ap.add_argument("--depends", default="")
    ap.add_argument("--provides", default="")
    ap.add_argument("--conflicts", default="")
    ap.add_argument("--maintainer", default="DigitalCyberSoft <noreply@users.noreply.github.com>")
    ap.add_argument("--desc", default="")
    ap.add_argument("--data-dir", required=True, help="staged root of installed files")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    work = tempfile.mkdtemp()
    try:
        # data.tar.gz
        data_tgz = os.path.join(work, "data.tar.gz")
        make_tar_gz(a.data_dir, data_tgz)

        # control file
        inst = dir_installed_size(a.data_dir)
        ctrl_lines = [
            f"Package: {a.name}",
            f"Version: {a.version}",
        ]
        if a.depends:   ctrl_lines.append(f"Depends: {a.depends}")
        if a.provides:  ctrl_lines.append(f"Provides: {a.provides}")
        if a.conflicts: ctrl_lines.append(f"Conflicts: {a.conflicts}")
        ctrl_lines += [
            f"Section: {a.section}",
            f"Architecture: {a.arch}",
            f"Installed-Size: {inst}",
            f"Maintainer: {a.maintainer}",
            f"Description: {a.desc}",
        ]
        ctrl_text = "\n".join(ctrl_lines) + "\n"

        ctrl_dir = os.path.join(work, "control")
        os.makedirs(ctrl_dir)
        with open(os.path.join(ctrl_dir, "control"), "w") as f:
            f.write(ctrl_text)
        control_tgz = os.path.join(work, "control.tar.gz")
        make_tar_gz(ctrl_dir, control_tgz)

        # debian-binary
        deb = os.path.join(work, "debian-binary")
        with open(deb, "w") as f:
            f.write("2.0\n")

        # wrap as gzip-tar, GL member order: debian-binary, data.tar.gz, control.tar.gz
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        subprocess.run(
            ["tar", "--numeric-owner", "--owner=0", "--group=0", "--mtime=@0",
             "-czf", os.path.abspath(a.out),
             "-C", work, "./debian-binary", "./data.tar.gz", "./control.tar.gz"],
            check=True,
        )
        print(f"{a.out}  ({os.path.getsize(a.out)} bytes, installed {inst})")
    finally:
        shutil.rmtree(work, ignore_errors=True)

if __name__ == "__main__":
    main()
