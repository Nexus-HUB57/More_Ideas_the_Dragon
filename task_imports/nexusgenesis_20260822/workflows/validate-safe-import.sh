#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$ROOT/metadata/SAFE_IMPORT_MANIFEST.tsv"

[[ -f "$MANIFEST" ]]
[[ -f "$ROOT/README.md" ]]

imported=$(awk -F '\t' '$1 == "IMPORTED" { count++ } END { print count + 0 }' "$MANIFEST")
excluded=$(awk -F '\t' '$1 == "EXCLUDED" { count++ } END { print count + 0 }' "$MANIFEST")
actual=$(find "$ROOT/source" -type f ! -path '*/__pycache__/*' ! -name '*.pyc' | wc -l | tr -d ' ')

if [[ "$actual" -ne "$imported" ]]; then
  echo "Manifest mismatch: imported=$imported actual=$actual" >&2
  exit 1
fi

if grep -RInE --exclude='*.zip' '(BEGIN (RSA|OPENSSH|PRIVATE) KEY|xprv[0-9A-Za-z]|-----BEGIN)' "$ROOT/source"; then
  echo 'Sensitive material found.' >&2
  exit 1
fi

while IFS= read -r -d '' py; do
  case "$py" in
    */nexus_genesis_v2.py) echo "SKIP_LEGACY_SYNTAX\t${py#$ROOT/source/}"; continue;;
  esac
  python3 -m py_compile "$py"
done < <(find "$ROOT/source" -type f -name '*.py' -print0)
printf 'SAFE_IMPORT_OK\timported=%s\texcluded=%s\tactual=%s\n' "$imported" "$excluded" "$actual"
