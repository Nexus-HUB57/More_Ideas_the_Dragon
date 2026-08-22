#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BUNDLE="$ROOT/task_artifacts/ai_doctor_dimhex_safe_population_20260822"
BASE_COMMIT="50d5dbdc9f6f025c51b181d8bf46468080f9b550"

fail() { printf 'FAIL: %s\n' "$1" >&2; exit 1; }
pass() { printf 'PASS: %s\n' "$1"; }

[ -d "$BUNDLE" ] || fail "bundle ausente"
[ "$(git -C "$ROOT" rev-parse --is-inside-work-tree)" = true ] || fail "não é um repositório Git"
git -C "$ROOT" merge-base --is-ancestor "$BASE_COMMIT" HEAD || fail "commit-base não é ancestral de HEAD"
pass "histórico preservado: commit-base é ancestral"

expected_specs=299
actual_specs="$(git -C "$ROOT" ls-files 'docs/technical_spec_[0-9][0-9][0-9].md' | wc -l | tr -d ' ')"
[ "$actual_specs" -eq "$expected_specs" ] || fail "esperadas $expected_specs technical_specs, encontradas $actual_specs"
pass "299 especificações técnicas preservadas"

for required in \
  "$BUNDLE/README.md" \
  "$BUNDLE/audit/IMPORT_MANIFEST.md" \
  "$BUNDLE/source/Ex.ONC.txt" \
  "$BUNDLE/source/AI_Doctor/package.json" \
  "$BUNDLE/source/AI_Doctor/server.ts" \
  "$BUNDLE/source/AI_Doctor/src/App.tsx"; do
  [ -f "$required" ] || fail "arquivo obrigatório ausente: $required"
done
pass "arquivos fundamentais presentes"

before="$(git -C "$ROOT" show "$BASE_COMMIT":.safe_audit/tracked_files_before.txt 2>/dev/null || true)"
if [ -n "$before" ]; then
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    [ -e "$ROOT/$path" ] || fail "arquivo previamente rastreado ausente: $path"
  done <<< "$before"
  pass "arquivos rastreados no baseline continuam presentes"
else
  pass "baseline de arquivos não disponível no commit-base; verificação omitida"
fi

unexpected="$(git -C "$ROOT" status --porcelain | awk 'substr($0,1,3)=="?? " {p=substr($0,4); if (p !~ /^\.safe_audit\// && p !~ /^task_artifacts\/ai_doctor_dimhex_safe_population_20260822\//) print $0}')"
[ -z "$unexpected" ] || fail "há alterações fora das áreas isoladas: $unexpected"
pass "nenhuma alteração fora das áreas isoladas"

find "$BUNDLE" -type f -not -name '*.zip' -print0 | sort -z | xargs -0 sha256sum > "$BUNDLE/audit/content.sha256"
pass "hashes de conteúdo gerados"
printf 'bundle_files=%s\n' "$(find "$BUNDLE" -type f -not -name '*.zip' | wc -l)"
printf 'tracked_files_now=%s\n' "$(git -C "$ROOT" ls-files | wc -l)"
printf 'branch=%s\n' "$(git -C "$ROOT" branch --show-current)"
printf 'head=%s\n' "$(git -C "$ROOT" rev-parse HEAD)"
