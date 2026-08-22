# Análise dos Arquivos de Carteira Bitcoin

## Resumo dos Arquivos Analisados

### Arquivos de Carteira Importada (Formato JSON)

1. **300.dat** - Carteira importada com 2 endereços:
   - 125AKhtDPtjZbJSDSeVEZFUf4Dz9ptNGqU
   - 1MBiuQc6L7vq5sc7k1qtfpb2KF5XfpbfmR

2. **301.dat** - Carteira HD padrão com seed:
   - Seed: "marriage steel million dress original father clock come flush ostrich kangaroo method abuse"
   - XPRV: xprv9s21ZrQH143K4Zm64JVnHmmMsfHefWe5r6Gd2CSRgWfSHE4PvRWrEDxkbnBVh9hT9r2PWbYQZo4iBNg7EiG517AgdhGcJvn49futQHVH7sC
   - XPUB: xpub661MyMwAqRbcH3qZAL2neui6Rh894yMwDKCDpar3ErCRA2PYTxq6n2HET2yM4eXkptg2FTBHxQVFzVhBzhNocaxtahKXAaobGkzPKAjJhWA

3. **302.dat** - Carteira importada com 1 endereço:
   - 125AKhtDPtjZbJSDSeVEZFUf4Dz9ptNGqU (mesmo do 300.dat)

4. **303.dat** - Carteira importada com 1 endereço:
   - 12fcWddtXyxrnxUn6UdmqCbSaVsaYKvHQp

5. **304.dat** - Carteira importada com 1 endereço:
   - 1CYtH4TeoAHZUZqCHBBkrLtwRh5Kquj82i

6. **305.dat** - Arquivo binário (não pôde ser lido como texto)

7. **310.dat** - Carteira com histórico extenso:
   - Contém centenas de endereços com histórico de transações
   - Endereço principal com atividade: 1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL

8. **500.backup** - Backup de carteira com histórico extenso:
   - Endereço principal: 113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug
   - Contém histórico detalhado de transações

9. **501.dat** - Idêntico ao 500.backup

10. **502.dat** - Não analisado ainda

## Endereços Únicos Identificados para Importação

1. 125AKhtDPtjZbJSDSeVEZFUf4Dz9ptNGqU (WIF: 5Jdc3NHeN78TGUfPeBs1dqRwVHdexUkVJSWoST1z8wfM3oWPjgG)
2. 1MBiuQc6L7vq5sc7k1qtfpb2KF5XfpbfmR (WIF: 5JzvCyc2NrYwYS1zoWmQJUxrT9gXyu5eeHjNjJouN7Tbh5Xr5WB)
3. 12fcWddtXyxrnxUn6UdmqCbSaVsaYKvHQp (WIF: KzfWTS3FvYWnSnWhncr6CwwfPmuHr1UFqgq6sFkGHf1zc49NirkC)
4. 1CYtH4TeoAHZUZqCHBBkrLtwRh5Kquj82i (WIF: KyUPU9P9KuHPah4dwwLP5GKEn5RACnzzPjTnNM2U3sFuxkCo1GZA)
5. 1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL (com histórico de transações)
6. 113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug (com histórico extenso de transações)

## Carteira HD (301.dat)
- Seed mnemônico disponível para importação completa
- Múltiplos endereços derivados disponíveis

## Status
- Arquivos analisados e chaves privadas extraídas
- Pronto para importação no gerenciador de carteiras
- Necessário validar saldos via API blockchain

