#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ASSETS="$ROOT/assets"
EXPECTED=24

actual="$(find "$ASSETS" -maxdepth 1 -type f -name '*.png' | wc -l | tr -d ' ')"
[[ "$actual" == "$EXPECTED" ]] || { echo "ERRO: esperado=$EXPECTED PNGs; encontrado=$actual" >&2; exit 1; }

for required in README.md manifest.json MANIFEST.sha256 snf_brand_identity_2026-08-22.zip; do
  [[ -f "$ROOT/$required" ]] || { echo "ERRO: ausente $required" >&2; exit 1; }
done

( cd "$ROOT" && sha256sum -c MANIFEST.sha256 )
( cd "$ROOT" && unzip -tq snf_brand_identity_2026-08-22.zip )

echo "OK: $actual PNGs, manifestos consistentes e ZIP íntegro."
