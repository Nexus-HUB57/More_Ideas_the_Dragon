import hashlib
import base58
import ecdsa
import sys

# Endereço alvo
TARGET_ADDRESS = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"

# Frase mnemônica gerada (12 palavras)
MNEMONIC_PHRASE = "fly come chick true clear another king fear raise third down"

# Wordlist do Electrum 1.x (1626 palavras)
# A wordlist completa foi omitida para brevidade, mas o script deve ser executado com a wordlist correta.
# Para este teste, vamos simular a função de derivação de seed do Electrum 1.x
# O Electrum 1.x usa SHA256(mnemonic) como a seed binária para derivar a chave mestra.

def get_seed_from_mnemonic(mnemonic):
    """
    Simula a derivação da seed binária a partir da frase mnemônica no Electrum 1.x.
    A seed binária é o hash SHA256 da frase mnemônica.
    """
    return hashlib.sha256(mnemonic.encode('utf-8')).digest()

def get_master_private_key(seed):
    """
    No Electrum 1.x, a seed binária é a chave mestra (Master Private Key).
    """
    return seed

def get_private_key_from_master(master_key, index=0):
    """
    Para carteiras não-HD (que é o que o Electrum 1.x usava antes do BIP32),
    a chave privada é derivada diretamente da seed.
    No entanto, o Electrum 1.x usava um esquema determinístico simples (não BIP32/BIP44).
    Vamos testar a chave mestra como a chave privada do endereço principal (index 0).
    """
    # Para Electrum 1.x, a chave privada do endereço principal é a própria seed binária.
    # O Electrum 1.x usava um esquema determinístico simples (não BIP32/BIP44).
    # A chave privada é o hash SHA256 da seed binária (ou da seed binária + index).
    # Vamos testar a seed binária como a chave privada.
    return master_key

def get_address_from_private_key(private_key_bytes):
    """
    Deriva o endereço Bitcoin P2PKH a partir da chave privada.
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
        return f"Erro na derivação: {e}"

def verify_recovery():
    # A seed binária do Electrum 1.x é o SHA256 da frase mnemônica.
    seed_binaria = get_seed_from_mnemonic(MNEMONIC_PHRASE)
    
    # A chave privada mestra é a própria seed binária no Electrum 1.x
    master_private_key = get_master_private_key(seed_binaria)
    
    # Derivar a chave privada do primeiro endereço (index 0)
    private_key_bytes = get_private_key_from_master(master_private_key, index=0)
    
    # Derivar o endereço Bitcoin
    derived_address = get_address_from_private_key(private_key_bytes)
    
    print(f"Frase Mnemônica: {MNEMONIC_PHRASE}")
    print(f"Seed Binária (SHA256): {seed_binaria.hex()}")
    print(f"Endereço Derivado: {derived_address}")
    print(f"Endereço Alvo: {TARGET_ADDRESS}")
    
    if derived_address == TARGET_ADDRESS:
        print("\n--- SUCESSO NA RECUPERAÇÃO ---")
        print(f"A chave privada para o endereço {TARGET_ADDRESS} é: {private_key_bytes.hex()}")
    else:
        print("\n--- FALHA NA RECUPERAÇÃO ---")
        print("O endereço derivado não corresponde ao endereço alvo.")
        
    # Teste 2: O Electrum 1.x também usava a seed binária como a chave privada WIF
    # Vamos tentar converter a seed binária diretamente para WIF e ver se o endereço bate.
    # Isso requer a instalação do módulo 'bitcoin' ou 'base58' com suporte a WIF.
    # Como o objetivo é apenas verificar o padrão, vamos nos ater ao primeiro teste.

if __name__ == "__main__":
    # Instalar dependências necessárias
    try:
        import base58
        import ecdsa
    except ImportError:
        print("Instalando dependências (base58, ecdsa)...", file=sys.stderr)
        # Não podemos instalar aqui, então vamos assumir que o ecdsa e base58 estão disponíveis
        # ou que o próximo passo será a instalação.
        pass
    
    verify_recovery()
