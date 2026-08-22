# Integração segura de artefatos da tarefa

Este diretório contém somente documentação, metadados e uma validação estática para a integração da tarefa no repositório `Nexus-HUB57/More_Ideas_the_Dragon`.

## Limites

Não são incluídos chaves privadas, sementes, carteiras, credenciais, tokens, senhas, dicionários de cracking, backups ou scripts para derivar, assinar, transmitir ou movimentar Bitcoin. Esses materiais permanecem fora do Git e são representados, quando necessário, apenas por nome, tamanho, hash e classificação no `MANIFEST.tsv`.

## Arquivos

| Arquivo | Função |
|---|---|
| `MANIFEST.tsv` | Inventário de metadados dos anexos recebidos. |
| `INTEGRATION_REPORT.md` | Relatório de escopo e procedimento de revisão. |
| `validate_manifest.py` | Validação fail-closed do manifesto. |

## Revisão

A integração foi preparada em branch dedicada, sem alteração direta da `main`, sem exclusões e sem reescrita de histórico. Antes do merge, um mantenedor deve revisar o diff, executar o validador e confirmar que não há segredos ou conteúdo operacional.

## Referências

[1]: https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning "GitHub Secret Scanning"
[2]: https://bitcoin.org/en/secure-your-wallet "Bitcoin.org — Secure your wallet"
