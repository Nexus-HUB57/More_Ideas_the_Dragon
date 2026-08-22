# Fluxo Seguro de Transações Bitcoin

Este documento descreve um fluxo de desenvolvimento e revisão. Ele não contém uma transação assinada e não executa broadcast.

## Etapa 1 — P2PKH para custódia intermediária

1. Selecionar uma UTXO confirmada cujo `scriptPubKey` corresponda ao hash160 do endereço de origem.
2. Confirmar, por fonte independente, que a UTXO ainda está não gasta.
3. Decodificar o endereço de custódia e gerar o script P2PKH correto.
4. Calcular taxa com base no tamanho virtual estimado e no feerate aprovado.
5. Construir a transação não assinada e verificar soma de entradas, saídas e taxa.
6. Assinar localmente em dispositivo seguro, sem expor a chave ao repositório.
7. Verificar a assinatura e obter aprovação humana antes do broadcast.

## Etapa 2 — custódia intermediária para cold wallet SegWit

A segunda etapa somente pode ser criada depois que a primeira transação estiver confirmada e a nova UTXO existir no endereço intermediário. Um JSON descritivo não substitui o txid confirmado da primeira etapa.

Para um destino P2WPKH nativo, o output deve ser `OP_0 <20-byte witness-program>` derivado do endereço Bech32. Não se deve inserir witness data em uma transação que não possua marker/flag SegWit, nem tratar um output P2WPKH como prova de posse da chave do destino.

## Critérios de bloqueio

A operação deve parar quando faltar qualquer um destes elementos: chave privada correspondente, UTXO confirmada, scriptPubKey verificável, taxa aprovada, endereço de destino validado, assinatura verificável ou aprovação humana. Nenhum artefato deste pacote autoriza movimentação de BTC.
