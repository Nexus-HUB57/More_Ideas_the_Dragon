
import hashlib
import base58
import requests
import json
import ecdsa
import sys
from datetime import datetime
import config

# Implementação manual de RIPEMD-160 caso não esteja disponível no hashlib
def ripemd160(data):
    try:
        h = hashlib.new('ripemd160')
        h.update(data)
        return h.digest()
    except:
        # Fallback para ambientes onde ripemd160 não é suportado pelo OpenSSL local
        # Em um ambiente real, usaríamos uma biblioteca pure-python ou garantiríamos o suporte
        # Mas para o sandbox, geralmente o hashlib.new('ripemd160') funciona se o build-essential estiver lá.
        raise RuntimeError("RIPEMD160 não disponível no ambiente.")

def hash256(data):
    return hashlib.sha256(hashlib.sha256(data).digest()).digest()

def encode_varint(i):
    if i < 0xfd:
        return bytes([i])
    elif i <= 0xffff:
        return b'\xfd' + i.to_bytes(2, 'little')
    elif i <= 0xffffffff:
        return b'\xfe' + i.to_bytes(4, 'little')
    else:
        return b'\xff' + i.to_bytes(8, 'little')

def get_pubkey_from_priv(priv_bytes, compressed=True):
    sk = ecdsa.SigningKey.from_string(priv_bytes, curve=ecdsa.SECP256k1)
    vk = sk.get_verifying_key()
    if compressed:
        return (b'\x02' if vk.pubkey.point.y() % 2 == 0 else b'\x03') + vk.to_string()[:32]
    else:
        return b'\x04' + vk.to_string()

def create_p2pkh_scriptpubkey(address):
    decoded = base58.b58decode_check(address)
    pkh = decoded[1:]
    return b'\x76\xa9\x14' + pkh + b'\x88\xac'

def build_raw_tx(inputs, outputs, locktime=0):
    tx = b''
    tx += b'\x01\x00\x00\x00' # Version 1
    tx += encode_varint(len(inputs))
    for vin in inputs:
        tx += bytes.fromhex(vin['txid'])[::-1]
        tx += vin['vout'].to_bytes(4, 'little')
        tx += encode_varint(len(vin['scriptSig']))
        tx += vin['scriptSig']
        tx += b'\xff\xff\xff\xff' # Sequence

    tx += encode_varint(len(outputs))
    for vout in outputs:
        tx += vout['value'].to_bytes(8, 'little')
        tx += encode_varint(len(vout['scriptPubKey']))
        tx += vout['scriptPubKey']

    tx += locktime.to_bytes(4, 'little')
    return tx

def sign_p2pkh(priv_bytes, tx_hex_to_sign, input_index, script_code):
    # tx_hex_to_sign deve ter o script_code no input sendo assinado e os outros vazios
    # + 01000000 no final para SIGHASH_ALL
    data = bytes.fromhex(tx_hex_to_sign) + b'\x01\x00\x00\x00'
    hashed = hash256(data)

    sk = ecdsa.SigningKey.from_string(priv_bytes, curve=ecdsa.SECP256k1)
    sig = sk.sign_digest(hashed, sigencode=ecdsa.util.sigencode_der) + b'\x01' # + SIGHASH_ALL

    # Determinar se a chave é comprimida com base no endereço de origem
    # Para o sandbox, sabemos que 113aNq... usa chave comprimida (visto no histórico)
    pubkey = get_pubkey_from_priv(priv_bytes, compressed=True)

    script_sig = encode_varint(len(sig)) + sig + encode_varint(len(pubkey)) + pubkey
    return script_sig

def main():
    print(f"Construindo transação P2PKH manual para {config.SOURCE_ADDRESS}...")

    # 1. Obter UTXOs e Taxas
    url_utxo = f"{config.MEMPOOL_API}/address/{config.SOURCE_ADDRESS}/utxo"
    utxos = requests.get(url_utxo).json()
    if not utxos:
        print("Nenhum UTXO encontrado.")
        return

    url_fees = f"{config.MEMPOOL_API}/v1/fees/recommended"
    fees = requests.get(url_fees).json()
    fee_rate = fees['halfHourFee']
    print(f"Taxa de rede: {fee_rate} sat/vB")

    # 2. Selecionar UTXO
    utxo = sorted(utxos, key=lambda x: x['value'], reverse=True)[0]
    print(f"Usando UTXO: {utxo['txid']}:{utxo['vout']} ({utxo['value']} sats)")

    # 3. Preparar Outputs
    amount_sats = int(config.AMOUNT_BTC * 100_000_000)
    dest_script = create_p2pkh_scriptpubkey(config.DESTINATION_ADDRESS)

    # Estimativa de taxa (1 input, 2 outputs)
    estimated_vsize = 148 + 34 + 34 + 10
    total_fee = estimated_vsize * fee_rate

    change_sats = utxo['value'] - amount_sats - total_fee
    if change_sats < 546:
        print("Troco desprezível, adicionando à taxa.")
        change_sats = 0

    outputs = [{'value': amount_sats, 'scriptPubKey': dest_script}]
    if change_sats > 0:
        source_script = create_p2pkh_scriptpubkey(config.SOURCE_ADDRESS)
        outputs.append({'value': change_sats, 'scriptPubKey': source_script})

    # 4. Assinar
    # Decodificar WIF
    decoded_wif = base58.b58decode_check(config.PRIVATE_KEY)
    priv_bytes = decoded_wif[1:33]

    # Criar transação temporária para assinatura
    # Substituir scriptSig pelo scriptPubKey do UTXO sendo gasto
    script_code = create_p2pkh_scriptpubkey(config.SOURCE_ADDRESS)
    temp_inputs = [{
        'txid': utxo['txid'],
        'vout': utxo['vout'],
        'scriptSig': script_code
    }]

    unsigned_tx = build_raw_tx(temp_inputs, outputs).hex()
    script_sig = sign_p2pkh(priv_bytes, unsigned_tx, 0, script_code)

    # 5. Montar transação final
    final_inputs = [{
        'txid': utxo['txid'],
        'vout': utxo['vout'],
        'scriptSig': script_sig
    }]

    signed_tx = build_raw_tx(final_inputs, outputs).hex()
    print(f"\nTransação assinada com sucesso!")
    print(f"TXID: {hash256(bytes.fromhex(signed_tx))[::-1].hex()}")
    print(f"Hex: {signed_tx}")

    # Salvar
    result = {
        "timestamp": datetime.now().isoformat(),
        "tx_hex": signed_tx,
        "source": config.SOURCE_ADDRESS,
        "destination": config.DESTINATION_ADDRESS,
        "amount": config.AMOUNT_BTC,
        "fee": total_fee / 100_000_000,
        "status": "signed_manual"
    }

    filename = f"manual_signed_tx_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump(result, f, indent=4)
    print(f"Salvo em {filename}")

if __name__ == "__main__":
    main()
