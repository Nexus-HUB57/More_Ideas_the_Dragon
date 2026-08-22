# Integração ORSECA / ORACA — 22-08-2026

## Escopo

Esta pasta contém os artefatos autorais produzidos a partir da definição do primeiro Livro das Sementes e da arquitetura conceitual da ORACA. Ela foi criada em área exclusiva para evitar colisões com operações paralelas do repositório `Nexus-HUB57/More_Ideas_the_Dragon`.

O primeiro livro possui **7 sermões** e é o livro dos iniciados. Seu foco é acolher quem busca melhorar, aperfeiçoar habilidades, mudar hábitos, compreender necessidades e alinhar quem é, quem deseja ser e quem precisa ser para tornar suas buscas, objetivos e planos acessíveis e realizáveis.

## Conteúdo desta integração

| Caminho | Função |
|---|---|
| `docs/01_Livro_das_Sementes_Especificacao.md` | Especificação editorial, formativa e de segurança do primeiro livro. |
| `docs/02_ORACA_Arquitetura_Organismo.md` | Organograma funcional e princípios da plataforma ORACA. |
| `manifests/` | Inventários e somas de verificação gerados sem alterar fontes existentes. |
| `scripts/` | Scripts de validação local e geração de inventário. |
| `source-index/` | Índice dos artefatos ORSECA previamente rastreados no repositório. |

## Preservação do ecossistema

Nenhum arquivo existente deve ser substituído, removido ou renomeado. Os artefatos anteriores relacionados a livros e capas permanecem em seus caminhos originais, incluindo `artifacts/manus-task-20260822-orseca-livros`, `task_artifacts/livro_das_sementes_20260822` e os respectivos arquivos ZIP. A presente integração apenas acrescenta uma área identificada e independente.

A branch desta operação é `manus/orseca-oraca-integration-20260822`. Antes de qualquer publicação, deve-se conferir a base do commit, o estado limpo, os arquivos adicionados e a soma SHA-256 do pacote final.

## Observação sobre anexos

Os PDFs e o áudio citados na conversa não estavam disponíveis no checkout nem no diretório de anexos acessível durante a auditoria inicial. Por isso, esta integração não inventa cópias nem declara esses anexos como importados. Quando os arquivos estiverem disponíveis, eles devem ser adicionados em uma subpasta nova, com nomes preservados, índice de origem e hashes, sem substituir artefatos anteriores.

## Validação

A validação deve confirmar: branch exclusiva; base conhecida; checkout limpo antes da operação; ausência de colisões de caminho; arquivos esperados presentes; manifestos atualizados; ZIP reproduzível; e `git diff --check` sem erros. A aprovação de conteúdo, terminologia e governança permanece com a ORSECA.
