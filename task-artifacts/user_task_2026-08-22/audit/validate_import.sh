#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_ZIP_SHA="d5720499e30a680c48d4ed8002bb14f2c1e206168b23f857d0995b8a15bbf3e5"
ORIGINAL_ZIP="$ROOT/archives/ClonarRepositórioeCriarEcossistemaAI-to-AI.original.zip"
ATTACHED="$ROOT/sources/attached-zip"
NEXUS="$ROOT/sources/nexus-dashboard"

fail() {
  printf 'FAIL\t%s\n' "$1" >&2
  exit 1
}

[ -f "$ORIGINAL_ZIP" ] || fail "ZIP original ausente"
[ -d "$ATTACHED" ] || fail "fonte extraída ausente"
[ -d "$NEXUS" ] || fail "snapshot Nexus ausente"

actual_zip_sha="$(sha256sum "$ORIGINAL_ZIP" | awk '{print $1}')"
[ "$actual_zip_sha" = "$EXPECTED_ZIP_SHA" ] || fail "SHA-256 do ZIP original divergente"

if find "$ROOT" -type d -name .git -print -quit | grep -q .; then
  fail "diretório .git encontrado dentro do namespace"
fi

sensitive_count="$(find "$ROOT" -type f \( -name '.env' -o -name '.env.*' -o -iname 'credentials.json' -o -iname '*secret*' -o -iname '*private*key*' -o -iname '*mnemonic*' -o -iname '*xprv*' -o -iname '*wif*' \) -print | wc -l)"
[ "$sensitive_count" -eq 0 ] || fail "arquivo sensível encontrado no namespace"

attached_count="$(find "$ATTACHED" -type f | wc -l)"
[ "$attached_count" -eq 16 ] || fail "quantidade de arquivos da fonte anexada divergente: $attached_count"

printf 'OK\tzip_sha256\t%s\n' "$actual_zip_sha"
printf 'OK\tattached_files\t%s\n' "$attached_count"
printf 'OK\tnexus_snapshot_files\t%s\n' "$(find "$NEXUS" -type f | wc -l)"
printf 'OK\timport_bytes\t%s\n' "$(find "$ROOT" -type f -printf '%s\n' | awk '{s+=$1} END {print s+0}')"
printf 'OK\tno_git_directory\ttrue\n'
printf 'OK\tno_sensitive_files\ttrue\n'
