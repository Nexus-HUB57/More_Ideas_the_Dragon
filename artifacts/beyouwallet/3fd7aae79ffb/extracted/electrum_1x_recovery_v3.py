import hashlib
import base58
import ecdsa
import sys
import struct
from pycoin.key.Key import Key
from pycoin.networks.registry import network_for_netcode

# --- Constantes ---
TARGET_ADDRESS = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
SEED_HEX = "9d087b7cc9a85f048d59eb50666ea70c"
SEED_BYTES = bytes.fromhex(SEED_HEX)
BTC_NETWORK = network_for_netcode("BTC")

# --- Funções Auxiliares (Usando pycoin para robustez) ---

def get_address_from_private_key(private_key_bytes):
    """
    Deriva o endereço Bitcoin P2PKH a partir da chave privada (32 bytes).
    """
    try:
        key = Key(secret_exponent=int.from_bytes(private_key_bytes, 'big'))
        address = key.address(netcode="BTC")
        return address
    except Exception as e:
        return f"Erro na derivação do endereço: {e}"

def private_key_to_wif(private_key_bytes):
    """
    Converte a chave privada em formato WIF (Wallet Import Format) não-comprimido.
    """
    key = Key(secret_exponent=int.from_bytes(private_key_bytes, 'big'))
    wif_key = key.wif(netcode="BTC")
    return wif_key

# --- Algoritmo de Recuperação Electrum 1.x (Variação 1: SHA256(seed + index) - Little Endian) ---

def derive_electrum_1x_key_v1_le(seed_bytes, index):
    """
    Deriva a chave privada Electrum 1.x para um índice específico.
    Algoritmo: k = SHA256(seed_bytes + struct.pack('<I', index))
    """
    # Converte o índice para 4 bytes (little-endian)
    index_bytes = struct.pack('<I', index)
    
    # Concatena a seed com o índice
    data_to_hash = seed_bytes + index_bytes
    
    # Calcula o SHA256
    private_key_bytes = hashlib.sha256(data_to_hash).digest()
    
    return private_key_bytes

# --- Algoritmo de Recuperação Electrum 1.x (Variação 2: SHA256(SHA256(seed) + index) - Big Endian) ---

def derive_electrum_1x_key_v2_extended(seed_bytes, index):
    """
    Deriva a chave privada Electrum 1.x para um índice específico.
    Algoritmo: k = SHA256(SHA256(seed) + struct.pack('>I', index))
    """
    # Estende a seed para 32 bytes
    extended_seed = hashlib.sha256(seed_bytes).digest()
    
    # Converte o índice para 4 bytes (big-endian)
    index_bytes = struct.pack('>I', index)
    
    # Concatena a seed estendida com o índice
    data_to_hash = extended_seed + index_bytes
    
    # Calcula o SHA256
    private_key_bytes = hashlib.sha256(data_to_hash).digest()
    
    return private_key_bytes

def recover_key():
    print(f"Iniciando recuperação para o endereço: {TARGET_ADDRESS}")
    print(f"Seed Binária (16 bytes): {SEED_HEX}")
    
    # --- Teste 1: Variação 1 (SHA256(seed + index) - Little Endian) ---
    # Teste para endereços de recebimento (índices 0 a 100000)
    for index in range(100000):
        private_key_bytes = derive_electrum_1x_key_v1_le(SEED_BYTES, index)
        derived_address = get_address_from_private_key(private_key_bytes)
        
        if derived_address == TARGET_ADDRESS:
            wif_key = private_key_to_wif(private_key_bytes)
            print("\n--- SUCESSO NA RECUPERAÇÃO (Variação 1 LE - Recebimento) ---")
            print(f"Endereço Alvo Encontrado no Índice: {index}")
            print(f"Chave Privada (Hex): {private_key_bytes.hex()}")
            print(f"Chave Privada (WIF): {wif_key}")
            return
        
    # --- Teste 2: Variação 2 (SHA256(SHA256(seed) + index) - Big Endian) ---
    # Teste para endereços de recebimento (índices 0 a 100000)
    for index in range(100000):
        private_key_bytes = derive_electrum_1x_key_v2_extended(SEED_BYTES, index)
        derived_address = get_address_from_private_key(private_key_bytes)
        
        if derived_address == TARGET_ADDRESS:
            wif_key = private_key_to_wif(private_key_bytes)
            print("\n--- SUCESSO NA RECUPERAÇÃO (Variação 2 Extended - Recebimento) ---")
            print(f"Endereço Alvo Encontrado no Índice: {index}")
            print(f"Chave Privada (Hex): {private_key_bytes.hex()}")
            print(f"Chave Privada (WIF): {wif_key}")
            return

    print("\n--- FALHA NA RECUPERAÇÃO ---")
    print("O endereço alvo não foi encontrado nas variações de derivação testadas.")

if __name__ == "__main__":
    recover_key()
