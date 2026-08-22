# Relatório de validação — transferência Bitcoin em duas etapas

**Data da auditoria:** 13 de agosto de 2026.

**Rede:** Bitcoin Mainnet.

**Fluxo-alvo:** P2PKH legado → P2PKH intermediário → P2WPKH nativo.

## Resultado executivo

A automação foi implementada em um diretório isolado, com testes offline aprovados e transmissão bloqueada por padrão. A transferência **não foi executada** porque as pré-condições de custódia não são satisfeitas: o WIF fornecido deriva o endereço intermediário `1E4FSo55XCjSDhpXBsRkB5o9f4fkVxGtcL`, e não o endereço de origem `113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug`.

O TXID herdado `d21633ba23f70118185227be58a63527675641ad37967e2aa461559f577aec43` foi consultado na API pública do mempool e retornou `404 Transaction not found`. A consulta do endereço intermediário informou `tx_count: 0` e nenhum UTXO financiado. Portanto, não existe uma saída intermediária confirmada para a etapa 2.

## Causa raiz técnica

O artefato anterior `bitcoin_mainnet_transaction_execution/pure_p2pkh_tx.json` começa com `010000000001`. O trecho `0001` após a versão é o marcador e a flag de uma transação SegWit. Entretanto, o input é P2PKH legacy e já contém `scriptSig`. Para esse caso, a serialização correta não possui marcador/flag SegWit nem campo witness. A mistura gera rejeições como `superfluous witness data` e não é retransmitida pelo novo módulo.

O novo serializador cria uma transação versão 1 legacy, calcula SIGHASH_ALL sobre o `scriptPubKey` P2PKH da entrada, usa uma assinatura ECDSA com `SIGHASH_ALL`, inclui a chave pública no `scriptSig` e cria a saída final Bech32 como `0014<20-byte-witness-program>` somente na etapa 2.

## Validações realizadas

| Verificação | Resultado |
|---|---|
| Repositório clonado em branch isolada | Aprovada |
| Chave privada inserida nos novos arquivos | Não; somente variáveis de ambiente |
| Teste determinístico de endereço Base58Check | Aprovado |
| Teste de programa P2WPKH do destino final | Aprovado |
| Assinatura e verificação ECDSA offline | Aprovada |
| Ausência de marcador/witness na transação P2PKH | Aprovada |
| Consulta do TXID herdado | Não encontrado |
| Consulta do endereço intermediário | Sem histórico e sem UTXO |
| Construção da etapa 1 com o WIF fornecido | Recusada por mismatch de endereço |
| Broadcast Mainnet | Não executado |

A suíte executada foi:

```text
pytest -q bitcoin_two_step_transfer/test_two_step_transfer.py
4 passed
```

## Próximas pré-condições

Para prosseguir com segurança, deve ser fornecido localmente o WIF que realmente controla a origem `113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug`, sem adicioná-lo ao Git. Em seguida, a etapa 1 deve ser construída em modo dry-run e revisada. Depois de sua confirmação explícita, o broadcast poderá ser realizado. Somente após a confirmação on-chain da saída de `10.000 satoshis` no endereço intermediário será possível construir a etapa 2; para assiná-la, o WIF do intermediário precisa estar disponível localmente. Nenhuma etapa de publicação deve ser automatizada em CI.
