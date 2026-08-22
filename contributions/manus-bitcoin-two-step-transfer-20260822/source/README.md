# Transferência Bitcoin em duas etapas

Este diretório contém uma implementação isolada e **review-first** para o fluxo Mainnet:

> `P2PKH legado → P2PKH intermediário → P2WPKH nativo (Bech32)`

A implementação foi criada porque o artefato anterior misturava o marcador SegWit `00 01` e witness com uma entrada P2PKH legacy. Essa combinação produz erro de standardness, como `superfluous witness data`, e não deve ser retransmitida.

## Escopo

A etapa 1 usa o UTXO público previamente identificado em `e58c3e3028f23553f04287c8f6dce5ad4f413ee9e022f83e9223cabeaac93823:28`, caso ele continue não gasto. A saída principal é de `10.000 satoshis` para o endereço P2PKH intermediário. O restante é devolvido ao endereço de origem, descontada uma taxa fixa de `2.000 satoshis` para a revisão determinística do artefato.

A etapa 2 só pode ser criada depois que a etapa 1 existir e estiver confirmada. Ela exige uma segunda chave privada que controle o endereço intermediário. **A chave da origem não é assumida como chave do intermediário**; o fluxo falha se o WIF fornecido não derivar exatamente o endereço esperado.

## Bloqueio de custódia detectado

Durante a validação, o WIF fornecido para a tarefa derivou o endereço intermediário `1E4FSo55XCjSDhpXBsRkB5o9f4fkVxGtcL`, e não o endereço de origem `113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug`. O módulo recusou a etapa 1 por esse motivo. Como a consulta pública também mostrou que o intermediário não possui UTXOs nem histórico, não há uma etapa 2 financiada disponível para assinar. É necessário obter a chave correta da origem — sem compartilhá-la no repositório — ou confirmar uma origem diferente antes de qualquer transferência.

## Segurança

Nenhuma chave privada, senha, `.env` ou segredo é lido de arquivo versionado. Os WIFs devem ser fornecidos somente por variáveis de ambiente no processo local:

```bash
export BITCOIN_SOURCE_WIF='...'
export BITCOIN_INTERMEDIATE_WIF='...'
```

O valor da variável `BITCOIN_BROADCAST_CONFIRM` não é necessário para validação. A transmissão é desabilitada por padrão e exige simultaneamente `--broadcast` e `BITCOIN_BROADCAST_CONFIRM=I_UNDERSTAND_IRREVERSIBLE`. Os manifestos gerados recusam sobrescrever arquivos existentes e registram `secret_material_included: false`.

## Validação offline

Na raiz do repositório:

```bash
pytest -q bitcoin_two_step_transfer/test_two_step_transfer.py
```

Os testes verificam um vetor público determinístico, o programa witness `0014<20-byte-hash>` do destino Bech32 e a propriedade essencial da etapa 1: uma transação legacy não possui marcador/witness SegWit.

## Construção da etapa 1 — sem transmissão

O comando abaixo consulta somente UTXOs públicos, assina localmente e grava um manifesto sem chaves:

```bash
PYTHONPATH=bitcoin_two_step_transfer \
python3 bitcoin_two_step_transfer/transfer_workflow.py \
  --step 1 \
  --output bitcoin_two_step_transfer/artifacts/step1-review.json
```

Antes de qualquer broadcast, revisar o `txid`, o `tx_hex`, os valores, os endereços e o fee do manifesto. O estado observado durante a auditoria desta tarefa foi que o TXID legado `d21633ba23f70118185227be58a63527675641ad37967e2aa461559f577aec43` não foi encontrado no mempool/chain e que o endereço intermediário não possuía UTXOs nem histórico. Portanto, o artefato anterior não foi considerado transmitido.

## Transmissão — somente após confirmação explícita

A transmissão publica uma transação irreversível na Mainnet e só deve ser executada após revisão humana do manifesto. O comando de transmissão não deve ser automatizado em CI:

```bash
export BITCOIN_BROADCAST_CONFIRM=I_UNDERSTAND_IRREVERSIBLE
PYTHONPATH=bitcoin_two_step_transfer \
python3 bitcoin_two_step_transfer/transfer_workflow.py \
  --step 1 \
  --output bitcoin_two_step_transfer/artifacts/step1-broadcast.json \
  --broadcast
```

Depois da confirmação da etapa 1, a saída intermediária deve ser consultada novamente na rede e a etapa 2 deve ser construída com o TXID/vout/valor confirmados:

```bash
PYTHONPATH=bitcoin_two_step_transfer \
python3 bitcoin_two_step_transfer/transfer_workflow.py \
  --step 2 \
  --step1-txid '<TXID_CONFIRMADO_DA_ETAPA_1>' \
  --step1-vout 0 \
  --step1-value 10000 \
  --output bitcoin_two_step_transfer/artifacts/step2-review.json
```

O destino final é `bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8`. A etapa 2 é uma entrada P2PKH legacy com saída P2WPKH; portanto, a saída usa witness program, mas a entrada não usa witness.

## Estado da auditoria herdada

O manifesto anterior `bitcoin_mainnet_transaction_execution/pure_p2pkh_tx.json` contém uma transação que começa com `010000000001`, isto é, inclui marcador/witness SegWit apesar de declarar uma entrada P2PKH. A consulta pública ao TXID informado retornou `404 / Transaction not found`, e a consulta ao endereço intermediário retornou contagens zeradas. O novo módulo não reutiliza nem retransmite esse hex.
