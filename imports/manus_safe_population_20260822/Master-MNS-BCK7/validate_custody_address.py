import requests
import sys

def validate_bech32_address(address):
    print(f"--- VALIDANDO ENDEREÇO DE CUSTÓDIA: {address} ---")

    # 1. Verificação via API Mempool.space
    try:
        url = f"https://mempool.space/api/address/{address}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"[API] Endereço reconhecido pela rede Bitcoin.")
            print(f"[API] Tipo: {data.get('address_type', 'N/A')}")
            print(f"[API] Saldo Atual: {data.get('chain_stats', {}).get('funded_txo_sum', 0) / 1e8} BTC")
            return True
        else:
            print(f"[ERRO] Endereço não encontrado ou inválido na rede: {response.status_code}")
            return False
    except Exception as e:
        print(f"[ERRO] Falha na conexão com a rede: {e}")
        return False

if __name__ == "__main__":
    OFFICIAL_ADDR = "bc1qtydmzqcyltsm4tfmxl3a8f9tqvdxls62j05a8s"
    if validate_bech32_address(OFFICIAL_ADDR):
        print("\n[RESULTADO] Endereço de custódia VALIDADO e PRONTO para uso.")
    else:
        print("\n[RESULTADO] Falha na validação do endereço.")
