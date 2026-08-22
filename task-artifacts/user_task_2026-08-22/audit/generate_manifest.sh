#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/audit/manifest.tsv"
if [ -e "$OUT" ]; then
  printf 'manifest_exists_abort\n' >&2
  exit 1
fi

printf 'source\tdestination\tsize_bytes\tsha256\n' > "$OUT"

add_tree() {
  local source_root="$1"
  local source_label="$2"
  local path rel size sha
  while IFS= read -r -d '' path; do
    rel="${path#"$ROOT/"}"
    size="$(stat -c '%s' "$path")"
    sha="$(sha256sum "$path" | awk '{print $1}')"
    printf '%s\t%s\t%s\t%s\n' "$source_label" "$rel" "$size" "$sha" >> "$OUT"
  done < <(find "$source_root" -type f -print0 | sort -z)
}

add_tree "$ROOT/archives" 'user-attached-archive'
add_tree "$ROOT/sources/attached-zip" 'user-attached-zip-extracted'
add_tree "$ROOT/sources/nexus-dashboard" 'nexus-dashboard-snapshot'

printf 'manifest_rows=' >&2
tail -n +2 "$OUT" | wc -l >&2
printf 'manifest_sha256=' >&2
sha256sum "$OUT" | awk '{print $1}' >&2
