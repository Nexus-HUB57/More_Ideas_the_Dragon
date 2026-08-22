# Importação segura dos artefatos enviados em 2026-08-22

Esta pasta é um namespace isolado e aditivo para os artefatos `NexusAgenteIAHibrido.zip` e `NexusTest.zip`. Nenhum caminho existente do repositório foi substituído ou removido.

Os diretórios contêm somente arquivos regulares sanitizados. Os arquivos `*.sanitized.zip` preservam os artefatos seguros para distribuição end-to-end sem transportar credenciais, chaves privadas, arquivos `.env` ou cópias integrais de arquivos-fonte sensíveis. O `IMPORT_MANIFEST.json` registra hashes, contagens e exclusões.

A exclusão de credenciais, chaves privadas, arquivos `.env` e conteúdo equivalente é deliberada. Esses valores devem ser geridos por Secret Manager ou variáveis protegidas do ambiente de execução.
