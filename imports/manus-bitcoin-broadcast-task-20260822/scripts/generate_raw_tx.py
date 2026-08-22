import json
import json
from bitcoin import mktx

def create_unsigned_raw_transaction(
    utxos: list,
    recipient_address: str,
    amount_btc: float,
    sender_address: str,
    fee_satoshi_per_byte: int = 10
):
    try:
        amount_satoshi = int(amount_btc * 100_000_000)
        tx_inputs = []
        total_input_satoshi = 0
        for utxo in utxos:
            tx_inputs.append({'output': f'{utxo["txid"]}:{utxo["vout"]}', 'value': utxo['value']})
            total_input_satoshi += utxo['value']

        if total_input_satoshi < amount_satoshi:
            print("Erro: Saldo insuficiente nos UTXOs fornecidos.")
            return None

        estimated_tx_size = len(tx_inputs) * 148 + 2 * 34 + 10
        fee_satoshi = estimated_tx_size * fee_satoshi_per_byte
        change_satoshi = total_input_satoshi - amount_satoshi - fee_satoshi

        if change_satoshi < 0:
            print("Erro: Saldo insuficiente para cobrir o valor e a taxa.")
            return None

        tx_outputs = [
            {'address': recipient_address, 'value': amount_satoshi},
        ]
        if change_satoshi > 0:
            tx_outputs.append({'address': sender_address, 'value': change_satoshi})

        unsigned_tx = mktx(tx_inputs, tx_outputs)
        return unsigned_tx

    except Exception as e:
        print(f"Erro ao criar a transação: {e}")
        return None

if __name__ == "__main__":
    sender_address = "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug"
    recipient_address = "1MbUpPMCZast3C7KxeEWqUTueZDTRDXxwD"
    amount_to_send_btc = 0.0001

    with open("utxos.json", "r") as f:
        utxos = json.load(f)

    print(f"Criando transação não assinada para enviar {amount_to_send_btc} BTC para {recipient_address}")

    raw_tx_hex = create_unsigned_raw_transaction(
        utxos,
        recipient_address,
        amount_to_send_btc,
        sender_address
    )

    if raw_tx_hex:
        print("\nTransação hexadecimal não assinada:")
        print(raw_tx_hex)
    else:
        print("\nFalha ao criar a transação.")

    print("\nEsta transação precisa ser assinada com a chave privada correspondente antes do broadcast.")
    print("O endereço de origem é '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug'.")
    print("Você precisará usar uma ferramenta externa para assinar esta transação com a chave privada.")

