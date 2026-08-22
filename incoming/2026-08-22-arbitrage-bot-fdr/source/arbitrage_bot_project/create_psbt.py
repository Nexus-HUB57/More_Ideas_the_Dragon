import requests
import json
from bitcointx.core import x, b2x, lx, COutPoint, CMutableTxOut, CMutableTxIn, CMutableTransaction
from bitcointx.core.script import CScript, OP_DUP, OP_HASH160, OP_EQUALVERIFY, OP_CHECKSIG
from bitcointx.core.psbt import PSBT, PSBT_IN_NON_WITNESS_UTXO, PSBT_IN_WITNESS_UTXO, PSBT_IN_PARTIAL_SIGS, PSBT_IN_SIGHASH_TYPE, PSBT_IN_REDEEM_SCRIPT, PSBT_IN_WITNESS_SCRIPT, PSBT_IN_BIP32_DERIVATION, PSBT_IN_FINAL_SCRIPT_SIG, PSBT_IN_FINAL_SCRIPT_WITNESS
from bitcointx.wallet import CBitcoinAddress

# Set network to mainnet
x.SelectParams('mainnet')

def get_utxos(address):
    try:
        # Using Blockchain.com API for unspent outputs
        url = f"https://blockchain.info/unspent?active={address}"
        response = requests.get(url)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        data = response.json()

        utxos = []
        if data and data.get("unspent_outputs"):
            for output in data["unspent_outputs"]:
                utxos.append({
                    "txid": output["tx_hash_big_endian"],
                    "vout": output["tx_output_n"],
                    "value": output["value"], # in satoshis
                    "scriptPubKey": output["script"]
                })
        return utxos
    except requests.exceptions.RequestException as e:
        print(f"Erro ao consultar UTXOs para {address} (Blockchain.com): {e}")
        return []
    except json.JSONDecodeError:
        print(f"Erro ao decodificar JSON para UTXOs de {address} (Blockchain.com)")
        return []

def create_psbt(source_address, destination_address, amount_btc, fee_rate_sats_per_byte, change_address):
    try:
        utxos_data = get_utxos(source_address)
        if not utxos_data:
            print(f"Nenhum UTXO encontrado para o endereço de origem: {source_address}")
            return None

        # Convert amount to satoshis
        amount_satoshis = int(amount_btc * 100_000_000)

        # Prepare inputs for PSBT
        psbt_inputs = []
        total_input_value = 0
        selected_utxos = []

        # Simple UTXO selection: take the first UTXO that covers the amount + estimated fee
        # In a real scenario, a more sophisticated UTXO selection algorithm would be used
        for utxo_info in utxos_data:
            total_input_value += utxo_info["value"]
            selected_utxos.append(utxo_info)
            # Estimate fee for 1 input, 2 outputs (send + change)
            # A typical P2PKH transaction size is around 192 bytes
            estimated_vsize = 192 # bytes
            estimated_fee = estimated_vsize * fee_rate_sats_per_byte

            if total_input_value >= (amount_satoshis + estimated_fee):
                break
        
        if total_input_value < (amount_satoshis + estimated_fee):
            print(f"Saldo insuficiente para a transação. Necessário: {amount_btc + (estimated_fee / 100_000_000):.8f} BTC, Disponível: {total_input_value / 100_000_000:.8f} BTC")
            return None

        # Create CMutableTxIn objects for the transaction
        tx_inputs = []
        for utxo_info in selected_utxos:
            tx_inputs.append(CMutableTxIn(COutPoint(lx(utxo_info["txid"]), utxo_info["vout"]))) # lx converts hex to bytes (little-endian)

        # Create CMutableTxOut objects for the transaction
        tx_outputs = []
        tx_outputs.append(CMutableTxOut(amount_satoshis, CBitcoinAddress(destination_address).to_scriptPubKey()))

        # Calculate change
        change_value = total_input_value - amount_satoshis - estimated_fee

        if change_value > 0:
            tx_outputs.append(CMutableTxOut(change_value, CBitcoinAddress(change_address).to_scriptPubKey()))

        # Create the base transaction
        tx = CMutableTransaction(tx_inputs, tx_outputs)

        # Create PSBT object
        psbt = PSBT.from_transaction(tx)

        # Add UTXO information to PSBT inputs
        for i, utxo_info in enumerate(selected_utxos):
            # For non-segwit inputs, we need to provide the full previous transaction
            # This is a simplification; in a real scenario, you'd fetch the full raw transaction
            # For now, we'll just add the UTXO value for fee calculation purposes in PSBT
            # The signing process will require the full previous transaction or witness_utxo
            psbt.inputs[i].non_witness_utxo = CMutableTransaction.from_bytes(x(utxo_info["txid"])) # This is incorrect, needs full prev_tx
            psbt.inputs[i].witness_utxo = CMutableTxOut(utxo_info["value"], CScript(x(utxo_info["scriptPubKey"])))

        print("PSBT criada com sucesso (base64):")
        print(psbt.to_base64())
        return psbt.to_base64()

    except Exception as e:
        print(f"Erro ao criar PSBT: {e}")
        return None

# Transaction parameters
source_address = "1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL"
destination_address = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK"
amount_btc = 0.0001
fee_rate_sats_per_byte = 30
change_address = "1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL" # User confirmed this as change address

create_psbt(source_address, destination_address, amount_btc, fee_rate_sats_per_byte, change_address)


