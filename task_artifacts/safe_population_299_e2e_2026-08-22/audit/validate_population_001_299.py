#!/usr/bin/env python3
"""Validate that artifacts/end-to-end/001-299 contains exactly 299 numbered files."""
from pathlib import Path
import hashlib
import re
import sys

ROOT = Path(__file__).resolve().parents[3] / "artifacts" / "end-to-end" / "001-299"
OUT = Path(__file__).with_name("MANIFEST_001_299.tsv")

pattern = re.compile(r"^(\d{3})-[^/]+$")
files = sorted(p for p in ROOT.iterdir() if p.is_file()) if ROOT.exists() else []
rows = []
seen = set()
errors = []
for path in files:
    match = pattern.match(path.name)
    if not match:
        errors.append(f"unexpected_name:{path.name}")
        continue
    number = int(match.group(1))
    if number in seen:
        errors.append(f"duplicate_number:{number:03d}")
    seen.add(number)
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    rows.append((number, path.name, path.stat().st_size, digest))

missing = sorted(set(range(1, 300)) - seen)
for number in missing:
    errors.append(f"missing_number:{number:03d}")
if len(files) != 299:
    errors.append(f"file_count:{len(files)}")

rows.sort()
with OUT.open("w", encoding="utf-8") as handle:
    handle.write("number\tfile\tbytes\tsha256\n")
    for number, name, size, digest in rows:
        handle.write(f"{number:03d}\t{name}\t{size}\t{digest}\n")

print(f"root={ROOT}")
print(f"entries={len(files)}")
print(f"numbered={len(rows)}")
print(f"missing={missing}")
print(f"errors={len(errors)}")
print(f"manifest={OUT}")
if errors:
    for error in errors:
        print(error, file=sys.stderr)
    raise SystemExit(1)

