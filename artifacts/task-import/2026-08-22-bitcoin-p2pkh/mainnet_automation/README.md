
# Suite de Automação de Transações Bitcoin Mainnet

Este conjunto de ferramentas foi desenvolvido para automatizar a criação, validação e transmissão de transações P2PKH legadas na rede principal do Bitcoin, com foco em redundância e otimização de taxas.

## Componentes

1.  **`config.py`**: Arquivo central de configuração (endereços, chaves, estratégias).
2.  **`mainnet_tx_builder.py`**: Constrói a transação, seleciona UTXOs via API e assina.
3.  **`mainnet_tx_validator.py`**: Decodifica e valida a estrutura do hexadecimal gerado.
4.  **`mainnet_tx_broadcaster.py`**: Transmite a transação simultaneamente para Mempool.space, BlockCypher e Blockstream.

## Fluxo de Operação

1.  Configure a chave privada correta em `config.py`.
2.  Gere a transação:
    ```bash
    python3 mainnet_tx_builder.py
    ```
3.  Valide o resultado:
    ```bash
    python3 mainnet_tx_validator.py
    ```
4.  Execute o broadcast:
    ```bash
    python3 mainnet_tx_broadcaster.py
    ```

## Requisitos

*   Python 3.10+
*   `bitcoinlib`
*   `requests`

---
**Nota Técnica**: O sistema utiliza assinaturas ECDSA (curva SECP256k1) e suporta chaves públicas comprimidas, conforme detectado no histórico do endereço `113aNq...`.
