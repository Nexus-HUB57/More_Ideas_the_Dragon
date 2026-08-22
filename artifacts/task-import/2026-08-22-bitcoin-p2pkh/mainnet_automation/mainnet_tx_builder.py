
import requests
import json
import sys
from datetime import datetime
from bitcoinlib.transactions import Transaction
from bitcoinlib.keys import Key
import config

def get_utxos(address):
    print(f"Buscando UTXOs para {address}...")
    url = f"{config.MEMPOOL_API}/address/{address}/utxo"
    try:
        res = requests.get(url, timeout=15)
        res.raise_for_status()
        utxos = res.json()
        print(f"Encontrados {len(utxos)} UTXOs.")
        return utxos
    except Exception as e:
        print(f"Erro ao buscar UTXOs: {e}")
        return []

def get_fee_rate():
    print("Estimando taxas de rede...")
    url = f"{config.MEMPOOL_API}/v1/fees/recommended"
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        fees = res.json()
        if config.FEE_RATE_STRATEGY == 'fastest':
            return fees['fastestFee']
        elif config.FEE_RATE_STRATEGY == 'medium' or config.FEE_RATE_STRATEGY == 'halfHour':
            return fees['halfHourFee']
        elif config.FEE_RATE_STRATEGY == 'hour':
            return fees['hourFee']
        else:
            return int(config.FEE_RATE_STRATEGY)
    except Exception as e:
        print(f"Erro ao buscar taxas, usando fallback 254 sat/vB: {e}")
        return 254

def build_transaction():
    utxos = get_utxos(config.SOURCE_ADDRESS)
    if not utxos:
        print("Saldo insuficiente ou erro na API.")
        return None

    fee_rate = get_fee_rate()
    print(f"Taxa selecionada: {fee_rate} sat/vB")

    amount_sats = int(config.AMOUNT_BTC * 100_000_000)

    # Seleção simples de UTXO (maior primeiro)
    sorted_utxos = sorted(utxos, key=lambda x: x['value'], reverse=True)

    tx = Transaction(network='bitcoin')

    # Estimativa de tamanho para 1 input P2PKH e 2 outputs P2PKH
    # Input: 148 bytes, Outputs: 34 bytes cada, Base: 10 bytes
    estimated_vsize = 148 + (34 * 2) + 10
    estimated_fee = estimated_vsize * fee_rate

    total_input_value = 0
    selected_utxos = []

    for utxo in sorted_utxos:
        selected_utxos.append(utxo)
        total_input_value += utxo['value']
        if total_input_value >= (amount_sats + estimated_fee):
            break

    if total_input_value < (amount_sats + estimated_fee):
        print(f"Saldo insuficiente para enviar {config.AMOUNT_BTC} BTC + taxas.")
        return None

    # Adicionar inputs
    for utxo in selected_utxos:
        tx.add_input(utxo['txid'], utxo['vout'], value=utxo['value'], address=config.SOURCE_ADDRESS, witness=False)

    # Adicionar output destino
    tx.add_output(amount_sats, config.DESTINATION_ADDRESS)

    # Calcular troco
    change_value = total_input_value - amount_sats - estimated_fee
    if change_value > 546: # Dust limit
        tx.add_output(change_value, config.SOURCE_ADDRESS)
    else:
        print("Troco muito pequeno (dust), adicionado à taxa.")

    # Assinar
    try:
        key = Key(config.PRIVATE_KEY, network='bitcoin')
        # Verificar se a chave bate com o endereço
        if key.address() != config.SOURCE_ADDRESS:
            print(f"AVISO CRÍTICO: A chave privada fornecida deriva o endereço {key.address()},")
            print(f"mas o endereço de origem é {config.SOURCE_ADDRESS}.")
            print("A transação será assinada, mas falhará no broadcast (OP_EQUALVERIFY).")

        tx.sign(key)
        print("Transação assinada com sucesso.")
    except Exception as e:
        print(f"Erro ao assinar: {e}")
        return None

    tx_hex = tx.as_hex()

    result = {
        "timestamp": datetime.now().isoformat(),
        "tx_hex": tx_hex,
        "txid": tx.txid,
        "fee_rate": fee_rate,
        "total_fee": estimated_fee,
        "amount_btc": config.AMOUNT_BTC,
        "source": config.SOURCE_ADDRESS,
        "destination": config.DESTINATION_ADDRESS,
        "status": "signed"
    }

    filename = f"signed_tx_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(filename, 'w') as f:
        json.dump(result, f, indent=4)

    print(f"Dados da transação salvos em {filename}")
    return tx_hex

if __name__ == "__main__":
    build_transaction()
