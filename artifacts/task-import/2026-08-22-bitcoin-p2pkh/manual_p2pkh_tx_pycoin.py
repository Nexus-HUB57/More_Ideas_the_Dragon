import requests
import json
from datetime import datetime
from pycoin.key.Key import Key
from pycoin.tx.Tx import Tx, TxIn, TxOut
from pycoin.tx.script import tools
from pycoin.tx.script.flags import SIGHASH_ALL
from pycoin.encoding import wif_to_secret_exponent, public_pair_to_sec
from pycoin.networks import get_network_by_name

# Configurações da Mainnet
NETWORK = 'BTC'
SOURCE_ADDRESS = '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug'
DESTINATION_ADDRESS = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' # Example P2PKH address
AMOUNT_BTC = 0.0001
AMOUNT_SATOSHIS = int(AMOUNT_BTC * 100_000_000)

# Chave privada e senha para assinatura (conforme fornecido no contexto)
PRIVATE_KEY_WIF = '[REDACTED_WIF]'
PRIVATE_KEY_PASSWORD = '[REDACTED_SECRET]'

# Função para obter UTXOs de um endereço usando Mempool.space
def get_utxos(address):
    url = f"https://mempool.space/api/address/{address}/utxo"
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()  # Levanta HTTPError para códigos de status ruins (4xx ou 5xx)
        utxos = response.json()
        print(f"UTXOs encontrados para {address}: {len(utxos)}")
        return utxos
    except requests.exceptions.RequestException as e:
        print(f"Erro ao obter UTXOs para {address}: {e}")
        return []

# Função para obter taxa de transação recomendada
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
        return 10  # Taxa padrão de fallback (10 sat/vB)

def create_legacy_p2pkh_transaction_pycoin(available_utxos, source_address, destination_address, amount_satoshis, fee_rate_sats_per_byte, private_key_wif):
    total_input_value = 0
    selected_utxos = []

    # Estimate transaction size for 1 P2PKH input and 2 P2PKH outputs
    # A typical P2PKH input is about 148 bytes, P2PKH output is about 34 bytes.
    # Base transaction size is about 10 bytes.
    estimated_vsize = 10 + (148 * 1) + (34 * 2)
    estimated_fee = estimated_vsize * fee_rate_sats_per_byte

    target_value = amount_satoshis + estimated_fee

    sorted_utxos = sorted(available_utxos, key=lambda x: x["value"], reverse=True)
    for utxo in sorted_utxos:
        if total_input_value < target_value:
            selected_utxos.append(utxo)
            total_input_value += utxo["value"]
        else:
            break

    if total_input_value < target_value:
        raise ValueError(f"Saldo insuficiente ou UTXOs muito pequenos para cobrir {AMOUNT_BTC} BTC + taxa. Necessário: {target_value} satoshis, Disponível nos selecionados: {total_input_value} satoshis")

    # Create TxIn objects
    tx_ins = []
    for utxo in selected_utxos:
        tx_ins.append(TxIn(previous_hash=unhexlify(utxo["txid"]), previous_index=utxo["vout"])) # sequence defaults to 0xFFFFFFFF

    # Create TxOut objects
    tx_outs = []
    # Destination output
    tx_outs.append(TxOut(value=amount_satoshis, script=tools.script_for_address(destination_address)))

    # Change output
    change_value = total_input_value - amount_satoshis - estimated_fee
    if change_value > 546: # Dust limit
        tx_outs.append(TxOut(value=change_value, script=tools.script_for_address(source_address)))
    else:
        # If change is dust, it's added to the fee
        estimated_fee += change_value
        change_value = 0

    # Create the transaction object
    tx = Tx(version=1, tx_ins=tx_ins, tx_outs=tx_outs)

    # Sign the transaction
    secret_exponent = wif_to_secret_exponent(private_key_wif)
    key = Key(secret_exponent=secret_exponent)

    # For P2PKH, the script_public_key is derived from the source address
    # In a real scenario, you would fetch the scriptPubKey from the UTXO details.
    # For now, we derive it from the source_address
    source_script_public_key = tools.script_for_address(source_address)

    for i, utxo in enumerate(selected_utxos):
        # Sign each input
        tx.sign_tx_in(key, i, source_script_public_key, SIGHASH_ALL)

    return tx.as_hex(), selected_utxos

def main():
    print(f"Iniciando geração e assinatura manual de uma transação P2PKH legada com pycoin...")

    current_utxos = get_utxos(SOURCE_ADDRESS)
    if not current_utxos:
        print("Não foi possível obter UTXOs. Abortando.")
        return

    fee_rate = get_recommended_fee()
    print(f"Taxa de transação recomendada: {fee_rate} sat/vB")

    try:
        tx_hex, used_utxos = create_legacy_p2pkh_transaction_pycoin(current_utxos, SOURCE_ADDRESS, DESTINATION_ADDRESS, AMOUNT_SATOSHIS, fee_rate, PRIVATE_KEY_WIF)

        output_data = {
            "transaction_number": 1,
            "source_address": SOURCE_ADDRESS,
            "destination_address": DESTINATION_ADDRESS,
            "amount_btc": AMOUNT_BTC,
            "amount_satoshis": AMOUNT_SATOSHIS,
            "fee_rate_sats_per_byte": fee_rate,
            "tx_hex": tx_hex,
            "timestamp": datetime.now().isoformat(),
            "status": "signed_manual_pycoin",
            "used_utxos": used_utxos
        }

        output_filename = f'signed_transaction_manual_pycoin_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(output_filename, "w") as f:
            json.dump(output_data, f, indent=2)
        print(f"\nTransação assinada manualmente com pycoin com sucesso e salva em {output_filename}")
        print("Raw Transaction Hex (assinado manualmente com pycoin):\n" + tx_hex)

    except ValueError as ve:
        print(f"Erro ao gerar e assinar transação: {ve}")
    except Exception as e:
        print(f"Erro inesperado ao gerar e assinar transação: {e}")

if __name__ == '__main__':
    main()

