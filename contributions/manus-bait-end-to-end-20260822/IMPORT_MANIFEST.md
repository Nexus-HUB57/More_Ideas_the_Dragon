# Importação BAIT End-to-End — Manifesto de Salvaguarda

Esta contribuição reúne os artefatos disponíveis desta tarefa em um namespace isolado, sem alterar caminhos existentes do repositório. A importação foi criada a partir do commit remoto `50d5dbdc9f6f025c51b181d8bf46468080f9b550` e será publicada em branch dedicada.

## Conteúdo

A pasta `baitcoin_workspace/` preserva o código Python, testes, scripts, manifestos e documentação do ecossistema BAIT. A pasta `baitcoin_dashboard/` preserva a aplicação React, seus componentes, estilos, configurações e lockfile, excluindo somente dependências materializadas e artefatos de build.

## Salvaguardas

Nenhum arquivo existente do destino será substituído. Nenhum commit remoto será reescrito. O push será normal, sem `--force`, e a branch `main` permanecerá intacta. Os hashes de todos os arquivos importados serão registrados em `SHA256SUMS.txt` antes do commit.

## Itens não importados por segurança ou reprodutibilidade

O arquivo `.project-config.json` foi deliberadamente excluído porque contém tokens e segredos de ambiente. As pastas `node_modules/` e `dist/` foram excluídas porque são dependências materializadas e artefatos regeneráveis. Os logs locais `.manus-logs/` foram excluídos para evitar transportar telemetria operacional para o repositório compartilhado. Nenhuma chave privada, seed, xprv, credencial ou segredo deve ser versionado.

## Validação

A validação deve confirmar a contagem de arquivos, a ausência de colisões fora deste namespace, a integridade SHA-256 do pacote e a execução da suíte Python. O ZIP end-to-end é um artefato de distribuição da contribuição e não substitui os arquivos descompactados.
