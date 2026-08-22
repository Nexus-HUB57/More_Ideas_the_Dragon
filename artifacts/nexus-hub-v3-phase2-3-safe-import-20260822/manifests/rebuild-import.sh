#!/usr/bin/env bash
set -euo pipefail

REPO='/home/ubuntu/More_Ideas_the_Dragon'
TARGET="$REPO/artifacts/nexus-hub-v3-phase2-3-safe-import-20260822"
SOURCE='/home/ubuntu/nexus-hub-v3'
UPLOAD='/home/ubuntu/upload/RelatóriodeAtivaçãodoAgenteNexusFase3.zip'

cd "$REPO"
[ -d "$TARGET/source" ]
[ -d "$TARGET/incoming" ]
[ -d "$TARGET/manifests" ]
[ -d "$TARGET/reports" ]

# Remove only the earlier ZIP produced by this operation, then regenerate it with
# a stricter sensitive-file exclusion. No pre-existing repository path is touched.
rm -f "$TARGET/incoming/Relatorio-Ativacao-Agente-Nexus-Fase3-sanitized.zip"
rm -rf /tmp/nexus_activation_safe
mkdir -p /tmp/nexus_activation_safe
unzip -q "$UPLOAD" -d /tmp/nexus_activation_safe
find /tmp/nexus_activation_safe -type f \( \
  -iname 'credentials*' -o \
  -iname '*secret*' -o \
  -iname '.env' -o \
  -iname '.env.*' -o \
  -iname '*private*key*' -o \
  -iname '*.pem' -o \
  -iname '*.key' -o \
  -iname 'setup-env.sh' \
\) -print -delete | sort > "$TARGET/reports/SENSITIVE_FILES_BLOCKED.txt"
printf '%s\n' 'source/.project-config.json (AWS temporary access key, secret key, and session token)' >> "$TARGET/reports/SENSITIVE_FILES_BLOCKED.txt"
(
  cd /tmp/nexus_activation_safe
  zip -qr "$TARGET/incoming/Relatorio-Ativacao-Agente-Nexus-Fase3-sanitized.zip" .
)
rm -rf /tmp/nexus_activation_safe

# Record source metadata with no raw secret values.
{
  printf 'source_path\t%s\n' "$SOURCE"
  printf 'uploaded_zip_path\t%s\n' "$UPLOAD"
  printf 'uploaded_zip_sha256\t%s\n' "$(sha256sum "$UPLOAD" | awk '{print $1}')"
  printf 'uploaded_zip_size_bytes\t%s\n' "$(stat -c '%s' "$UPLOAD")"
  printf 'project_source_file_count\t%s\n' "$(find "$TARGET/source" -type f | wc -l)"
  printf 'project_source_byte_count\t%s\n' "$(find "$TARGET/source" -type f -printf '%s\n' | awk '{s+=$1} END {print s+0}')"
  printf 'sanitized_activation_zip_entries\t%s\n' "$(unzip -Z1 "$TARGET/incoming/Relatorio-Ativacao-Agente-Nexus-Fase3-sanitized.zip" | wc -l)"
  printf 'sanitized_activation_zip_size_bytes\t%s\n' "$(stat -c '%s' "$TARGET/incoming/Relatorio-Ativacao-Agente-Nexus-Fase3-sanitized.zip")"
} > "$TARGET/manifests/SOURCE_METADATA.tsv"

# Create a stable, path-sorted payload manifest. The manifest files themselves
# are excluded to avoid a self-referential hash.
MANIFEST="$TARGET/manifests/PUBLISHED_FILES.tsv"
SHA_LIST="$TARGET/manifests/PUBLISHED_SHA256SUMS.txt"
: > "$MANIFEST"
: > "$SHA_LIST"
while IFS= read -r -d '' file; do
  rel="${file#"$TARGET/"}"
  size="$(stat -c '%s' "$file")"
  hash="$(sha256sum "$file" | awk '{print $1}')"
  printf '%s\t%s\t%s\n' "$hash" "$size" "$rel" >> "$MANIFEST"
  printf '%s  %s\n' "$hash" "$rel" >> "$SHA_LIST"
