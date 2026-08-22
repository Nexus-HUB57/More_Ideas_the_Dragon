import hashlib
from binascii import hexlify, unhexlify
import ecdsa
from ecdsa import SigningKey, SECP256k1
from bitcoinlib.keys import Key
import requests
import json
from datetime import datetime
from ripemd import ripemd160

# Configurações da Mainnet
NETWORK = 'bitcoin'
SOURCE_ADDRESS = '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug' # Confirmed address with funds
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

def hash256(s):
    return hashlib.sha256(hashlib.sha256(s).digest()).digest()

def encode_varint(i):
    if i < 0xfd:
        return i.to_bytes(1, 'little')
    elif i < 0x10000:
        return b'\xfd' + i.to_bytes(2, 'little')
    elif i < 0x100000000:
        return b'\xfe' + i.to_bytes(4, 'little')
    else:
        return b'\xff' + i.to_bytes(8, 'little')

BASE58_ALPHABET = b'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

def base58_decode(s):
    num = 0
    for char in s.encode('ascii'):
        num = num * 58 + BASE58_ALPHABET.find(char)
    
    # Determine the number of leading zeros
    leading_zeros = 0
    for char in s:
        if char == '1':
            leading_zeros += 1
        else:
            break

    # Convert to bytes, pad with leading zeros if necessary
    combined = num.to_bytes((num.bit_length() + 7) // 8, 'big')
    combined = b'\x00' * leading_zeros + combined

    if len(combined) < 4:
        raise ValueError('Invalid base58 string length')

    checksum = combined[-4:]
    payload = combined[:-4]
    if hash256(payload)[:4] != checksum:
        raise ValueError('Invalid checksum')
    return payload

def script_pubkey_p2pkh(pubkey_hash):
    # P2PKH scriptPubKey: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
    # 76 A9 14 {20-byte-hash} 88 AC
    return b'\x76\xa9\x14' + pubkey_hash + b'\x88\xac'

def create_legacy_p2pkh_transaction_manual(available_utxos, source_address, destination_address, amount_satoshis, fee_rate_sats_per_byte, private_key_wif):
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

    # Transaction components
    version = (1).to_bytes(4, 'little')
    input_count = encode_varint(len(selected_utxos))
    outputs_raw = b''

    # Prepare outputs
    output_count = encode_varint(2) # Destination and change

    # Destination output
    dest_value = amount_satoshis.to_bytes(8, 'little')
    dest_pubkey_hash = base58_decode(destination_address)[1:]
    dest_script_pubkey = script_pubkey_p2pkh(dest_pubkey_hash)
    dest_script_pubkey_len = encode_varint(len(dest_script_pubkey))
    outputs_raw += dest_value + dest_script_pubkey_len + dest_script_pubkey

    # Change output
    change_value = total_input_value - amount_satoshis - estimated_fee
    if change_value < 546: # Dust limit
        estimated_fee += change_value
        change_value = 0
        output_count = encode_varint(1) # Only destination output
        outputs_raw = dest_value + dest_script_pubkey_len + dest_script_pubkey # Reset outputs_raw if change is dust
    else:
        change_value_bytes = change_value.to_bytes(8, 'little')
        change_pubkey_hash = base58_decode(source_address)[1:]
        change_script_pubkey = script_pubkey_p2pkh(change_pubkey_hash)
        change_script_pubkey_len = encode_varint(len(change_script_pubkey))
        outputs_raw += change_value_bytes + change_script_pubkey_len + change_script_pubkey

    locktime = (0).to_bytes(4, 'little')
    sighash_type = (1).to_bytes(4, 'little') # SIGHASH_ALL

    # Private key for signing
    private_key_obj = Key(private_key_wif, network=NETWORK, password=[REDACTED_SECRET]
    private_key_bytes = unhexlify(private_key_obj.private_hex) # Correct way to get raw private key bytes
    signing_key = SigningKey.from_string(private_key_bytes, curve=SECP256k1)
    public_key_bytes = unhexlify(private_key_obj.public_hex) # Correct way to get raw public key bytes

    # Construct transaction for signing (SIGHASH_ALL)
    # This involves replacing the scriptSig of the input being signed with its scriptPubKey
    # and setting other scriptSigs to empty.
    # For P2PKH, the scriptPubKey is the locking script of the UTXO being spent.
    # We need the scriptPubKey of the UTXO from the blockchain.
    # The scriptCode for P2PKH is the scriptPubKey of the UTXO being spent.
    # We need to get the scriptPubKey of the specific UTXO from the blockchain, not just from the source_address.
    # For simplicity, assuming the UTXO's scriptPubKey is derived from the source_address.
    source_pubkey_hash = base58_decode(source_address)[1:]
    source_script_pubkey_for_signing = script_pubkey_p2pkh(source_pubkey_hash)

    # Build the transaction to be signed
    tx_for_signing_parts = [
        version,
        input_count
    ]

    for i, utxo in enumerate(selected_utxos):
        txid_bytes = unhexlify(utxo["txid"])[::-1]
        vout_bytes = utxo["vout"].to_bytes(4, 'little')
        sequence = (0xFFFFFFFF).to_bytes(4, 'little')

        if i == 0: # The input we are signing
            # The scriptCode for P2PKH is the scriptPubKey of the UTXO being spent.
            # This is the script that was in the output of the previous transaction.
            # We are assuming the UTXO's scriptPubKey is derived from the source_address.
            script_code = source_script_pubkey_for_signing
            script_code_len = encode_varint(len(script_code))
            tx_for_signing_parts.append(txid_bytes)
            tx_for_signing_parts.append(vout_bytes)
            tx_for_signing_parts.append(script_code_len)
            tx_for_signing_parts.append(script_code)
            tx_for_signing_parts.append(sequence)
        else: # Other inputs (not handled in this simplified example)
            # For SIGHASH_ALL, other inputs should have empty scriptSig
            tx_for_signing_parts.append(txid_bytes)
            tx_for_signing_parts.append(vout_bytes)
            tx_for_signing_parts.append(encode_varint(0)) # Empty scriptSig
            tx_for_signing_parts.append(sequence)

    tx_for_signing_parts.extend([
        output_count,
        outputs_raw,
        locktime,
        sighash_type
    ])

    tx_for_signing = b''.join(tx_for_signing_parts)
    hash_to_sign = hash256(tx_for_signing)

    # Sign the hash
    signature = signing_key.sign(hash_to_sign, sigencode=ecdsa.util.sigencode_der_canonize)
    signature_with_sighash_type = signature + b'\x01' # SIGHASH_ALL

    # Construct final scriptSig
    # P2PKH scriptSig: <signature> <pubKey>
    # The signature should be DER-encoded + SIGHASH_TYPE byte
    # The public key should be compressed or uncompressed, matching the one used to derive the address
    script_sig = encode_varint(len(signature_with_sighash_type)) + signature_with_sighash_type + \
                 encode_varint(len(public_key_bytes)) + public_key_bytes

    # Reconstruct the final transaction with the actual scriptSig
    final_tx_parts = [
        version,
        input_count
    ]

    for i, utxo in enumerate(selected_utxos):
        txid_bytes = unhexlify(utxo["txid"])[::-1]
        vout_bytes = utxo["vout"].to_bytes(4, 'little')
        sequence = (0xFFFFFFFF).to_bytes(4, 'little')

        if i == 0: # Apply scriptSig to the first input
            script_sig_len = encode_varint(len(script_sig))
            final_tx_parts.append(txid_bytes)
            final_tx_parts.append(vout_bytes)
            final_tx_parts.append(script_sig_len)
            final_tx_parts.append(script_sig)
            final_tx_parts.append(sequence)
        else:
            # For other inputs, the scriptSig is empty in the final transaction as well
            final_tx_parts.append(txid_bytes)
            final_tx_parts.append(vout_bytes)
            final_tx_parts.append(encode_varint(0)) # Empty scriptSig
            final_tx_parts.append(sequence)

    final_tx_parts.extend([
        output_count,
        outputs_raw,
        locktime
    ])

    final_tx_hex = hexlify(b''.join(final_tx_parts)).decode('ascii')

    return final_tx_hex, selected_utxos

def main():
    print(f"Iniciando geração e assinatura manual de uma transação P2PKH legada...")

    # Use the hardcoded SOURCE_ADDRESS
    source_address = SOURCE_ADDRESS
    print(f"Endereço de origem: {source_address}")

    current_utxos = get_utxos(source_address)
    if not current_utxos:
        print("Não foi possível obter UTXOs. Abortando.")
        return

    fee_rate = get_recommended_fee()
    print(f"Taxa de transação recomendada: {fee_rate} sat/vB")

    try:
        tx_hex, used_utxos = create_legacy_p2pkh_transaction_manual(current_utxos, source_address, DESTINATION_ADDRESS, AMOUNT_SATOSHIS, fee_rate, PRIVATE_KEY_WIF)
        
        output_data = {
            "transaction_number": 1,
            "source_address": source_address,
            "destination_address": DESTINATION_ADDRESS,
            "amount_btc": AMOUNT_BTC,
            "amount_satoshis": AMOUNT_SATOSHIS,
            "fee_rate_sats_per_byte": fee_rate,
            "tx_hex": tx_hex,
            "timestamp": datetime.now().isoformat(),
            "status": "signed_manual_byte_by_byte",
            "used_utxos": used_utxos
        }
        
        output_filename = f'signed_transaction_manual_byte_by_byte_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(output_filename, "w") as f:
            json.dump(output_data, f, indent=2)
        print(f"\nTransação assinada manualmente com sucesso e salva em {output_filename}")
        print("Raw Transaction Hex (assinado manualmente):\n" + tx_hex)

    except ValueError as ve:
        print(f"Erro ao gerar e assinar transação: {ve}")
    except Exception as e:
        print(f"Erro inesperado ao gerar e assinar transação: {e}")

if __name__ == '__main__':
    main()


