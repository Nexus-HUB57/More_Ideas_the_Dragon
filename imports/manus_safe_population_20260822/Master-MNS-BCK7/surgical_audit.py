import requests
import json
import time

def perform_surgical_audit(address):
    print(f"--- INICIANDO AUDITORIA CIRÚRGICA: {address} ---")

    # 1. Validação de UTXOs
    utxo_url = f"https://blockstream.info/api/address/{address}/utxo"
    utxos = requests.get(utxo_url).json()

    total_satoshis = sum(utxo['value'] for utxo in utxos)
    print(f"[UTXO] Total de entradas: {len(utxos)}")
    print(f"[UTXO] Volume total: {total_satoshis / 1e8:.8f} BTC")

    # 2. Análise de Taxas (Mempool)
    fee_url = "https://mempool.space/api/v1/fees/recommended"
    fees = requests.get(fee_url).json()
    print(f"[FEES] Recomendado (Fast): {fees['fastestFee']} sat/vB")

    # 3. Cálculo de Peso da Transação (Estimativa SegWit)
    # Inputs: 723, Output: 1 (Binance)
    estimated_vsize = (len(utxos) * 68) + 31 + 10 # Estimativa conservadora para Native SegWit
    estimated_fee_sat = estimated_vsize * fees['fastestFee']

    print(f"[ESTIMATIVA] Tamanho Virtual: {estimated_vsize} vB")
    print(f"[ESTIMATIVA] Taxa Total: {estimated_fee_sat / 1e8:.8f} BTC")
    print(f"[ESTIMATIVA] Valor Líquido: {(total_satoshis - estimated_fee_sat) / 1e8:.8f} BTC")

    audit_results = {
        "timestamp": time.time(),
        "address": address,
        "utxo_count": len(utxos),
        "total_volume_btc": total_satoshis / 1e8,
        "recommended_fee_rate": fees['fastestFee'],
        "estimated_fee_btc": estimated_fee_sat / 1e8,
        "net_transfer_btc": (total_satoshis - estimated_fee_sat) / 1e8,
        "status": "READY_FOR_BROADCAST"
    }

    with open('surgical_audit_report.json', 'w') as f:
        json.dump(audit_results, f, indent=4)

    return audit_results

if __name__ == "__main__":
    # Origem e Destino Oficiais
    SOURCE = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    DESTINATION = "bc1qtydmzqcyltsm4tfmxl3a8f9tqvdxls62j05a8s"
    print(f"[AUDITORIA] Destino de Custódia: {DESTINATION}")
    perform_surgical_audit(SOURCE)
