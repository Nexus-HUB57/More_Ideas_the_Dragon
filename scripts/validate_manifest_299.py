#!/usr/bin/env python3
"""Validate a JSON manifest without modifying repository contents.

Usage:
    python3 scripts/validate_manifest_299.py manifest_phd_299.json

The script reports declared count, uniqueness, missing paths, and SHA-256
checksums when the manifest provides a checksum field. It intentionally does
not create, delete, or overwrite files.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {sys.argv[0]} MANIFEST.json", file=sys.stderr)
        return 2

    manifest_path = Path(sys.argv[1]).resolve()
    root = Path.cwd().resolve()
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("manifest must be a JSON list")

    entries: list[tuple[str, str | None]] = []
    for item in data:
        if isinstance(item, str):
            entries.append((item, None))
        elif isinstance(item, dict) and isinstance(item.get("path"), str):
            checksum = item.get("sha256") or item.get("checksum")
            entries.append((item["path"], checksum if isinstance(checksum, str) else None))
        else:
            raise ValueError(f"invalid manifest entry: {item!r}")

    missing: list[str] = []
    mismatched: list[str] = []
    for relative, expected in entries:
        path = (root / relative).resolve()
        if not path.is_relative_to(root) or not path.exists():
            missing.append(relative)
            continue
        if expected and sha256(path).lower() != expected.lower():
            mismatched.append(relative)

    print(f"manifest={manifest_path}")
    print(f"declared={len(entries)}")
    print(f"unique={len({path for path, _ in entries})}")
    print(f"missing={len(missing)}")
    print(f"checksum_mismatches={len(mismatched)}")
    if missing:
        print("missing_paths:")
        print("\n".join(f"- {path}" for path in missing))
    if mismatched:
        print("checksum_mismatches_paths:")
        print("\n".join(f"- {path}" for path in mismatched))

    return 1 if missing or mismatched else 0


if __name__ == "__main__":
    raise SystemExit(main())
