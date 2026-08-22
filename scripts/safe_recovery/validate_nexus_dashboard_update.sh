#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-$(git rev-parse --show-toplevel)}"
IMPORT_ROOT="$REPO/imports/nexus-hub-dashboard-task-2026-08-22"
MANIFEST="$IMPORT_ROOT/manifests/files.tsv"

cd "$REPO"

status="$(git status --porcelain=v1)"
if [[ -n "$status" ]]; then
  printf 'WORKTREE_NOT_CLEAN\n%s\n' "$status"
  exit 1
fi

branch="$(git branch --show-current)"
if [[ "$branch" != feature/nexus-dashboard-safe-population-* ]]; then
  printf 'UNEXPECTED_BRANCH=%s\n' "$branch"
  exit 1
fi

changed="$(git diff --name-status origin/main..HEAD)"
if printf '%s\n' "$changed" | awk '$1 == "D" || $1 ~ /D/ {found=1} END {exit found ? 0 : 1}'; then
  printf 'DELETIONS_DETECTED\n%s\n' "$changed"
  exit 1
fi
if printf '%s\n' "$changed" | awk 'NF && $2 !~ /^(imports\/.+|scripts\/safe_recovery\/.+|todo\.md)$/ {found=1} END {exit found ? 0 : 1}'; then
  printf 'OUT_OF_SCOPE_CHANGES_DETECTED\n%s\n' "$changed"
  exit 1
fi

expected="$(tail -n +2 "$MANIFEST" | wc -l | tr -d ' ')"
actual="$(find "$IMPORT_ROOT" -type f -not -path "$IMPORT_ROOT/manifests/actions.tsv" -not -path "$IMPORT_ROOT/manifests/files.tsv" | wc -l | tr -d ' ')"
[[ "$expected" == "$actual" ]]
checked=0
while IFS=$'\t' read -r hash size rel; do
  [[ -z "$hash" ]] && continue
  file="$IMPORT_ROOT/$rel"
  [[ -f "$file" ]]
  [[ "$(stat -c '%s' "$file")" == "$size" ]]
  [[ "$(sha256sum "$file" | awk '{print $1}')" == "$hash" ]]
  checked=$((checked + 1))
done < <(tail -n +2 "$MANIFEST")
[[ "$checked" == "$expected" ]]

zip_count=0
while IFS= read -r -d '' zip_file; do
  unzip -tqq "$zip_file"
  zip_count=$((zip_count + 1))
done < <(find "$REPO/imports" -maxdepth 1 -type f -name '*.zip' -print0 | sort -z)
[[ "$zip_count" -ge 2 ]]

git fsck --full --no-progress > /tmp/nexus_safe_update_fsck.log 2>&1
if grep -qE '(^error|dangling commit)' /tmp/nexus_safe_update_fsck.log; then
  cat /tmp/nexus_safe_update_fsck.log
  exit 1
fi

printf 'BRANCH=%s\nCHANGED_PATHS=%s\nMANIFEST_FILES=%s\nZIP_ARCHIVES_TESTED=%s\nDELETIONS=0\nWORKTREE=CLEAN\nGIT_FSCK=OK\n' \
  "$branch" "$(printf '%s\n' "$changed" | sed '/^$/d' | wc -l | tr -d ' ')" "$checked" "$zip_count"
