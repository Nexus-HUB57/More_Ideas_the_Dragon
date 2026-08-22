#!/usr/bin/env bash
set -euo pipefail

NAMESPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$NAMESPACE_DIR/audit/FILES_MANIFEST_SHA256.tsv"

failures=0
rows=0

if [[ ! -f "$MANIFEST" ]]; then
  echo "FAIL: manifest not found: $MANIFEST" >&2
  exit 2
fi

header="$(head -n 1 "$MANIFEST")"
if [[ "$header" != $'relative_path\tsize_bytes\tsha256' ]]; then
  echo "FAIL: invalid manifest header" >&2
  exit 3
fi

while IFS=$'\t' read -r relative_path expected_size expected_hash; do
  [[ -n "$relative_path" ]] || continue
  rows=$((rows + 1))

  case "$relative_path" in
    /*|../*|*/../*|*/./*|./*)
      echo "FAIL: unsafe relative path: $relative_path" >&2
      failures=$((failures + 1))
      continue
      ;;
  esac

  file="$NAMESPACE_DIR/$relative_path"
  if [[ ! -f "$file" ]]; then
    echo "FAIL: missing file: $relative_path" >&2
    failures=$((failures + 1))
    continue
  fi

  actual_size="$(stat -c '%s' -- "$file")"
  actual_hash="$(sha256sum -- "$file" | awk '{print $1}')"
  if [[ "$actual_size" != "$expected_size" || "$actual_hash" != "$expected_hash" ]]; then
    echo "FAIL: checksum mismatch: $relative_path" >&2
    failures=$((failures + 1))
  fi
done < <(tail -n +2 "$MANIFEST")

while IFS= read -r -d '' archive; do
  if ! unzip -tqq "$archive" >/dev/null; then
    echo "FAIL: invalid ZIP archive: ${archive#"$NAMESPACE_DIR/"}" >&2
    failures=$((failures + 1))
  fi
done < <(find "$NAMESPACE_DIR/archives" -type f -iname '*.zip' -print0 | sort -z)

actual_files="$(find "$NAMESPACE_DIR" -type f ! -path "$MANIFEST" | wc -l)"
if [[ "$actual_files" -ne "$rows" ]]; then
  echo "FAIL: manifest row count ($rows) differs from file count excluding manifest ($actual_files)" >&2
  failures=$((failures + 1))
fi

if [[ "$failures" -ne 0 ]]; then
  echo "IMPORT_VALIDATION=FAIL failures=$failures rows=$rows" >&2
  exit 1
fi

echo "IMPORT_VALIDATION=PASS rows=$rows files=$actual_files"
