import json
import os
import sys
from Crypto.Cipher import AES
from Crypto.Util import Counter
from hashlib import sha512, pbkdf2_hmac
# from hashlib import pbkdf2

# Senha fornecida no conhecimento
PASSWORD = "Benjamin2020*1981$"
WALLET_PATH = "/home/ubuntu/electrum_wallet/wallet_ben.dat"

def decrypt_electrum_seed(wallet_path, password):
    try:
        with open(wallet_path, 'r') as f:
            wallet_data = json.load(f)
    except FileNotFoundError:
        print(f"Erro: Arquivo da carteira não encontrado em {wallet_path}", file=sys.stderr)
        return None
    except json.JSONDecodeError:
        print(f"Erro: Arquivo da carteira não é um JSON válido.", file=sys.stderr)
        return None

    try:
        keystore = wallet_data.get('keystore', {})
        encrypted_seed_hex = keystore.get('seed')
        seed_version = keystore.get('seed_version')
        
        if not encrypted_seed_hex:
            print("Erro: 'seed' (seed encriptada) não encontrada no keystore.", file=sys.stderr)
            return None
        
        if seed_version != 33:
            print(f"Aviso: Versão da seed ({seed_version}) não é a esperada (33). O método de decriptação pode falhar.", file=sys.stderr)

        # A Electrum usa PBKDF2 com SHA512 para derivar a chave de encriptação
        # O salt é o hash SHA512 da senha
        salt = sha512(password.encode('utf-8')).digest()
        
        # 2000 iterações é o padrão antigo da Electrum (versões 1.x)
        # Versões mais recentes usam 100000, mas a seed_version 33 é antiga.
        # Vamos tentar 2000 iterações, que é o padrão para a versão 33 (que é a versão 1.9.x)
        iterations = 2000
        
        # A chave é de 256 bits (32 bytes)
        key = pbkdf2_hmac('sha512', password.encode('utf-8'), salt, iterations, dklen=32)
        
        # A seed encriptada é o IV (16 bytes) + o texto cifrado (16 bytes)
        encrypted_seed_bytes = bytes.fromhex(encrypted_seed_hex)
        iv = encrypted_seed_bytes[:16]
        ciphertext = encrypted_seed_bytes[16:]
        
        # A Electrum usa AES-256-CBC
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_seed_bytes = cipher.decrypt(ciphertext)
        
        # A seed decifrada deve ser uma string hexadecimal de 32 bytes (256 bits)
        decrypted_seed_hex = decrypted_seed_bytes.hex()
        
        # A Electrum 1.x usa uma seed de 128 bits (16 bytes) ou 256 bits (32 bytes)
        # Se a decriptação for bem-sucedida, o resultado deve ser a seed real (mnemônica ou binária)
        
        # Para a versão 33 (1.9.x), a seed é uma string de 12 palavras ou uma string hexadecimal
        # O valor retornado é o texto decifrado.
        
        # Tentativa de decifrar a seed
        decrypted_seed_text = decrypted_seed_bytes.decode('utf-8', errors='ignore').strip()
        
        # Se for uma seed mnemônica, deve ter palavras separadas por espaço
        if ' ' in decrypted_seed_text:
            return f"Seed Mnemônica (Decifrada): {decrypted_seed_text}"
        else:
            return f"Seed Binária (Decifrada Hex): {decrypted_seed_bytes.hex()}"

    except Exception as e:
        print(f"Ocorreu um erro durante a decriptação: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    decrypted_info = decrypt_electrum_seed(WALLET_PATH, PASSWORD)
    if decrypted_info:
        print("\n--- Resultado da Decriptação ---")
        print(decrypted_info)
    else:
        print("\n--- Falha na Decriptação ---")
        print("Não foi possível decifrar a seed com a senha fornecida.")
