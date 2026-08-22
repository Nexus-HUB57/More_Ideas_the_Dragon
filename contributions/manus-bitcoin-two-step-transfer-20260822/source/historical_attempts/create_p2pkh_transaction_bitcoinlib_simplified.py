import requests
import json
from datetime import datetime
from bitcoinlib.keys import Key
from bitcoinlib.transactions import Transaction
from bitcoinlib.networks import Network

# Configurações da Mainnet
NETWORK = 'bitcoin'
SOURCE_ADDRESS = '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug' # Endereço P2PKH original
DESTINATION_ADDRESS_INTERMEDIATE = '1E4FSo55XCjSDhpXBsRkB5o9f4fkVxGtcL' # Endereço P2PKH intermediário
AMOUNT_BTC = 0.0001
AMOUNT_SATOSHIS = int(AMOUNT_BTC * 100_000_000)

# Chave privada para assinatura
PRIVATE_KEY_WIF = '<YOUR_PRIVATE_KEY_WIF>'

def get_utxos(address):
    url = f"https://mempool.space/api/address/{address}/utxo"
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        utxos = response.json()
        print(f"UTXOs encontrados para {address}: {len(utxos)}")
        return utxos
    except requests.exceptions.RequestException as e:
        print(f"Erro ao obter UTXOs para {address}: {e}")
        return []

def get_recommended_fee():
    url = "https://mempool.space/api/v1/fees/recommended"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        fees = response.json()
        min_relay_fee = 254 # sat/vB
        return max(fees["halfHourFee"], min_relay_fee)
    except requests.exceptions.RequestException as e:
        print(f"Erro ao obter taxa de transação: {e}")
        return 10  # Taxa padrão de fallback

def main():
    print("Iniciando a função main.")
    print("Iniciando geração e assinatura da primeira transação (P2PKH para P2PKH intermediário) usando bitcoinlib...")

    source_address = SOURCE_ADDRESS
    print(f"Endereço de origem: {source_address}")

    current_utxos = get_utxos(source_address)
    if not current_utxos:
        print("Não foi possível obter UTXOs. Abortando.")
        return

    fee_rate = get_recommended_fee()
    print(f"Taxa de transação recomendada: {fee_rate} sat/vB")

    try:
        key = Key(PRIVATE_KEY_WIF, network=NETWORK)

        # Selecionar um UTXO
        selected_utxo = None
        for utxo in current_utxos:
            if utxo["value"] >= AMOUNT_SATOSHIS:
                selected_utxo = utxo
                break

        if not selected_utxo:
            raise ValueError(f"Nenhum UTXO único encontrado com saldo suficiente. Necessário: {AMOUNT_SATOSHIS} satoshis.")

        # Estimar o tamanho da transação para calcular a taxa
        # P2PKH com 1 input e 2 outputs (destino + troco) é aproximadamente 192 bytes
        estimated_tx_size = 192 # bytes
        calculated_fee = estimated_tx_size * fee_rate

        total_input_value = selected_utxo["value"]
        change_value = total_input_value - AMOUNT_SATOSHIS - calculated_fee

        if change_value < 0:
            raise ValueError(f"Saldo insuficiente para cobrir o valor da transação e a taxa. Necessário: {AMOUNT_SATOSHIS + calculated_fee} satoshis, Disponível: {total_input_value} satoshis")

        # Criar a transação
        tx = Transaction(network=NETWORK)

        # Adicionar input. Deixar o bitcoinlib inferir o script_pubkey e scriptSig para P2PKH.
        tx.add_input(prev_txid=selected_utxo["txid"], output_n=selected_utxo["vout"], value=selected_utxo["value"], keys=[key])

        # Adicionar output para o endereço intermediário
        tx.add_output(value=AMOUNT_SATOSHIS, address=DESTINATION_ADDRESS_INTERMEDIATE)

        # Adicionar output de troco se for maior que o valor de poeira
        if change_value > 546: # Dust limit para P2PKH
            tx.add_output(value=change_value, address=source_address)

        # Assinar a transação
        tx.sign([key.wif()])

        tx_hex = tx.raw_hex()

        output_data = {
            "transaction_number": 1,
            "source_address": source_address,
            "destination_address": DESTINATION_ADDRESS_INTERMEDIATE,
            "amount_btc": AMOUNT_BTC,
            "amount_satoshis": AMOUNT_SATOSHIS,
            "fee_rate_sats_per_byte": fee_rate,
            "tx_hex": tx_hex,
            "timestamp": datetime.now().isoformat(),
            "status": "signed_with_bitcoinlib",
            "used_utxos": [selected_utxo]
        }

        output_filename = f'signed_transaction_bitcoinlib_1_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(output_filename, "w") as f:
            json.dump(output_data, f, indent=2)
        print(f"\nPrimeira transação assinada com sucesso e salva em {output_filename}")
        print("Raw Transaction Hex (assinada com bitcoinlib):\n" + tx_hex)

    except ValueError as ve:
        print(f"Erro ao gerar e assinar transação: {ve}")
    except Exception as e:
        print(f"Erro inesperado ao gerar e assinar transação: {e}")

if __name__ == '__main__':
    main()
