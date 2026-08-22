#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
package_dir="$repo_root/imports/orquestrador-trinuclear-web-20260822"
manifest="$repo_root/docs/orquestrador-trinuclear-web-20260822-manifest.txt"
zip_file="$repo_root/artifacts/orquestrador-trinuclear-web-20260822.zip"

[[ -d "$package_dir" ]] || { echo "missing package directory" >&2; exit 1; }
[[ -f "$manifest" ]] || { echo "missing manifest" >&2; exit 1; }
[[ -f "$zip_file" ]] || { echo "missing zip" >&2; exit 1; }

secret_count="$(find "$package_dir" -type f \( -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name '*.key' -o -name '*.p12' \) | wc -l)"
[[ "$secret_count" -eq 0 ]] || { echo "secret-like files found: $secret_count" >&2; exit 1; }

actual_count="$(find "$package_dir" -type f | wc -l)"
manifest_count="$(wc -l < "$manifest")"
[[ "$actual_count" -eq "$manifest_count" ]] || {
  echo "manifest mismatch: files=$actual_count manifest=$manifest_count" >&2
  exit 1
}

( cd "$repo_root" && sha256sum -c <(sed 's#^\([a-f0-9]\{64\}\)  #\1  #' "$manifest") >/dev/null )

unzip -t "$zip_file" >/dev/null
printf 'validated files=%s zip=%s\n' "$actual_count" "$zip_file"
