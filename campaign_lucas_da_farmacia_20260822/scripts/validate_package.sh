#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

required=(
  "README.md"
  "task_metadata.json"
  "assets/originals/lucas_thomaz_retrato_01.jpg"
  "assets/originals/lucas_thomaz_retrato_02.jpg"
  "assets/generated/lucas_megafone.png"
  "assets/generated/lucas_discursando.png"
  "assets/generated/lucas_abracando.png"
  "assets/generated/lucas_planejamento.png"
)

for path in "${required[@]}"; do
  test -f "$path" || { echo "ERRO: arquivo obrigatório ausente: $path" >&2; exit 1; }
done

test "$(grep -RIl --exclude='MANIFEST.sha256' 'SUMPREV' . | wc -l)" -gt 0 || {
  echo "ERRO: a referência SUMPREV não foi encontrada" >&2
  exit 1
}

test "$(find assets -type f | wc -l)" -ge 22 || {
  echo "ERRO: inventário de assets abaixo do esperado" >&2
  exit 1
}

if test -f MANIFEST.sha256; then
  sha256sum -c MANIFEST.sha256 >/dev/null
fi

echo "OK: pacote íntegro"
echo "arquivos=$(find . -type f -not -path './.git/*' | wc -l)"
echo "assets=$(find assets -type f | wc -l)"
