#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPECTED=10
ACTUAL="$(find "$ROOT" -maxdepth 1 -type f ! -name 'MANIFEST.sha256' -printf '%f\n' | wc -l | tr -d ' ')"

if [[ "$ACTUAL" -ne "$EXPECTED" ]]; then
  echo "ERRO: esperado $EXPECTED arquivos de conteúdo, encontrado $ACTUAL" >&2
  exit 1
fi

if find "$ROOT" -maxdepth 1 -type f -name '*.tmp' -o -name '*.part' | grep -q .; then
  echo "ERRO: arquivos temporários encontrados" >&2
  exit 1
fi

if [[ -f "$ROOT/MANIFEST.sha256" ]]; then
  (cd "$ROOT" && sha256sum -c MANIFEST.sha256)
else
  echo "AVISO: MANIFEST.sha256 ainda não foi criado"
fi

echo "OK: pacote íntegro; $ACTUAL arquivos de conteúdo validados."
