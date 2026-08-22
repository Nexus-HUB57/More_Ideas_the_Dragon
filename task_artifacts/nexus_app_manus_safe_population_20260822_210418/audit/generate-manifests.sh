#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/audit"
MANIFEST="$OUT/MANIFEST.tsv"
SUMS="$OUT/SHA256SUMS.txt"
SUMMARY="$OUT/SUMMARY.txt"

printf 'destination_path\tsize_bytes\tsha256\n' > "$MANIFEST"
: > "$SUMS"

FILES_LIST="$OUT/.manifest-inputs"
{
  printf '%s\n' "$ROOT/README.md"
  printf '%s\n' "$ROOT/audit/IMPORT_POLICY.md"
  printf '%s\n' "$ROOT/audit/REPO_BASELINE.md"
  printf '%s\n' "$ROOT/audit/generate-manifests.sh"
  find "$ROOT/source" -type f
  printf '%s\n' "$ROOT/archives/AplicativoFullstackNexus_sanitized.zip"
} | sort > "$FILES_LIST"

while IFS= read -r file; do
  rel="${file#$ROOT/}"
  size="$(stat -c '%s' "$file")"
  sha="$(sha256sum "$file" | cut -d' ' -f1)"
  printf '%s\t%s\t%s\n' "$rel" "$size" "$sha" >> "$MANIFEST"
  printf '%s  %s\n' "$sha" "$rel" >> "$SUMS"
done < "$FILES_LIST"

source_files="$(find "$ROOT/source" -type f | wc -l)"
tracked_archive_files=1
all_archive_files="$(find "$ROOT/archives" -maxdepth 1 -type f -name '*.zip' | wc -l)"
metadata_files=4
manifest_input_files="$(wc -l < "$FILES_LIST")"
source_bytes="$(du -sb "$ROOT/source" | cut -f1)"
archive_bytes="$(du -sb "$ROOT/archives" | cut -f1)"
manifest_rows="$(tail -n +2 "$MANIFEST" | wc -l)"

{
  printf 'bundle_root=%s\n' "$ROOT"
  printf 'source_files=%s\n' "$source_files"
  printf 'tracked_archive_files=%s\n' "$tracked_archive_files"
  printf 'all_archive_files=%s\n' "$all_archive_files"
  printf 'manifest_input_files=%s\n' "$manifest_input_files"
  printf 'manifest_rows=%s\n' "$manifest_rows"
  printf 'source_bytes=%s\n' "$source_bytes"
  printf 'archive_bytes=%s\n' "$archive_bytes"
  printf 'generated_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$SUMMARY"

printf 'Manifest generated: %s\n' "$MANIFEST"
printf 'Source files: %s\n' "$source_files"
printf 'Tracked archive files: %s\n' "$tracked_archive_files"
printf 'All archive files: %s\n' "$all_archive_files"
printf 'Manifest input files: %s\n' "$manifest_input_files"
printf 'Manifest rows: %s\n' "$manifest_rows"
