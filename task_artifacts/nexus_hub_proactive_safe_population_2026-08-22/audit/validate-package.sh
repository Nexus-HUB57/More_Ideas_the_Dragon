#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$ROOT/audit/MANIFEST.sha256"
EXPECTED_TOTAL=316
EXPECTED_MANIFEST=313

actual_total="$(find "$ROOT" -type f | wc -l | tr -d ' ')"
manifest_total="$(grep -cve '^$' "$MANIFEST")"

[ "$actual_total" -eq "$EXPECTED_TOTAL" ] || { echo "FAIL: total=$actual_total expected=$EXPECTED_TOTAL"; exit 1; }
[ "$manifest_total" -eq "$EXPECTED_MANIFEST" ] || { echo "FAIL: manifest=$manifest_total expected=$EXPECTED_MANIFEST"; exit 1; }

if find "$ROOT" -type f -name '.env' -print -quit | grep -q .; then
  echo "FAIL: real .env found"
  exit 1
fi

if find "$ROOT" -type d \( -name .git -o -name node_modules -o -name dist -o -name .manus-logs -o -name _outer -o -name _nested \) -print -quit | grep -q .; then
  echo "FAIL: generated or temporary directory found"
  exit 1
fi

( cd "$ROOT" && sha256sum -c audit/MANIFEST.sha256 >/dev/null )
echo "OK: package=$actual_total manifest=$manifest_total"
