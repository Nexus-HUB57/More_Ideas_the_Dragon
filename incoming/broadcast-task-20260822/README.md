# Pacote de Importação Segura — Tarefa de Broadcast Bitcoin

Este diretório preserva os artefatos efetivamente restaurados para a tarefa de broadcast iniciada em 22 de agosto de 2026. A importação foi preparada em uma branch exclusiva, sem alterar ou remover a branch `main`, commits, pastas ou arquivos existentes.

## Escopo

O único arquivo de entrada restaurado foi `signed_651e2137.txn`. Ele é mantido byte a byte, sem truncamento, reassinatura ou edição manual. Alterar uma transação assinada pode invalidar suas assinaturas e mudar seu conteúdo.

O repositório já contém 299 especificações técnicas em `docs/technical_spec_001.md` até `docs/technical_spec_299.md`. Esses arquivos permanecem nos caminhos originais; não serão duplicados nem sobrescritos.

| Artefato | Finalidade |
|---|---|
| `source/signed_651e2137.txn` | Cópia byte a byte do arquivo restaurado |
| `MANIFEST.tsv` | Inventário dos artefatos importados |
| `SHA256SUMS` | Verificação de integridade SHA-256 |
| `AUDIT_REPORT.md` | Auditoria, limites e validações |
| `broadcast-task-20260822-end-to-end.zip` | Pacote ZIP end-to-end |

## Protocolo de segurança

Nenhum caminho preexistente será substituído ou removido. O pacote usa o namespace novo `incoming/broadcast-task-20260822`. O commit será criado apenas nesta branch e publicado como branch separada para revisão; nenhum merge automático em `main` será feito.

A presença do arquivo assinado não confirma broadcast. O sucesso de um broadcast exige um TXID válido retornado por um serviço de rede e confirmação posterior da transação no mempool ou em bloco.

## Verificação

```bash
sha256sum --check SHA256SUMS
find docs -maxdepth 1 -name 'technical_spec_*.md' | wc -l
unzip -t broadcast-task-20260822-end-to-end.zip
```

O pacote não contém chaves privadas, credenciais de API ou segredos de autenticação.

**Autor:** Manus AI  
**Data:** 2026-08-22

## Referências

[1]: https://git-scm.com/docs/git-status "Git status documentation"
[2]: https://git-scm.com/docs/git-branch "Git branch documentation"

As referências documentam os comandos usados para inspeção e não substituem os resultados registrados neste pacote.
