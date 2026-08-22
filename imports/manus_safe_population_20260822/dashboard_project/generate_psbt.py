import requests
from bit import Key

def generate_unsigned_tx(source_address, destination_address, amount_btc):
    print(f"Gerando transação não assinada de {source_address} para {destination_address}")
    # Busca UTXOs via Blockstream
    url = f"https://blockstream.info/api/address/{source_address}/utxo"
    utxos = requests.get(url).json()

    if not utxos:
        print("Nenhum UTXO encontrado.")
        return None

    # Esta é uma representação simplificada.
    # Para um PSBT real compatível com Electrum, recomenda-se usar a biblioteca 'bitcoinlib'.
    print(f"UTXOs disponíveis: {len(utxos)}")
    print("Para assinar via Electrum: ")
    print(f"1. Abra o Electrum")
    print(f"2. Vá em 'Tools' -> 'Create Transaction'")
    print(f"3. Output: {destination_address}, Amount: {amount_btc}")
    print(f"4. Clique em 'Pay' e depois 'Advanced' para ver a Raw TX.")

    return "Consulte o manual do Electrum para importar os UTXOs acima."

if __name__ == "__main__":
    generate_unsigned_tx("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", "ENDERECO_BINANCE_AQUI", 0.1)
