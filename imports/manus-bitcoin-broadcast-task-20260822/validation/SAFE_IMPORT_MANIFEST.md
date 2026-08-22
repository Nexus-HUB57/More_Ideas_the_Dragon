# Manifesto de importação segura

- **Origem:** artefatos locais da tarefa Bitcoin Broadcast.
- **Destino:** `imports/manus-bitcoin-broadcast-task-20260822/`.
- **Estratégia:** namespace novo; nenhuma remoção, renomeação ou substituição de caminho existente.
- **Segredos excluídos:** carteira `.dat`, chaves privadas, senhas, seeds, credenciais, `utxos.json` e transações assinadas.
- **Validação:** executar `git diff --check`, busca de padrões sensíveis e testes sintáticos antes do commit.
