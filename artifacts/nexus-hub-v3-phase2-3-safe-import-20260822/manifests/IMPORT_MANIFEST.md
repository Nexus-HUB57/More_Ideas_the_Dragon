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
| Código-fonte portátil do projeto | 136 |
| Artefatos de entrada preservados | 3 |
| Arquivos auditados no manifesto | 148 |
| Bytes auditados no manifesto | 21471661 |
| Itens sensíveis bloqueados | 3 |

O código-fonte portátil inclui todos os arquivos regulares do projeto restaurado, exceto dependências instaladas, artefatos de build, logs, caches, metadados locais de execução e arquivos de credenciais/configuração sensível. Dependências e build são reconstituíveis por `package.json` e `pnpm-lock.yaml`; não são fontes primárias e não devem ser versionados neste pacote.

O relatório ZIP fornecido foi preservado em versão sanitizada. Entradas sensíveis identificadas estão listadas em `reports/SENSITIVE_FILES_BLOCKED.txt`; o conteúdo bruto não é publicado.

## Verificação

- `manifests/PUBLISHED_FILES.tsv` contém SHA-256, tamanho e caminho relativo de cada arquivo auditado.
- `manifests/PUBLISHED_SHA256SUMS.txt` é a lista de verificação correspondente.
- O ZIP end-to-end é `Nexus-Hub-V3-Task-Phase2-3-End-to-End-sanitized.zip`.
- Nenhum arquivo existente fora deste diretório aditivo é alvo desta operação.
- Nenhum commit ou branch existente é reescrito.
