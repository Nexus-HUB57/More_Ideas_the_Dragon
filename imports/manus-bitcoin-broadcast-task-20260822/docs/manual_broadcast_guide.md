# Guia para Assinatura Manual e Broadcast de Transações Bitcoin

Este guia detalha o processo de assinatura manual de uma transação Bitcoin hexadecimal e seu posterior broadcast para a rede Mainnet, utilizando os serviços preferenciais.

## 1. Obtenção da Transação Hexadecimal Não Assinada

Você já possui um script (`generate_raw_tx.py`) que gera a transação hexadecimal não assinada para a quantidade e endereço de destino especificados. O resultado deste script é salvo no arquivo `raw_transaction.txt`.

**Exemplo de Conteúdo de `raw_transaction.txt` (após execução do script):**

```
Criando transação não assinada para enviar 0.0001 BTC para 1MbUpPMCZast3C7KxeEWqUTueZDTRDXxwD

Transação hexadecimal não assinada:
<SUA_TRANSACAO_HEXADECIMAL_NAO_ASSINADA_AQUI>

Esta transação precisa ser assinada com a chave privada correspondente antes do broadcast.
O endereço de origem é '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug'.
Você precisará usar uma ferramenta externa para assinar esta transação com a chave privada.
```

Copie a string hexadecimal da transação (a linha que começa após "Transação hexadecimal não assinada:").

## 2. Assinatura Manual da Transação

Para assinar a transação, você precisará de uma ferramenta externa que suporte a importação de chaves privadas no formato WIF (Wallet Import Format) e a assinatura de transações brutas. **É crucial que você utilize uma ferramenta confiável e em um ambiente seguro para esta etapa, pois ela envolve o manuseio de sua chave privada.**

**Informações necessárias para a assinatura:**

*   **Transação Hexadecimal Não Assinada:** Obtida no passo 1.
*   **Endereço de Origem:** `113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug`

**Ferramentas Sugeridas para Assinatura (Exemplos - use com cautela e pesquisa):**

*   **Bitcoin Core (com `signrawtransactionwithkey`):** Se você executa um nó Bitcoin Core, pode usar o comando RPC `signrawtransactionwithkey` após importar a chave privada.
*   **Carteiras de Hardware/Software com funcionalidade de assinatura de transações brutas:** Algumas carteiras avançadas permitem importar chaves e assinar transações offline.
*   **Ferramentas online de assinatura de transações (NÃO RECOMENDADO para chaves reais):** Existem sites que oferecem este serviço, mas o risco de segurança é extremamente alto. **Evite usar chaves reais em qualquer serviço online.**

Após a assinatura, você obterá uma nova string hexadecimal: a **transação hexadecimal assinada**.

## 3. Broadcast da Transação Assinada

Com a transação hexadecimal assinada em mãos, você pode transmiti-la para a rede Bitcoin usando os serviços de broadcast. Copie a transação hexadecimal assinada e cole-a no campo apropriado em um dos seguintes exploradores de blockchain:

### 3.1. Serviço Primário: Blockchain.com

1.  Acesse: [https://www.blockchain.com/pt/explorer/assets/btc/broadcast-transaction](https://www.blockchain.com/pt/explorer/assets/btc/broadcast-transaction)
2.  Cole a transação hexadecimal assinada na caixa de texto.
3.  Clique no botão "Broadcast Transaction".

### 3.2. Serviços de Fallback

Se o blockchain.com não funcionar ou você preferir usar uma alternativa:

*   **Mempool.space:**
    1.  Acesse: [https://mempool.space/tx/push](https://mempool.space/tx/push)
    2.  Cole a transação hexadecimal assinada no campo "Raw transaction (hex)".
    3.  Clique em "Broadcast transaction".

*   **Blockstream.info:**
    1.  Acesse: [https://blockstream.info/tx/push](https://blockstream.info/tx/push)
    2.  Cole a transação hexadecimal assinada no campo "Raw transaction (hex)".
    3.  Clique em "Broadcast transaction".

Após o broadcast, o serviço deve retornar um ID de transação (TXID) se a transmissão for bem-sucedida. Você pode usar este TXID para monitorar o status da sua transação em qualquer explorador de blockchain.

**Importante:** Verifique sempre o TXID e o status da transação para confirmar que ela foi incluída na blockchain. Em caso de dúvidas ou problemas, consulte a documentação das ferramentas ou procure suporte especializado.

