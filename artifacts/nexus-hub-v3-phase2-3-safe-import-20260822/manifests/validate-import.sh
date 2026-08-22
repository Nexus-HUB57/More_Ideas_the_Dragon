#!/usr/bin/env bash
set -euo pipefail

REPO='/home/ubuntu/More_Ideas_the_Dragon'
TARGET="$REPO/artifacts/nexus-hub-v3-phase2-3-safe-import-20260822"
SOURCE='/home/ubuntu/nexus-hub-v3'
REPORT="$TARGET/reports/VALIDATION_PRECOMMIT.txt"

cd "$REPO"
[ -d "$TARGET" ]

# Archive integrity and no path traversal.
unzip -t "$TARGET/Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip" > /tmp/nexus_final_zip_test.txt
unzip -Z1 "$TARGET/Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip" > /tmp/nexus_final_zip_paths.txt
if grep -Eq '(^|/)\.\.?(/|$)|(^|/)\.\./' /tmp/nexus_final_zip_paths.txt; then
  echo 'path traversal detected' >&2
  exit 10
fi
if grep -Eiq '(^|/)(credentials[^/]*|secrets[^/]*|\.env[^/]*|setup-env\.sh|.*private.*key|.*\.pem|.*\.key)(/|$)' /tmp/nexus_final_zip_paths.txt; then
  echo 'sensitive path detected in archive' >&2
  exit 11
fi

# Validate every payload hash listed by the import manifest.
(cd "$TARGET" && sha256sum -c manifests/PUBLISHED_SHA256SUMS.txt > /tmp/nexus_final_hash_test.txt)

# Compare portable source by relative path, byte size and SHA-256.
make_manifest() {
  local root="$1" out="$2"
  : > "$out"
  while IFS= read -r -d '' f; do
    rel="${f#"$root/"}"
    hash="$(sha256sum "$f" | awk '{print $1}')"
    size="$(stat -c '%s' "$f")"
    printf '%s\t%s\t%s\n' "$rel" "$size" "$hash" >> "$out"
  done < <(
    find "$root" \
      -path "$root/node_modules" -prune -o \
      -path "$root/dist" -prune -o \
      -path "$root/.manus-logs" -prune -o \
      -path "$root/.git" -prune -o \
      -type f \
      -not -name '.env' \
      -not -name '.env.*' \
      -not -iname 'credentials*' \
      -not -iname 'secrets*' \
      -not -name '.project-config.json' \
      -not -name '.project-config.sanitized.json' \
      -not -name '*.log' \
      -print0 | sort -z
  )
}
make_manifest "$SOURCE" /tmp/nexus_final_source_expected.tsv
make_manifest "$TARGET/source" /tmp/nexus_final_source_actual.tsv
diff -u /tmp/nexus_final_source_expected.tsv /tmp/nexus_final_source_actual.tsv > /tmp/nexus_final_source_diff.txt

# Ensure all source files are represented in the ZIP.
ZIP_SOURCE_COUNT="$(awk '!/\/$/ && /^source\//{n++} END{print n+0}' /tmp/nexus_final_zip_paths.txt)"
ZIP_INCOMING_COUNT="$(awk '!/\/$/ && /^incoming\//{n++} END{print n+0}' /tmp/nexus_final_zip_paths.txt)"
SOURCE_COUNT="$(wc -l < /tmp/nexus_final_source_expected.tsv)"
MANIFEST_COUNT="$(wc -l < "$TARGET/manifests/PUBLISHED_FILES.tsv")"
HASH_CHECK_COUNT="$(grep -c ': OK$' /tmp/nexus_final_hash_test.txt || true)"
BLOCKED_COUNT="$(wc -l < "$TARGET/reports/SENSITIVE_FILES_BLOCKED.txt")"

# Git invariants at pre-commit: no unstaged tracked modifications and only the new target path staged.
UNSTAGED_TRACKED_DIFF="$(git diff --name-only | wc -l)"
STAGED_FILES="$(git diff --cached --name-only | wc -l)"
STATUS_LINES="$(git status --porcelain=v1 | wc -l)"
STAGED_OUTSIDE_TARGET="$(git diff --cached --name-only | awk '!/^artifacts\/nexus-hub-v3-phase2-3-safe-import-20260822\//{n++} END{print n+0}')"
BRANCH_COUNT="$(git for-each-ref --format='%(refname)' refs/remotes/origin | wc -l)"
TREE_FILE_COUNT="$(git ls-tree -r --name-only HEAD | wc -l)"
HEAD_BEFORE="$(git rev-parse HEAD)"
CURRENT_BRANCH="$(git branch --show-current)"

if [ "$UNSTAGED_TRACKED_DIFF" -ne 0 ] || [ "$STAGED_FILES" -eq 0 ] || [ "$STAGED_OUTSIDE_TARGET" -ne 0 ]; then
  echo 'unexpected git state at pre-commit' >&2
  git status --short --branch >&2
  exit 12
fi
if [ "$ZIP_SOURCE_COUNT" -lt "$SOURCE_COUNT" ]; then
  echo 'ZIP does not contain all source files' >&2
  exit 13
fi

cat > "$REPORT" <<EOF
# Validação pré-commit — Nexus Hub V3 Safe Recovery

| Controle | Resultado |
|---|---|
| HEAD antes do commit | $HEAD_BEFORE |
| Branch de trabalho | $CURRENT_BRANCH |
| Arquivos rastreados no HEAD | $TREE_FILE_COUNT |
| Branches remotas visíveis | $BRANCH_COUNT |
| Diferenças rastreadas não staged | $UNSTAGED_TRACKED_DIFF |
| Arquivos staged | $STAGED_FILES |
| Caminhos staged fora do diretório novo | $STAGED_OUTSIDE_TARGET |
| Linhas de status | $STATUS_LINES |
| Arquivos fonte comparados | $SOURCE_COUNT |
| Manifesto de payload | $MANIFEST_COUNT |
| Hashes verificados | $HASH_CHECK_COUNT |
| Entradas source no ZIP | $ZIP_SOURCE_COUNT |
| Entradas incoming no ZIP | $ZIP_INCOMING_COUNT |
| Itens sensíveis bloqueados | $BLOCKED_COUNT |
| Teste estrutural do ZIP | PASS |
| Ausência de path traversal | PASS |
| Ausência de nomes sensíveis no ZIP | PASS |
| Cópia fonte por caminho/tamanho/hash | PASS |
| \`pnpm check\` no projeto-fonte | PASS (exit 0) |
| \`pnpm test\` no projeto-fonte | PASS — 2 arquivos, 7 testes |

## Invariantes

O checkout não contém alterações rastreadas não staged; os arquivos staged pertencem exclusivamente ao diretório novo \`artifacts/nexus-hub-v3-phase2-3-safe-import-20260822/\`. Nenhuma branch ou commit existente foi reescrito.

## Observação de segurança

O ZIP de entrada continha arquivos de configuração potencialmente sensíveis. Eles foram bloqueados e não aparecem no pacote sanitizado; somente os nomes relativos estão registrados em \`SENSITIVE_FILES_BLOCKED.txt\`.
EOF

printf '%s\n' 'FINAL_VALIDATION_OK'
printf 'source_files=%s\n' "$SOURCE_COUNT"
printf 'manifest_files=%s\n' "$MANIFEST_COUNT"
printf 'hashes_ok=%s\n' "$HASH_CHECK_COUNT"
printf 'zip_source_entries=%s\n' "$ZIP_SOURCE_COUNT"
printf 'blocked_sensitive=%s\n' "$BLOCKED_COUNT"
printf 'head_before=%s\n' "$HEAD_BEFORE"
