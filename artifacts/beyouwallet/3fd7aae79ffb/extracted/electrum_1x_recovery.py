import hashlib
import base58
import ecdsa
import sys
import struct

# --- Constantes ---
TARGET_ADDRESS = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
SEED_HEX = "9d087b7cc9a85f048d59eb50666ea70c"
SEED_BYTES = bytes.fromhex(SEED_HEX)

# --- Funções Auxiliares ---

def get_address_from_private_key(private_key_bytes):
    """
    Deriva o endereço Bitcoin P2PKH a partir da chave privada (32 bytes).
    """
    try:
        # 1. Obter a chave pública (uncompressed)
        sk = ecdsa.SigningKey.from_string(private_key_bytes, curve=ecdsa.SECP256k1)
        vk = sk.get_verifying_key()
        public_key = b'\x04' + vk.to_string()

        # 2. SHA256 da chave pública
        sha256_pubkey = hashlib.sha256(public_key).digest()

        # 3. RIPEMD160 do resultado
        ripemd160_pubkey = hashlib.new('ripemd160', sha256_pubkey).digest()

        # 4. Adicionar o byte de versão (0x00 para Mainnet P2PKH)
        versioned_payload = b'\x00' + ripemd160_pubkey

        # 5. Calcular o checksum (primeiros 4 bytes do SHA256(SHA256(payload)))
        checksum = hashlib.sha256(hashlib.sha256(versioned_payload).digest()).digest()[:4]

        # 6. Codificar em Base58Check
        address = base58.b58encode(versioned_payload + checksum).decode('utf-8')
        return address
    except Exception as e:
        return f"Erro na derivação do endereço: {e}"

def private_key_to_wif(private_key_bytes):
    """
    Converte a chave privada em formato WIF (Wallet Import Format) não-comprimido.
    """
    # 1. Adicionar o byte de versão (0x80 para Mainnet)
    extended_key = b'\x80' + private_key_bytes
    
    # 2. Calcular o checksum (SHA256(SHA256(extended_key)))
    checksum = hashlib.sha256(hashlib.sha256(extended_key).digest()).digest()[:4]
    
    # 3. Codificar em Base58Check
    wif_key = base58.b58encode(extended_key + checksum).decode('utf-8')
    return wif_key

# --- Algoritmo de Recuperação Electrum 1.x ---

def derive_electrum_1x_key(seed_bytes, index, is_change=False):
    """
    Deriva a chave privada Electrum 1.x para um índice específico.
    Algoritmo: k = SHA256(seed_bytes + b'0' + struct.pack('>I', index)) para recebimento
    Algoritmo: k = SHA256(seed_bytes + b'1' + struct.pack('>I', index)) para mudança
    """
    # O Electrum 1.x usava um esquema determinístico simples:
    # A chave privada é o SHA256 da seed binária concatenada com '0' ou '1' e o índice.
    
    # Adiciona o prefixo '0' ou '1'
    prefix = b'1' if is_change else b'0'
    
    # Converte o índice para 4 bytes (big-endian)
    index_bytes = struct.pack('>I', index)
    
    # Concatena a seed com o prefixo e o índice
    data_to_hash = seed_bytes + prefix + index_bytes
    
    # Calcula o SHA256
    private_key_bytes = hashlib.sha256(data_to_hash).digest()
    
    return private_key_bytes

def recover_key():
    print(f"Iniciando recuperação para o endereço: {TARGET_ADDRESS}")
    print(f"Seed Binária (16 bytes): {SEED_HEX}")
    
    # Teste para endereços de recebimento (índices 0 a 9999)
    for index in range(100000):
        private_key_bytes = derive_electrum_1x_key(SEED_BYTES, index, is_change=False)
        derived_address = get_address_from_private_k        
        if derived_address == TARGET_ADDRESS:
            wif_key = private_key_to_wif(private_key_bytes)
            
            print("\n--- SUCESSO NA RECUPERAÇÃO ---")
            print(f"Endereço Alvo Encontrado no Índice: {index}")
            print(f"Chave Privada (Hex): {private_key_bytes.hex()}")
            print(f"Chave Privada (WIF): {wif_key}")
            return
        
    # Teste para chaves de mudança (change keys) (índices 0 a 49999)
    for index in range(50000):
        private_key_bytes = derive_electrum_1x_key(SEED_BYTES, index, is_change=True)
        derived_address = get_address_from_private_key(private_key_bytes)
        
        if derived_address == TARGET_ADDRESS:
            wif_key = private_key_to_wif(private_key_bytes)
            
            print("\n--- SUCESSO NA RECUPERAÇÃO (CHAVE DE MUDANÇA) ---")
            print(f"Endereço Alvo Encontrado no Índice de Mudança: {index}")
            print(f"Chave Privada (Hex): {private_key_bytes.hex()}")
            print(f"Chave Privada (WIF): {wif_key}")
            return

    print("\n--- FALHA NA RECUPERAÇÃO ---")
    print("O endereço alvo não foi encontrado nos primeiros 100000 índices de recebimento e 50000 de mudança.")
    recover_key()
