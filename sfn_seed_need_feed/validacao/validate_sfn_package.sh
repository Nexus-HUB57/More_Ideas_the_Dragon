#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
required=(README.md protocolos/01_seed.md protocolos/02_need.md protocolos/03_feed.md arquitetura/01_arquitetura_logica.md prompts/01_seed_synthesis.md prompts/02_need_planning.md prompts/03_feed_validation.md interface/dashboard_prototype.html)
for file in "${required[@]}"; do
  test -s "$ROOT/$file" || { echo "MISSING_OR_EMPTY=$file" >&2; exit 1; }
done
if find "$ROOT" -type f \( -name '.env' -o -name '*.pem' -o -name 'credentials.json' -o -name '*secret*' \) -print -quit | grep -q .; then
  echo 'SENSITIVE_FILE_DETECTED' >&2; exit 1
fi
find "$ROOT" -type f -not -path '*/validacao/manifesto.sha256' -print0 | sort -z | xargs -0 sha256sum > "$ROOT/validacao/manifesto.sha256"
printf 'SFN_VALIDATION_OK files=%s\n' "$(find "$ROOT" -type f | wc -l)"
