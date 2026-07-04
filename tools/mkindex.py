#!/usr/bin/env python3
"""Generate opkg Packages + Packages.gz for one architecture directory.

Reads every *.ipk in the directory (gzip-tar container), pulls its control
stanza, and appends Filename/Size/SHA256sum/MD5Sum. Emits multiple versions of
the same package name if present (rolling window) -- opkg lists all and installs
the highest by default.

Usage: mkindex.py <arch_dir> [<arch_dir> ...]
"""
import sys, os, glob, gzip, hashlib, subprocess, tarfile, io

FIELD_ORDER = ["Package", "Version", "Depends", "Source", "Section",
               "Architecture", "Installed-Size", "Provides", "Conflicts",
               "Maintainer", "Description"]

def read_control(ipk):
    """Extract ./control text from a gzip-tar OR ar ipk."""
    data = open(ipk, "rb").read()
    if data[:8] == b"!<arch>\n":
        # ar: find control.tar.gz member
        off = 8
        control_gz = None
        while off < len(data):
            hdr = data[off:off+60]; off += 60
            if len(hdr) < 60:
                break
            name = hdr[0:16].decode(errors="replace").strip()
            size = int(hdr[48:58].decode().strip())
            body = data[off:off+size]; off += size + (size & 1)
            if name.rstrip("/") == "control.tar.gz":
                control_gz = body
                break
        blob = control_gz
        with tarfile.open(fileobj=io.BytesIO(blob), mode="r:gz") as t:
            m = t.extractfile("./control")
            return m.read().decode()
    else:
        # gzip-tar: outer gz(tar(./control.tar.gz ...))
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as outer:
            cgz = outer.extractfile("./control.tar.gz").read()
        with tarfile.open(fileobj=io.BytesIO(cgz), mode="r:gz") as inner:
            return inner.extractfile("./control").read().decode()

def fields(ctrl):
    out = []
    for line in ctrl.splitlines():
        if line and not line[0].isspace() and ":" in line:
            k, v = line.split(":", 1)
            out.append((k.strip(), v.strip()))
    return out

def stanza(ipk):
    ctrl = read_control(ipk)
    fd = dict(fields(ctrl))
    b = open(ipk, "rb").read()
    lines = [f"{k}: {fd[k]}" for k in FIELD_ORDER if k in fd]
    for k, v in fields(ctrl):
        if k not in FIELD_ORDER:
            lines.append(f"{k}: {v}")
    lines.append(f"Filename: {os.path.basename(ipk)}")
    lines.append(f"Size: {len(b)}")
    lines.append(f"SHA256sum: {hashlib.sha256(b).hexdigest()}")
    lines.append(f"MD5Sum: {hashlib.md5(b).hexdigest()}")
    return "\n".join(lines) + "\n"

def main():
    for d in sys.argv[1:]:
        ipks = sorted(glob.glob(os.path.join(d, "*.ipk")))
        text = "\n".join(stanza(i) for i in ipks)
        with open(os.path.join(d, "Packages"), "w") as f:
            f.write(text)
        raw = open(os.path.join(d, "Packages"), "rb").read()
        with gzip.GzipFile(os.path.join(d, "Packages.gz"), "wb", mtime=0) as g:
            g.write(raw)
        print(f"{d}: indexed {len(ipks)} ipk(s)")

if __name__ == "__main__":
    main()
