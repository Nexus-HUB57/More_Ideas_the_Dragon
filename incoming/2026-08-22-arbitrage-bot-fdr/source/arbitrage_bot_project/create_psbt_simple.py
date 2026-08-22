import requests
import json
import hashlib
import struct

def get_utxos(address):
    try:
        # Using Blockchain.com API for unspent outputs
        url = f"https://blockchain.info/unspent?active={address}"
        response = requests.get(url)
        response.raise_for_status()
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

def create_raw_transaction_template(source_address, destination_address, amount_btc, fee_rate_sats_per_byte, change_address):
    try:
        utxos_data = get_utxos(source_address)
        if not utxos_data:
            print(f"Nenhum UTXO encontrado para o endereço de origem: {source_address}")
            return None

        # Convert amount to satoshis
        amount_satoshis = int(amount_btc * 100_000_000)

        # Simple UTXO selection: take the first UTXO that covers the amount + estimated fee
        total_input_value = 0
        selected_utxos = []

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

        # Calculate change
        change_value = total_input_value - amount_satoshis - estimated_fee

        print("=== DADOS PARA CRIAÇÃO DA PSBT ===")
        print(f"Endereço de origem: {source_address}")
        print(f"Endereço de destino: {destination_address}")
        print(f"Valor a enviar: {amount_btc} BTC ({amount_satoshis} satoshis)")
        print(f"Taxa de transação: {fee_rate_sats_per_byte} sat/vB")
        print(f"Taxa estimada: {estimated_fee} satoshis")
        print(f"Endereço de troco: {change_address}")
        print(f"Valor do troco: {change_value} satoshis")
        print()
        print("=== UTXOs SELECIONADOS ===")
        for i, utxo in enumerate(selected_utxos):
            print(f"UTXO {i+1}:")
            print(f"  TXID: {utxo['txid']}")
            print(f"  VOUT: {utxo['vout']}")
            print(f"  Valor: {utxo['value']} satoshis")
            print(f"  ScriptPubKey: {utxo['scriptPubKey']}")
            print()

        print("=== INSTRUÇÕES PARA CRIAR A PSBT MANUALMENTE ===")
        print("1. Use uma ferramenta como Electrum, Bitcoin Core ou uma hardware wallet")
        print("2. Crie uma nova transação com os seguintes parâmetros:")
        print(f"   - Inputs: {len(selected_utxos)} UTXO(s) listados acima")
        print(f"   - Output 1: {amount_satoshis} satoshis para {destination_address}")
        if change_value > 0:
            print(f"   - Output 2: {change_value} satoshis para {change_address} (troco)")
        print(f"   - Taxa: {estimated_fee} satoshis ({fee_rate_sats_per_byte} sat/vB)")
        print()
        print("3. Exporte a transação como PSBT (Partially Signed Bitcoin Transaction)")
        print("4. Assine a PSBT com sua chave privada")
        print("5. Me forneça a PSBT assinada para transmissão")

        # Create a simple transaction template for reference
        transaction_template = {
            "inputs": selected_utxos,
            "outputs": [
                {
                    "address": destination_address,
                    "value": amount_satoshis
                }
            ],
            "fee": estimated_fee,
            "change": {
                "address": change_address,
                "value": change_value
            } if change_value > 0 else None
        }

        # Save transaction template to file
        with open("/home/ubuntu/transaction_template.json", "w") as f:
            json.dump(transaction_template, f, indent=2)
        
        print("Dados da transação salvos em: /home/ubuntu/transaction_template.json")
        return transaction_template

    except Exception as e:
        print(f"Erro ao criar template de transação: {e}")
        return None

# Transaction parameters
source_address = "1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL"
destination_address = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK"
amount_btc = 0.0001
fee_rate_sats_per_byte = 30
change_address = "1MVnvVoAmkhPiRg5FXew8gWNRWVTLmUKXL" # User confirmed this as change address

create_raw_transaction_template(source_address, destination_address, amount_btc, fee_rate_sats_per_byte, change_address)

