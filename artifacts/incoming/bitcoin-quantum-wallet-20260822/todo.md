# Bitcoin Quantum Wallet - TODO

## Fase 1: Configuração Base e Schema de Banco de Dados ✅

- [x] Definir schema de banco de dados (wallets, addresses, transactions, utxos, operationHistory)
- [x] Implementar tabelas Drizzle ORM
- [x] Executar migrações do banco de dados

## Fase 2: Módulo Criptográfico Backend ✅

- [x] Implementar gerador de mnemonic (BIP39)
- [x] Implementar derivação de chaves (BIP32/BIP44)
- [x] Implementar gerador de chaves ECDSA (secp256k1)
- [x] Implementar validação de endereço Bitcoin (Base58Check, Bech32)
- [x] Implementar criptografia de chaves privadas (AES-256-CBC + PBKDF2)
- [ ] Implementar decodificador Base58
- [ ] Implementar codificador hexadecimal para transações
- [ ] Implementar validação de UTXO
- [ ] Implementar gerador de transações Bitcoin
- [ ] Implementar assinador de transações (ECDSA)
- [ ] Implementar integração com APIs de blockchain (Blockchair, Mempool.space)
- [ ] Implementar recuperação de carteira Electrum
- [ ] Implementar importação de wallet.dat do Bitcoin Core

## Fase 3: APIs tRPC Backend ✅

- [x] Criar procedimento para gerar nova carteira
- [x] Criar procedimento para importar carteira via mnemonic
- [x] Criar procedimento para listar carteiras do usuário
- [x] Criar procedimento para obter detalhes da carteira
- [x] Criar procedimento para validar endereço Bitcoin
- [x] Criar procedimento para gerar novo endereço
- [x] Criar procedimento para listar endereços da carteira
- [x] Criar procedimento para recuperar histórico de transações
- [ ] Criar procedimento para importar carteira via wallet.dat
- [ ] Criar procedimento para obter saldo de endereço
- [ ] Criar procedimento para gerar transação
- [ ] Criar procedimento para assinar transação
- [ ] Criar procedimento para broadcast de transação
- [ ] Criar procedimento para sincronizar UTXOs
- [ ] Criar procedimento para gerenciar Master Wallet (FDR)
- [ ] Criar procedimento para gerenciar Master Key com passphrase

## Fase 4: Interface Frontend - Layout e Navegação ✅

- [x] Definir design style e paleta de cores
- [x] Criar layout principal com navegação
- [x] Implementar autenticação OAuth
- [x] Criar página Home com dashboard principal
- [x] Implementar roteamento entre páginas

## Fase 5: Interface Frontend - Funcionalidades Principais ✅

- [x] Criar componente de gerador de nova carteira
- [x] Criar componente de importador de carteira (mnemonic)
- [x] Criar componente de listagem de carteiras
- [x] Criar componente de detalhes da carteira
- [x] Criar componente de listagem de endereços
- [x] Criar componente de gerador de novo endereço
- [x] Criar componente de visualizador de transações
- [x] Criar componente de histórico de transações
- [x] Criar componente de validação de endereço
- [x] Criar componente de cópia para clipboard
- [ ] Criar componente de importador de carteira (wallet.dat)
- [ ] Criar componente de visualizador de mnemonic com proteção
- [ ] Criar componente de QR code para endereço
- [ ] Criar componente de exibição de saldo em tempo real

## Fase 6: Integração de Funcionalidades Avançadas - Em Progresso

- [ ] Integrar protocolo PESBM no Dashboard
- [ ] Implementar sistema de upload de carteiras (.dat, .txt)
- [ ] Implementar sincronização automática de UTXOs
- [ ] Implementar broadcast automático de transações
- [ ] Implementar recuperação de carteira com seed phrase
- [ ] Implementar backup seguro de chaves privadas
- [ ] Implementar gerador de QR codes
- [ ] Implementar integração com APIs de blockchain
- [ ] Implementar construtor de transações
- [ ] Implementar assinador de transações (PSBT)

## Fase 7: Segurança e Auditoria

- [ ] Implementar validação de senha forte
- [ ] Implementar proteção contra CSRF
- [ ] Implementar rate limiting em operações críticas
- [ ] Implementar auditoria de todas as operações
- [ ] Implementar proteção contra timing attacks
- [ ] Implementar proteção contra XSS
- [ ] Implementar Content Security Policy
- [ ] Implementar validação de entrada em todas as APIs

## Fase 8: Testes e Qualidade

- [ ] Testes unitários de criptografia
- [ ] Testes de validação de endereço
- [ ] Testes de geração de transações
- [ ] Testes de integração com blockchain
- [ ] Testes de segurança
- [ ] Testes de performance
- [ ] Testes end-to-end

## Fase 9: Documentação

- [ ] Documentação de API tRPC
- [ ] Guia de uso para usuários
- [ ] Documentação de segurança
- [ ] Documentação de arquitetura
- [ ] README.md com instruções de setup

## Fase 10: Deploy e Finalização

- [ ] Revisar todas as funcionalidades
- [ ] Corrigir bugs identificados
- [ ] Otimizar performance
- [ ] Preparar para deploy
- [ ] Criar checkpoint final


## Fase 6.1: Importação de Carteiras via Arquivos de Backup - ✅ Completa

- [x] Implementar parser para arquivos TXT (Electrum, chaves privadas simples)
- [x] Implementar parser para arquivos DAT (Bitcoin Core wallet.dat)
- [x] Implementar parser para arquivos JSON (Exodus, outras carteiras)
- [x] Implementar extração de chaves privadas (WIF, xprv, seed)
- [x] Implementar validação de integridade de arquivos
- [x] Implementar detecção automática de formato de arquivo
- [x] Implementar criptografia de dados importados
- [ ] Implementar integração com Master Wallet (FDR)
- [ ] Implementar integração com Master Key (passphrase: [REDACTED: use a runtime secret outside version control])
- [x] Criar procedimento tRPC: importWalletFromFile
- [x] Criar procedimento tRPC: importWalletFromDAT
- [ ] Criar procedimento tRPC: importWalletFromJSON
- [x] Criar componente frontend: FileUploadWallet (ImportWalletFile.tsx)
- [x] Criar componente frontend: WalletFileParser
- [x] Implementar validação de arquivo no frontend
- [x] Implementar preview de dados antes de importar


## Fase 7: Importação de Fundo Gênesis (FDR) - ✅ Completa

- [x] Implementar parser para CSV do FDR Master Wallet (423.190 pares)
- [x] Implementar parser para JSON encrypted backup do FDR
- [x] Implementar validação e deduplicação de endereços/chaves
- [x] Implementar integração com Master Wallet FDR
- [x] Implementar proteção com Master Key (passphrase: [REDACTED: use a runtime secret outside version control])
- [x] Implementar criptografia CAISK (AES-256-GCM + PBKDF2)
- [x] Criar procedimento tRPC: importFDRMasterWallet
- [x] Criar procedimento tRPC: validateFDRData
- [x] Criar procedimento tRPC: getFDRStats
- [x] Criar procedimento tRPC: generateFDRReport
- [x] Criar componente frontend: ImportFDR (FDRImportWizard)
- [x] Implementar visualização de estatísticas do FDR
- [x] Implementar relatório consolidado do FDR
- [x] Adicionar link para importação do FDR na página Home
