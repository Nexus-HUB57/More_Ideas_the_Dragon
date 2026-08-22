#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
INTEGRATION="$ROOT/artifacts/orseca-oraca-integration-20260822"
cd "$ROOT"

echo "[1/7] branch e base"
branch="$(git branch --show-current)"
[[ "$branch" == "manus/orseca-oraca-integration-20260822" ]]
git rev-parse --verify HEAD >/dev/null

echo "[2/7] estado e colisões"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Há mudanças locais; revisão necessária antes do commit." >&2
fi
while IFS= read -r path; do
  [[ "$path" == artifacts/orseca-oraca-integration-20260822/* ]] || {
    echo "Caminho fora da área isolada: $path" >&2
    exit 1
  }
done < <(git status --porcelain | sed -E 's/^.. //')

echo "[3/7] arquivos fundamentais"
for path in \
  "$INTEGRATION/README.md" \
  "$INTEGRATION/docs/01_Livro_das_Sementes_Especificacao.md" \
  "$INTEGRATION/docs/02_ORACA_Arquitetura_Organismo.md" \
  "$INTEGRATION/scripts/validate_orseca_integration.sh"; do
  test -s "$path"
done

echo "[4/7] sintaxe markdown básica"
! find "$INTEGRATION/docs" -type f -name '*.md' -print0 | xargs -0 grep -nHE $'\r|<<<<<<<|=======|>>>>>>>'

echo "[5/7] diff"
git diff --check

echo "[6/7] contagem"
find "$INTEGRATION" -type f -printf '%P\n' | sort | tee "$INTEGRATION/manifests/INTEGRATION_FILES.txt"

echo "[7/7] sha256"
find "$INTEGRATION" -type f ! -path '*/manifests/SHA256SUMS.txt' -print0 | sort -z | xargs -0 sha256sum > "$INTEGRATION/manifests/SHA256SUMS.txt"
cat "$INTEGRATION/manifests/SHA256SUMS.txt"
echo "VALIDATION=PASS"
