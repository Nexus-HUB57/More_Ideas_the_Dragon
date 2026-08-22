import json
from bitcoinlib.keys import Key
from bitcoinlib.transactions import Transaction, TxInput, TxOutput
from bitcoinlib.networks import Network

def create_raw_transaction(
    utxos: list,
    recipient_address: str,
    amount_btc: float,
    sender_address: str,
    fee_satoshi_per_byte: int = 10
):
    """
    Cria uma transação Bitcoin em formato hexadecimal (raw transaction) sem assinar.
    A assinatura será feita manualmente pelo usuário.

    Args:
        utxos (list): Lista de UTXOs no formato retornado pela API do mempool.space.
                      Cada UTXO deve ser um dicionário com 'txid', 'vout', 'value' (em satoshis).
        recipient_address (str): Endereço Bitcoin do destinatário.
        amount_btc (float): Quantidade de Bitcoin a ser enviada.
        sender_address (str): Endereço do remetente (para o troco).
        fee_satoshi_per_byte (int): Taxa de transação em satoshis por byte.

    Returns:
        str: Transação não assinada em formato hexadecimal, ou None em caso de erro.
    """
    try:
        # Configura a rede para Mainnet
        Network.set_default("bitcoin")

        # Converte o valor a ser enviado para satoshis
        amount_satoshi = int(amount_btc * 100_000_000)

        # Prepara as entradas da transação (TxInput)
        tx_inputs = []
        total_input_satoshi = 0
        for utxo in utxos:
            tx_inputs.append(TxInput(utxo["txid"], utxo["vout"])) # Adiciona o UTXO como entrada
            total_input_satoshi += utxo["value"]

        if total_input_satoshi < amount_satoshi:
            print("Erro: Saldo insuficiente nos UTXOs fornecidos.")
            return None

        # Calcula a taxa estimada (aproximação inicial)
        # O tamanho exato da transação só é conhecido após a assinatura
        # Para simplificar, vamos estimar um tamanho fixo para o exemplo
        estimated_tx_size = 250  # bytes (valor de exemplo, pode variar)
        fee_satoshi = estimated_tx_size * fee_satoshi_per_byte

        # Calcula o troco
        change_satoshi = total_input_satoshi - amount_satoshi - fee_satoshi

        if change_satoshi < 0:
            print("Erro: Saldo insuficiente para cobrir o valor e a taxa.")
            return None

        # Prepara as saídas da transação (TxOutput)
        tx_outputs = [
            TxOutput(amount_satoshi, recipient_address),
        ]
        if change_satoshi > 0:
            tx_outputs.append(TxOutput(change_satoshi, sender_address))

        # Cria a transação
        tx = Transaction(inputs=tx_inputs, outputs=tx_outputs)

        # Retorna a transação não assinada em formato hexadecimal
        return tx.serialize()

    except Exception as e:
        print(f"Erro ao criar a transação: {e}")
        return None

if __name__ == "__main__":
    # Exemplo de uso
    # ATENÇÃO: NUNCA USE CHAVES PRIVADAS REAIS EM CÓDIGO DE PRODUÇÃO OU EM AMBIENTES NÃO SEGUROS.
    # ESTE É APENAS UM EXEMPLO ILUSTRATIVO.

    # UTXOs de exemplo (substitua pelos UTXOs reais obtidos da API)
    example_utxos = [
        {"txid": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2", "vout": 0, "value": 50000000}, # 0.5 BTC
        {"txid": "f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a3f4e5d6c7b8a9f0e1", "vout": 1, "value": 30000000}  # 0.3 BTC
    ]

    # Endereço do remetente (para o troco)
    sender_address = "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug"
    # Endereço do destinatário (exemplo)
    recipient_address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" # Endereço de Satoshi Nakamoto
    amount_to_send_btc = 0.7

    print(f"Criando transação para enviar {amount_to_send_btc} BTC para {recipient_address}")
    print(f"Usando UTXOs: {example_utxos}")

    raw_tx_hex = create_raw_transaction(
        example_utxos,
        recipient_address,
        amount_to_to_send_btc,
        sender_address
    )

    if raw_tx_hex:
        print("Transação hexadecimal não assinada:")
        print(raw_tx_hex)
    else:
        print("Falha ao criar a transação.")

    print("\nLembre-se que esta transação precisa ser assinada com a chave privada correspondente antes do broadcast.")
    print("O endereço de origem é '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug'.")
    print("Você precisará usar uma ferramenta externa para assinar esta transação com a chave privada.")

