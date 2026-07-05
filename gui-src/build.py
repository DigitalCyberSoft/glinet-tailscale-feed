#!/usr/bin/env python3
"""Reproducible builder for the GL.iNet GUI .ipk packages.

GL's opkg only extracts the *gzip-tar* container (an ar/deb-2.0 .ipk installs
zero files on GL's opkg), so that is what this produces:

    <ipk> = gzip( tar( ./debian-binary, ./data.tar.gz, ./control.tar.gz ) )

Each package lives in its own directory here, holding:

    <pkg>/control          the opkg control file (Version line is the source of truth)
    <pkg>/data/<tree>      the exact installed file layout

Editable frontend source: gl-sdk4-ui-tailscaleview keeps the *decompressed*
Vue bundle at data/www/views/view.js. At build time it is gzipped into the
shipped gl-sdk4-ui-tailscaleview.common.js.gz (view.js itself is not packaged).

Usage:
    ./build.py                 # rebuild every package here -> ../gui/
    ./build.py <pkgdir> ...    # rebuild specific package dir(s)

Output is deterministic (fixed mtime, sorted entries, uid/gid 0), so repeated
builds of the same source are byte-stable.
"""
import io, os, re, sys, gzip, shutil, tarfile, tempfile, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT  = os.path.abspath(os.path.join(HERE, "..", "gui"))

def make_tar_gz(src_dir, out_path):
    """Deterministic gzip-tar of src_dir's contents, ./ prefixed."""
    entries = []
    for root, dirs, files in os.walk(src_dir):
        dirs.sort()
        for name in sorted(dirs) + sorted(files):
            full = os.path.join(root, name)
            entries.append((full, "./" + os.path.relpath(full, src_dir)))
    entries.sort(key=lambda e: e[1])
    raw = io.BytesIO()
    with tarfile.open(fileobj=raw, mode="w") as tar:
        top = tarfile.TarInfo("./"); top.type = tarfile.DIRTYPE; top.mode = 0o755; top.mtime = 0
        tar.addfile(top)
        for full, rel in entries:
            ti = tar.gettarinfo(full, rel)
            ti.uid = ti.gid = 0; ti.uname = ti.gname = ""; ti.mtime = 0
            if ti.isreg():
                with open(full, "rb") as f:
                    tar.addfile(ti, f)
            else:
                tar.addfile(ti)
    with open(out_path, "wb") as fo:
        with gzip.GzipFile(fileobj=fo, mode="wb", mtime=0) as gz:
            gz.write(raw.getvalue())

def gzip_file(src, dst):
    with open(src, "rb") as f:
        data = f.read()
    with open(dst, "wb") as fo:
        with gzip.GzipFile(fileobj=fo, mode="wb", mtime=0) as gz:
            gz.write(data)

def build(pkgdir):
    ctrl = open(os.path.join(pkgdir, "control")).read()
    name = re.search(r"^Package:\s*(\S+)", ctrl, re.M).group(1)
    ver  = re.search(r"^Version:\s*(\S+)",  ctrl, re.M).group(1)
    arch = re.search(r"^Architecture:\s*(\S+)", ctrl, re.M).group(1)
    work = tempfile.mkdtemp()
    try:
        stage = os.path.join(work, "data")
        shutil.copytree(os.path.join(pkgdir, "data"), stage)
        # frontend: compile the editable view.js -> shipped .common.js.gz
        vjs = os.path.join(stage, "www", "views", "view.js")
        if os.path.exists(vjs):
            gzip_file(vjs, os.path.join(stage, "www", "views",
                                        "gl-sdk4-ui-tailscaleview.common.js.gz"))
            os.remove(vjs)
        make_tar_gz(stage, os.path.join(work, "data.tar.gz"))
        cdir = os.path.join(work, "control"); os.makedirs(cdir)
        with open(os.path.join(cdir, "control"), "w") as f:
            f.write(ctrl)
        # optional control scripts: ship <pkgdir>/postinst (etc.) in control.tar.gz
        for script in ("preinst", "postinst", "prerm", "postrm"):
            sp = os.path.join(pkgdir, script)
            if os.path.exists(sp):
                dp = os.path.join(cdir, script)
                shutil.copyfile(sp, dp)
                os.chmod(dp, 0o755)
        make_tar_gz(cdir, os.path.join(work, "control.tar.gz"))
        with open(os.path.join(work, "debian-binary"), "w") as f:
            f.write("2.0\n")
        os.makedirs(OUT, exist_ok=True)
        # Debian convention: the epoch (everything up to and including the first
        # ':') stays in the Version metadata but is omitted from the .ipk filename --
        # a colon in a served filename/URL is fragile. mkindex reads Version from the
        # control (with epoch) and Filename from disk (without), so they stay in sync.
        file_ver = ver.split(":", 1)[1] if ":" in ver else ver
        out = os.path.join(OUT, f"{name}_{file_ver}_{arch}.ipk")
        subprocess.run(
            ["tar", "--numeric-owner", "--owner=0", "--group=0", "--mtime=@0",
             "-czf", out, "-C", work,
             "./debian-binary", "./data.tar.gz", "./control.tar.gz"], check=True)
        print(f"built {os.path.relpath(out, HERE)}  ({os.path.getsize(out)} bytes)")
    finally:
        shutil.rmtree(work, ignore_errors=True)

def main():
    args = sys.argv[1:]
    if not args:
        args = [os.path.join(HERE, d) for d in sorted(os.listdir(HERE))
                if os.path.isdir(os.path.join(HERE, d))
                and os.path.exists(os.path.join(HERE, d, "control"))]
    for a in args:
        build(a)

if __name__ == "__main__":
    main()
