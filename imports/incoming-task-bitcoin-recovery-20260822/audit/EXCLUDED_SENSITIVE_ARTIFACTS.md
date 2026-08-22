# Artefatos excluídos por segurança

Os itens abaixo foram identificados no workspace local, mas não foram copiados para o repositório porque contêm ou podem conter chaves privadas, passphrases, credenciais, dados de carteira ou automação de recuperação/saque. A exclusão do commit é deliberada e não altera os arquivos existentes no repositório.

| Categoria | Exemplos locais | Motivo |
|---|---|---|
| Chaves e dados de carteira | `valid_example_keys.csv`, `recovered-keys-*.zip`, `wallet_data.json` | Material secreto ou equivalente a credencial financeira |
| Passphrases e configurações | `config.py`, `full_pasted_content.txt`, `pasted_content3.txt` | Indicadores de segredo e configuração sensível |
| Recuperação e saque | `bitcoin_recovery*.py`, `recovery_program.py`, `check_balances.py`, `integrate_recovery_results.py`, `withdraw_funds.py`, `bitcoin_core.py`, `recovery.yml` | Automação operacional de recuperação, consulta privilegiada ou transferência |
| Pacotes brutos | `RecoveryBTC.zip`, `IntegrarEndereçoseChavesPrivadasaoBancodeDadosBitcoin.zip` | Conteúdo interno contém material sensível |

Para auditoria, os arquivos permaneceram no workspace local e não foram apagados, sobrescritos ou alterados.
