import requests
import json

def get_utxos(address):
    """
    Busca UTXOs (Unspent Transaction Outputs) para um dado endereço Bitcoin
    usando a API do mempool.space.
    """
    url = f"https://mempool.space/api/address/{address}/utxo"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Levanta um erro para códigos de status HTTP ruins (4xx ou 5xx)
        utxos = response.json()
        return utxos
    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar UTXOs para o endereço {address}: {e}")
        return None

