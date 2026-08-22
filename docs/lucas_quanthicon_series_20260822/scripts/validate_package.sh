#!/usr/bin/env bash
set -euo pipefail

PKG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$PKG/MANIFEST.sha256"

required=(
  "README.md"
  "source/ExperiênciaNascidhus.docx"
  "docs/analise_e_proposta_narrativa.md"
  "docs/conceito_quanthicon_e_mundo.md"
  "docs/esboco_trama_personagens.md"
  "docs/roteiro_piloto_ep1.md"
  "docs/cena_chave_machadiana.md"
  "docs/perfil_lucia_e_cena_kafka_clarice.md"
  "docs/bible_quanthicon_saramago.md"
  "scripts/validate_package.sh"
  "MANIFEST.sha256"
)

for rel in "${required[@]}"; do
  test -f "$PKG/$rel" || { echo "MISSING: $rel" >&2; exit 1; }
done

( cd "$PKG" && sha256sum -c MANIFEST.sha256 )
count="$(find "$PKG" -type f | wc -l)"
if [ "$count" -lt 11 ]; then
  echo "Unexpected file count: $count" >&2
  exit 1
fi

echo "VALIDATION_OK files=$count package=$PKG"
