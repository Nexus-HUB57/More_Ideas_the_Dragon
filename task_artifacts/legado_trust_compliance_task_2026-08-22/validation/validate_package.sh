#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(git -C "$ROOT" rev-parse --show-toplevel)"
EXPECTED=(
  "README.md"
  "source/Legado.docx"
  "reports/01_relatorio_legado_lucas_thomaz.md"
  "reports/02_estrutura_juridica_e_custos.md"
  "reports/03_comparativo_offshore_e_trust.md"
  "reports/04_constituicao_trust.md"
  "reports/05_riscos_e_compliance_trust.md"
  "reports/06_lei_14754_e_trust.md"
  "validation/validate_package.sh"
)
for path in "${EXPECTED[@]}"; do
  test -f "$ROOT/$path"
done
if find "$ROOT" -type f \( -name 'credentials.json' -o -name '.env' -o -name 'config.json' \) -print -quit | grep -q .; then
  echo "Arquivo sensível encontrado no pacote" >&2
  exit 1
fi
COUNT=$(find "$ROOT" -type f -not -name 'validation_report.txt' -not -name 'manifest.txt' -not -name 'SHA256SUMS.txt' -not -name 'manifest.json' -not -name 'end_to_end.zip' | wc -l)
test "$COUNT" -eq "${#EXPECTED[@]}"
if git -C "$REPO" status --porcelain | grep -v "^?? task_artifacts/legado_trust_compliance_task_2026-08-22/" >/dev/null; then
  echo "Alterações fora do namespace permitido" >&2
  exit 1
fi
printf 'OK package_files=%s\n' "$COUNT"
sha256sum "${EXPECTED[@]/#/$ROOT/}"
