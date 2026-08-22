#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
test -s source/RelatóriodeFechamentoOrçamentárioeBalançoPatrimonialAno4-Revisado.docx
test -s documento_extraido.md
test -s analise_riscos_juridicos_financeiros.md
python3 - <<'PY'
import hashlib, json
from pathlib import Path
d=json.loads(Path("manifest.json").read_text(encoding="utf-8"))
for x in d["files_in_bundle"]:
 p=Path(x["path"]); assert p.is_file() and p.stat().st_size==x["bytes"] and hashlib.sha256(p.read_bytes()).hexdigest()==x["sha256"]
print("OK:", len(d["files_in_bundle"]), "arquivos verificados")
PY
