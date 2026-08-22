#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
DEST_ROOT="$REPO_ROOT/incoming/legado-lucas-dashboard-safe-20260822"
SOURCE_ROOT="/home/ubuntu/legado-lucas"
ZIP_SOURCE="/home/ubuntu/upload/Documentos.zip"

mkdir -p "$DEST_ROOT/source_project" "$DEST_ROOT/documentos_zip_safe_manifest" "$DEST_ROOT/audit"

# Cópia aditiva: nenhum arquivo existente no destino é substituído.
# `--keep-old-files` faz a operação falhar em qualquer colisão, em vez de sobrescrever.
tar --exclude='node_modules' --exclude='.git' -C "$SOURCE_ROOT" -cf - . \
  | tar --keep-old-files -C "$DEST_ROOT/source_project" -xpf - \
  > "$DEST_ROOT/audit/tar_copy.log" 2>&1
printf 'COPY_METHOD=tar_keep_old_files\n' > "$DEST_ROOT/audit/copy_method.txt"
rm -f "$DEST_ROOT/audit/rsync_copy.log" "$DEST_ROOT/audit/tar_copy.log" 2>/dev/null || true

# Manifesto do projeto copiado: caminho relativo, bytes e SHA-256.
(
  printf 'relative_path\tbytes\tsha256\n'
  find "$DEST_ROOT/source_project" -type f -print0 \
    | sort -z \
    | while IFS= read -r -d '' file; do
        rel="${file#"$DEST_ROOT/source_project/"}"
        bytes="$(stat -c '%s' "$file")"
        hash="$(sha256sum "$file" | cut -d' ' -f1)"
        printf '%s\t%s\t%s\n' "$rel" "$bytes" "$hash"
      done
) > "$DEST_ROOT/audit/source_project_manifest.tsv"

# Inventário de nomes do pacote recebido, sem extrair ou executar qualquer entrada.
unzip -Z1 "$ZIP_SOURCE" > "$DEST_ROOT/documentos_zip_safe_manifest/entries.txt"

# Hash do contêiner original e metadados verificáveis.
sha256sum "$ZIP_SOURCE" | awk '{print $1}' > "$DEST_ROOT/documentos_zip_safe_manifest/Documentos.zip.sha256"
stat -c '%s' "$ZIP_SOURCE" > "$DEST_ROOT/documentos_zip_safe_manifest/Documentos.zip.bytes"
wc -l < "$DEST_ROOT/documentos_zip_safe_manifest/entries.txt" > "$DEST_ROOT/documentos_zip_safe_manifest/Documentos.zip.entries"

# Sinalização somente por nome; nenhum valor de chave, seed ou conteúdo é escrito no relatório.
{
  printf 'entry\tname_risk\n'
  while IFS= read -r entry; do
    if printf '%s\n' "$entry" | grep -Eiq '(private|secret|credential|mnemonic|seed|wallet|key|passphrase|\.env|\.pem|\.p12|\.kdbx|\.sqlite|\.db)'; then
      printf '%s\tHIGH\n' "$entry"
    else
      printf '%s\tREVIEW\n' "$entry"
    fi
  done < "$DEST_ROOT/documentos_zip_safe_manifest/entries.txt"
} > "$DEST_ROOT/documentos_zip_safe_manifest/entry_risk_names.tsv"

cat > "$DEST_ROOT/documentos_zip_safe_manifest/README.md" <<'DOC'
# Inventário seguro do pacote Documentos.zip

O arquivo original foi mantido fora do repositório. Este diretório contém apenas o inventário de entradas, o tamanho e o SHA-256 do contêiner, além de uma classificação nominal para orientar revisão humana.

A decisão é intencional: o pacote é maior que o limite usual de arquivo do GitHub e contém artefatos de carteiras, chaves ou sementes que não devem ser republicados em um repositório colaborativo. Nenhuma entrada foi extraída ou executada durante a auditoria.
DOC

printf 'SOURCE_MANIFEST=%s\n' "$DEST_ROOT/audit/source_project_manifest.tsv"
printf 'ZIP_MANIFEST=%s\n' "$DEST_ROOT/documentos_zip_safe_manifest/entries.txt"
printf 'ZIP_SHA256=%s\n' "$(cat "$DEST_ROOT/documentos_zip_safe_manifest/Documentos.zip.sha256")"
printf 'ZIP_BYTES=%s\n' "$(cat "$DEST_ROOT/documentos_zip_safe_manifest/Documentos.zip.bytes")"
printf 'ZIP_ENTRIES=%s\n' "$(cat "$DEST_ROOT/documentos_zip_safe_manifest/Documentos.zip.entries")"
