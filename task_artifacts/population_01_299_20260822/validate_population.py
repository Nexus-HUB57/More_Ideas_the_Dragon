#!/usr/bin/env python3
"""Validate the isolated 001-299 population package without touching other repo paths."""
from pathlib import Path
import hashlib
import re
import zipfile

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "source"
EXPECTED = 299

files = sorted(SOURCE.glob("[0-9][0-9][0-9]-*"))
assert len(files) == EXPECTED, f"expected {EXPECTED} numbered files, got {len(files)}"
nums = [int(re.match(r"^(\d{3})-", f.name).group(1)) for f in files]
assert nums == list(range(1, EXPECTED + 1)), "numbered sequence is incomplete or duplicated"

checksums = ROOT / "SHA256SUMS"
for line in checksums.read_text().splitlines():
    digest, name = line.split("  ", 1)
    path = ROOT / name
    assert path.is_file(), f"missing checksum target: {name}"
    actual = hashlib.sha256(path.read_bytes()).hexdigest()
    assert actual == digest, f"checksum mismatch: {name}"

zip_path = ROOT.parent / "population_01_299_20260822.zip"
with zipfile.ZipFile(zip_path) as archive:
    bad = archive.testzip()
    assert bad is None, f"corrupt ZIP member: {bad}"
    members = set(archive.namelist())
    assert "README.md" in members and "SHA256SUMS" in members
    assert sum(name.startswith("source/") and not name.endswith("/") for name in members) == EXPECTED

print(f"OK: {EXPECTED} numbered files, SHA-256 manifest, and ZIP integrity validated")
print(f"ZIP: {zip_path.name}")
print("Safety: isolated additive path; no deletion or overwrite operation is performed")
