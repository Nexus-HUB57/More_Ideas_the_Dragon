# FDR Dashboard — Importação segura de artefatos

Este diretório contém a cópia versionada dos artefatos recuperados para esta tarefa, organizada em um namespace próprio para evitar colisões com o restante do repositório. A importação foi feita em uma branch isolada e não modifica, remove ou sobrescreve arquivos existentes fora deste diretório.

## Conteúdo incluído

A pasta `source/backend` contém os arquivos recuperados do backend Flask. A pasta `source/frontend` contém o frontend React/Vite, incluindo seus componentes de interface e arquivos de configuração. A pasta `documentation` contém a documentação técnica disponível, e `audit` contém os registros de validação de saldos e os endereços públicos utilizados na auditoria.

O manifesto `MANIFEST_FDR_SAFE_20260822.tsv` registra cada arquivo incluído, seu tamanho e seu SHA-256. O pacote ZIP `fdr_dashboard_safe_population_20260822.zip`, na pasta pai, é uma cópia arquivística do namespace completo.

## Política de segurança

Nenhuma senha, chave privada, seed, wallet completa, token ou credencial de exchange é incluída neste pacote. Os arquivos recuperados na pasta local `upload/` que foram classificados como material potencialmente sensível foram mantidos fora do Git e registrados somente por nome, tamanho, hash e motivo de exclusão em `EXCLUDED_SENSITIVE_INPUTS.tsv`.

O repositório já possui seus próprios manifests e bundles históricos de 001–299. Este pacote não altera esses artefatos; ele apenas adiciona os arquivos FDR recuperados que não estavam presentes em um namespace FDR dedicado.

## Validação

A validação deve ser executada com `sha256sum -c MANIFEST_FDR_SAFE_20260822.sha256` a partir desta pasta. A branch de trabalho utilizada para a integração é `agent/fdr-safe-population-20260822`.

> Credenciais e material criptográfico devem ser provisionados exclusivamente por variáveis de ambiente, secret manager ou GitHub Actions Secrets; nunca por arquivos versionados.

— Manus AI

## Referências

[1]: https://git-scm.com/docs/git-branch "Git Branch Documentation"
[2]: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions "Using secrets in GitHub Actions"
[3]: https://sha256algorithm.com/ "SHA-256 algorithm reference"
