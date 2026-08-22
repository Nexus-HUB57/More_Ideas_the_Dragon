#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
test -d source
test -f SHA256SUMS.txt
test -f MANIFEST.paths.txt
sha256sum --check --quiet SHA256SUMS.txt
actual=$(find source -type f | wc -l)
expected=$(wc -l < MANIFEST.paths.txt)
test "$actual" -eq "$expected"
echo "VALIDATION_OK files=$actual"
