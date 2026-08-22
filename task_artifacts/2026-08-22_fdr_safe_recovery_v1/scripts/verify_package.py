#!/usr/bin/env python3
"""Static safety checks for the sanitized FDR package."""
from pathlib import Path
import hashlib
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
FORBIDDEN = re.compile(
    r"(5[HJK][1-9A-HJ-NP-Za-km-z]{49}|[KL][1-9A-HJ-NP-Za-km-z]{51}|xprv|yprv|zprv|BEGIN [A-Z0-9 ]*PRIVATE KEY)",
    re.IGNORECASE,
)
ALLOWED_BINARY = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip"}

failures = []
for path in sorted(ROOT.rglob("*")):
    if not path.is_file() or ".git" in path.parts:
        continue
    if path.suffix.lower() in ALLOWED_BINARY:
        continue
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError as exc:
        failures.append(f"unreadable: {path}: {exc}")
        continue
    if path.name == Path(__file__).name:
        continue
    if FORBIDDEN.search(text):
        failures.append(f"sensitive pattern: {path}")

if failures:
    print("PACKAGE CHECK FAILED")
    print("\n".join(failures))
    sys.exit(1)

print(f"PACKAGE CHECK PASSED: {sum(p.is_file() for p in ROOT.rglob('*'))} files")
for path in sorted(p for p in ROOT.rglob('*') if p.is_file()):
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    print(f"{digest}  {path.relative_to(ROOT)}")
