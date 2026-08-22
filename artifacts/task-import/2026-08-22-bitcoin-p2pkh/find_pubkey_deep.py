
import requests
import time
import hashlib
import base58
import sys

TARGET_ADDR = '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug'

def verify_pubkey(pubkey_hex, target_addr):
    try:
        pubkey_bytes = bytes.fromhex(pubkey_hex)
        sha = hashlib.sha256(pubkey_bytes).digest()
        h160 = hashlib.new('ripemd160', sha).digest()
        vh = b'\x00' + h160
        chk = hashlib.sha256(hashlib.sha256(vh).digest()).digest()[:4]
        derived_addr = base58.b58encode(vh + chk).decode()
        return derived_addr == target_addr
    except:
        return False

def get_pubkey_from_history():
    offset = 0
    limit = 50
    print(f"Iniciando busca profunda por chave pública para {TARGET_ADDR}...")
    
    while True:
        url = f"https://blockchain.info/rawaddr/{TARGET_ADDR}?offset={offset}&limit={limit}"
        try:
            res = requests.get(url, timeout=30)
            if res.status_code != 200:
                print(f"Erro na API: {res.status_code}")
                break
            
            data = res.json()
            txs = data.get('txs', [])
            if not txs:
                break
                
            for tx in txs:
                for vin in tx.get('inputs', []):
                    prev_out = vin.get('prev_out', {})
                    if prev_out.get('addr') == TARGET_ADDR:
                        script = vin.get('script', '')
                        # ScriptSig: <sig_len><sig><pubkey_len><pubkey>
                        # Compressed: last 66 chars
                        # Uncompressed: last 130 chars
                        
                        potential_compressed = script[-66:]
                        if verify_pubkey(potential_compressed, TARGET_ADDR):
                            print(f"\n!!! CHAVE PÚBLICA COMPRIMIDA ENCONTRADA !!!")
                            print(f"Txid: {tx['hash']}")
                            print(f"PubKey: {potential_compressed}")
                            return potential_compressed, True
                            
                        potential_uncompressed = script[-130:]
                        if verify_pubkey(potential_uncompressed, TARGET_ADDR):
                            print(f"\n!!! CHAVE PÚBLICA NÃO COMPRIMIDA ENCONTRADA !!!")
                            print(f"Txid: {tx['hash']}")
                            print(f"PubKey: {potential_uncompressed}")
                            return potential_uncompressed, False
            
            offset += limit
            print(f"Verificadas {offset} transações...", end='\r')
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Erro: {e}")
            break
            
    print("\nNenhuma chave pública encontrada no histórico.")
    return None, None

if __name__ == "__main__":
    pubkey, is_compressed = get_pubkey_from_history()
    if pubkey:
        with open('found_pubkey.txt', 'w') as f:
            f.write(f"PubKey: {pubkey}\nCompressed: {is_compressed}\n")
    else:
        sys.exit(1)
