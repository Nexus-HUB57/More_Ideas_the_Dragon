# ETERNA — Pacote de Automação Mainnet

Este namespace contém os artefatos recuperados da tarefa ETERNA de automação e validação de transações Bitcoin. A importação foi preparada sob o **Safe Recovery Protocol**: nenhum caminho existente do repositório deve ser substituído, renomeado ou excluído.

## Escopo

O pacote reúne o script de geração, os testes diagnósticos, o dataset das 30 transações geradas e o relatório operacional consolidado. Os arquivos foram copiados para um diretório exclusivo para manter isolamento contra alterações de outros desenvolvedores.

## Segurança

Segredos, chaves privadas, senhas, tokens, arquivos `.env` e credenciais não fazem parte deste pacote. Artefatos com material sensível devem permanecer fora do Git e ser administrados por variáveis de ambiente ou armazenamento seguro.

## Inventário

| Arquivo | Função |
|---|---|
| `generate_multiple_psbts.py` | Script de geração sequencial das transações |
| `test_bitcoinlib_tx.py` | Diagnóstico de métodos da bitcoinlib |
| `test_tx_creation.py` | Testes de criação e serialização |
| `eterma_30_transactions_mainnet.json` | Dataset das 30 transações geradas |
| `eterna_relatorio_final_automacao_30.md` | Relatório técnico consolidado |
| `SHA256SUMS` | Hashes de integridade dos artefatos |

## Estado operacional

Os dados representam artefatos gerados e prontos para revisão manual. A presença de hexadecimal bruto não significa que uma transação foi assinada ou transmitida. Qualquer assinatura ou broadcast em Mainnet deve ocorrer sob aprovação explícita e controle do operador.

## Proveniência

A origem, o hash SHA-256 e o caminho de destino são registrados no manifesto `SHA256SUMS`. O arquivo ZIP disponibilizado na raiz de `task-artifacts/` contém uma cópia integral deste diretório para auditoria e transporte.

## Regra de contribuição

Não usar `git push --force`, `git reset --hard` sobre branches compartilhadas, `git clean`, remoções em massa ou merges automáticos de branches de terceiros. A integração recomendada é por revisão do branch `agent/eterna-safe-population-20260822` e pull request separado.

**Data da preparação:** 22 de agosto de 2026.

**Responsável pela organização:** Manus AI.

---

> Este pacote é documental e operacional. Ele não substitui a revisão criptográfica independente, a validação de UTXOs atuais ou a aprovação de broadcast na rede Bitcoin Mainnet.
