#!/usr/bin/env python3
"""Validate the Legado Lucas task bundle without mutating repository content."""
from __future__ import annotations

import hashlib
import sys
import zipfile
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: validate_legado_bundle.py BUNDLE_DIR", file=sys.stderr)
        return 2
    bundle = Path(sys.argv[1]).resolve()
    if not bundle.is_dir():
        print(f"missing bundle: {bundle}", file=sys.stderr)
        return 2

    files = sorted(p for p in bundle.rglob("*") if p.is_file() and p.name != bundle.name + ".zip")
    if not files:
        print("bundle is empty", file=sys.stderr)
        return 1

    checksums = bundle / "validation" / "SHA256SUMS_FINAL.txt"
    if checksums.exists():
        expected = {}
        for line in checksums.read_text(encoding="utf-8").splitlines():
            if line.strip():
                digest, rel = line.split("  ", 1)
                expected[rel] = digest
        for rel, digest in expected.items():
            target = bundle / rel
            if not target.is_file() or sha256(target) != digest:
                print(f"checksum mismatch: {rel}", file=sys.stderr)
                return 1

    zip_candidates = sorted(bundle.parent.glob(bundle.name + ".zip"))
    if zip_candidates:
        with zipfile.ZipFile(zip_candidates[-1]) as archive:
            names = set(archive.namelist())
        prefix = bundle.name + "/"
        missing = [str(p.relative_to(bundle)) for p in files if prefix + str(p.relative_to(bundle)) not in names]
        if missing:
            print("ZIP missing files:", *missing, sep="\n", file=sys.stderr)
            return 1

    print(f"OK: {len(files)} files validated in {bundle}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
