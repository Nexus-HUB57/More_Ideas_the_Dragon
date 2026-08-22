#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
base="$repo_root/task_artifacts/legado_lucas_task_2026-08-22"
expected_299=299
actual_299="$(find "$repo_root/Legado_Lucas_Master_Operation" -type f | wc -l)"
[[ "$actual_299" -eq "$expected_299" ]] || { echo "ERRO: pacote 299 tem $actual_299 arquivos"; exit 1; }
[[ -f "$repo_root/artifacts/legado_lucas_299_end_to_end_2026-08-22.zip" ]] || { echo 'ERRO: ZIP ausente'; exit 1; }
[[ "$(git -C "$repo_root" diff --name-status HEAD | grep -c '^D' || true)" -eq 0 ]] || { echo 'ERRO: exclusões detectadas'; exit 1; }
unzip -t "$repo_root/artifacts/legado_lucas_299_end_to_end_2026-08-22.zip" >/dev/null
echo "OK: pacote de 299 arquivos preservado; sem exclusões; ZIP íntegro."