done < <(
  find "$TARGET" -type f \
    -not -path "$TARGET/manifests/PUBLISHED_FILES.tsv" \
    -not -path "$TARGET/manifests/PUBLISHED_SHA256SUMS.txt" \
    -not -path "$TARGET/manifests/IMPORT_MANIFEST.md" \
    -not -path "$TARGET/manifests/END_TO_END_ZIP_SHA256SUM.txt" \
    -not -path "$TARGET/reports/VALIDATION_PRECOMMIT.txt" \
    -not -name 'Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip' \
    -print0 | sort -z
)

SOURCE_COUNT="$(find "$TARGET/source" -type f | wc -l)"
INCOMING_COUNT="$(find "$TARGET/incoming" -type f | wc -l)"
PAYLOAD_COUNT="$(wc -l < "$MANIFEST")"
PAYLOAD_BYTES="$(awk -F '\t' '{s+=$2} END {print s+0}' "$MANIFEST")"
BLOCKED_COUNT="$(wc -l < "$TARGET/reports/SENSITIVE_FILES_BLOCKED.txt")"

cat > "$TARGET/manifests/IMPORT_MANIFEST.md" <<EOF
# Nexus Hub V3 — Manifesto de Importação Safe Recovery

## Identificação

| Campo | Valor |
|---|---|
| Repositório | Nexus-HUB57/More_Ideas_the_Dragon |
| Diretório aditivo | artifacts/nexus-hub-v3-phase2-3-safe-import-20260822 |
| Fonte principal | /home/ubuntu/nexus-hub-v3 |
| Fonte complementar | /home/ubuntu/upload/RelatóriodeAtivaçãodoAgenteNexusFase3.zip |
| Método | Cópia aditiva, sem sobrescrita de caminhos preexistentes |

## Contagem reconciliada

| Grupo | Arquivos |
|---|---:|
| Código-fonte portátil do projeto | $SOURCE_COUNT |
| Artefatos de entrada preservados | $INCOMING_COUNT |
| Arquivos auditados no manifesto | $PAYLOAD_COUNT |
| Bytes auditados no manifesto | $PAYLOAD_BYTES |
| Itens sensíveis bloqueados | $BLOCKED_COUNT |

O código-fonte portátil inclui todos os arquivos regulares do projeto restaurado, exceto dependências instaladas, artefatos de build, logs, caches, metadados locais de execução e arquivos de credenciais/configuração sensível. Dependências e build são reconstituíveis por \`package.json\` e \`pnpm-lock.yaml\`; não são fontes primárias e não devem ser versionados neste pacote.

O relatório ZIP fornecido foi preservado em versão sanitizada. Entradas sensíveis identificadas estão listadas em \`reports/SENSITIVE_FILES_BLOCKED.txt\`; o conteúdo bruto não é publicado.

## Verificação

- \`manifests/PUBLISHED_FILES.tsv\` contém SHA-256, tamanho e caminho relativo de cada arquivo auditado.
- \`manifests/PUBLISHED_SHA256SUMS.txt\` é a lista de verificação correspondente.
- O ZIP end-to-end é \`Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip\`.
- Nenhum arquivo existente fora deste diretório aditivo é alvo desta operação.
- Nenhum commit ou branch existente é reescrito.
EOF

# Rebuild the end-to-end archive after the manifests/report exist, excluding the
# archive itself and generated hash lists from the archive to avoid recursion.
rm -f "$TARGET/Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip"
(
  cd "$TARGET"
  zip -qr "Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip" \
    00_SAFE_RECOVERY_PROTOCOL.md source incoming reports manifests \
    -x 'Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip' \
       'manifests/PUBLISHED_FILES.tsv' \
       'manifests/PUBLISHED_SHA256SUMS.txt' \
       'manifests/END_TO_END_ZIP_SHA256SUM.txt' \
       'reports/VALIDATION_PRECOMMIT.txt'
)
sha256sum "$TARGET/Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip" > "$TARGET/manifests/END_TO_END_ZIP_SHA256SUM.txt"
printf '%s\n' 'BUILD_OK'
printf 'source_files=%s\n' "$SOURCE_COUNT"
printf 'incoming_files=%s\n' "$INCOMING_COUNT"
printf 'payload_files=%s\n' "$PAYLOAD_COUNT"
printf 'blocked_sensitive=%s\n' "$BLOCKED_COUNT"
printf 'end_to_end_zip_bytes=%s\n' "$(stat -c '%s' "$TARGET/Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip")"
