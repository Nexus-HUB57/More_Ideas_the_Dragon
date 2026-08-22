#!/usr/bin/env bash
set -euo pipefail

# Validador somente leitura. Não altera arquivos, branches ou histórico.
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

fail=0

check() {
  local label="$1"
  local actual="$2"
  local expected="$3"
  if [[ "$actual" == "$expected" ]]; then
    printf 'PASS  %s: %s\n' "$label" "$actual"
  else
    printf 'FAIL  %s: esperado=%s encontrado=%s\n' "$label" "$expected" "$actual" >&2
    fail=1
  fi
}

if [[ -n "$(git status --porcelain)" ]]; then
  printf 'WARN  working tree possui alterações locais; o validador não as modifica.\n'
else
  printf 'PASS  working tree limpo\n'
fi

module_count="$(git ls-files 'artifacts/end-to-end/001-299/*' | awk -F/ 'NF >= 4 {print $NF}' | grep -E '^(00[1-9]|0[1-9][0-9]|1[0-9][0-9]|2[0-9][0-9])-' | sort -u | wc -l | tr -d ' ')"
check 'módulos 001-299' "$module_count" '299'

missing=0
for n in $(seq -w 1 299); do
  if ! git ls-files --error-unmatch "artifacts/end-to-end/001-299/${n}-"'*' >/dev/null 2>&1; then
    # A consulta acima não expande curingas dentro do caminho; localizar por prefixo.
    if ! git ls-files "artifacts/end-to-end/001-299/${n}-*" | grep -q .; then
      printf 'FAIL  módulo ausente: %s\n' "$n" >&2
      missing=$((missing + 1))
    fi
  fi
done
check 'módulos ausentes' "$missing" '0'

if git diff --quiet HEAD -- && git diff --cached --quiet; then
  printf 'PASS  sem diff em relação ao HEAD\n'
else
  printf 'INFO  há alterações locais para revisão; nenhuma foi descartada\n'
fi

if git rev-parse --verify origin/main >/dev/null 2>&1; then
  base="$(git merge-base HEAD origin/main)"
  head="$(git rev-parse HEAD)"
  remote="$(git rev-parse origin/main)"
  printf 'INFO  HEAD=%s\n' "$head"
  printf 'INFO  origin/main=%s\n' "$remote"
  if [[ "$base" == "$head" || "$base" == "$remote" ]]; then
    printf 'PASS  branch baseada no origin/main atual\n'
  else
    printf 'WARN  branch pode estar desatualizada; atualizar via merge não destrutivo antes do PR\n'
  fi
else
  printf 'WARN  origin/main não está disponível localmente; executar git fetch origin antes da revisão\n'
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
printf 'PASS  validação concluída sem falhas estruturais\n'
