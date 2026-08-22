# Manifesto de integração segura — Bitcoin Quantum Wallet

## Escopo

Este diretório contém um snapshot versionado e isolado do aplicativo `bitcoin-quantum-wallet`, importado no repositório `Nexus-HUB57/More_Ideas_the_Dragon` sem substituir arquivos existentes. A importação foi feita em uma branch própria e todos os caminhos permanecem sob `artifacts/incoming/bitcoin-quantum-wallet-20260822/`.

## Proveniência e contagem

| Item | Valor |
|---|---:|
| Arquivos na árvore versionada do snapshot | 131 |
| Arquivos de código/documentação importados | 128 |
| Arquivos de controle adicionados (manifesto, aviso e hashes) | 3 |
| Arquivos numerados 001–299 já existentes no destino | 299 |
| Arquivos excluídos por segurança | 2 |
| Dependências `node_modules` copiadas | 0 |
| Arquivos existentes sobrescritos | 0 |
| Arquivos existentes excluídos | 0 |

## Exclusões deliberadas

Foram excluídos o módulo de transferência de emergência e sua página de interface, pois não é seguro versionar automação de assinatura ou broadcast de fundos reais. Também não foram copiados dependências, ambientes, logs, backups de carteira, chaves privadas, seeds, mnemonics, credenciais ou certificados. O snapshot não contém dados de fundos nem chaves privadas.

As passphrases e credenciais encontradas em documentação ou código foram redigidas para `[REDACTED: use a runtime secret outside version control]`. Segredos devem ser fornecidos exclusivamente por variáveis de ambiente ou pelo gerenciador de segredos do ambiente de execução.

## Integridade

`SHA256SUMS` contém os hashes dos arquivos do snapshot, excluindo o próprio arquivo de hashes. O pacote ZIP correspondente é gerado fora deste diretório para evitar autorreferência e é incluído separadamente no mesmo commit. O snapshot final contém 131 arquivos.

## Política de integração

A branch de trabalho não altera `main`, não reescreve histórico e não remove conteúdo de outros colaboradores. O push será feito somente para a branch isolada, permitindo revisão e merge pelos mantenedores do repositório.

## Observação operacional

Este artefato é uma integração de código e documentação. Ele não executa, agenda ou transmite transações Bitcoin reais e não deve ser usado como custodiante de fundos sem auditoria independente, revisão de segurança e controles operacionais apropriados.
