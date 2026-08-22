#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
find "$ROOT/source" -type f -print0 | sort -z | xargs -0 sha256sum > "$ROOT/validation/SHA256SUMS.txt"
sha256sum -c "$ROOT/validation/SHA256SUMS.txt"
test "$(find "$ROOT/source" -type f | wc -l)" -eq 7
if grep -RInE '5J8f7aw|Benjamin2020|BEGIN .*PRIVATE' "$ROOT/source"; then
  echo 'FAIL: segredo detectado no material-fonte' >&2
  exit 1
fi
printf 'PASS: pacote Bitcoin P2PKH íntegro e sem segredos\n'
