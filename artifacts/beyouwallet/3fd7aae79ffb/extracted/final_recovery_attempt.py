
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
from ecdsa.util import string_to_number, number_to_string

# --- Constantes ---
TARGET_ADDRESS = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
SEED_HEX = "9d087b7cc9a85f048d59eb50666ea70c"
SEED_BYTES = bytes.fromhex(SEED_HEX)

def sha256(x):
    return hashlib.sha256(x).digest()

def Hash(x):
    if isinstance(x, str):
        x = x.encode('utf-8')
    return sha256(sha256(x))

def stretch_key(seed):
    oldseed = seed
    for i in range(100000):
        seed = hashlib.sha256(seed + oldseed).digest()
    return string_to_number(seed)

def get_sequence(mpk, for_change, n):
    # O Electrum 1.x usava Hash("%d:%d:" % (n, for_change) + mpk)
    msg = ("%d:%d:" % (n, for_change)).encode('utf-8') + mpk
    return string_to_number(Hash(msg))

def hash_160(public_key):
    md = hashlib.new('ripemd160')
    md.update(sha256(public_key))
    return md.digest()

def hash_160_to_bc_address(h160, addrtype=0):
    vh160 = bytes([addrtype]) + h160
    h = Hash(vh160)
    addr = vh160 + h[0:4]
    return base58.b58encode(addr).decode('utf-8')

def SecretToASecret(secret, compressed=False, addrtype=0):
    vchIn = bytes([(addrtype + 128) & 255]) + secret
    if compressed:
        vchIn += b'\x01'
    h = Hash(vchIn)
    return base58.b58encode(vchIn + h[0:4]).decode('utf-8')

def recover():
    print(f"Iniciando recuperação para o endereço: {TARGET_ADDRESS}")
    print(f"Seed Binária: {SEED_HEX}")
    
    print("Calculando stretched key (100.000 rounds de SHA256)...")
    secexp = stretch_key(SEED_BYTES)
    
    # Derivar MPK (Master Public Key)
    # No Electrum 1.x, o MPK são os 64 bytes da chave pública (X e Y concatenados)
    curve = SECP256k1
    master_private_key = ecdsa.SigningKey.from_secret_exponent(secexp, curve=SECP256k1)
    mpk = master_private_key.get_verifying_key().to_string()
    print(f"MPK derivado (64 bytes): {mpk.hex()}")

    order = SECP256k1.generator.order()

    # Testar índices de recebimento (for_change=0) e troco (for_change=1)
    for for_change in [0, 1]:
        print(f"Testando {'recebimento' if for_change == 0 else 'troco'} (for_change={for_change})...")
        for n in range(5000):
            z = get_sequence(mpk, for_change, n)
            child_secexp = (secexp + z) % order
            
            # Gerar chave pública para verificar o endereço
            sk = ecdsa.SigningKey.from_secret_exponent(child_secexp, curve=SECP256k1)
            vk = sk.get_verifying_key()
            pubkey = b'\x04' + vk.to_string() # Electrum 1.x usava chaves não comprimidas
            
            address = hash_160_to_bc_address(hash_160(pubkey))
            
            if address == TARGET_ADDRESS:
                print(f"\n--- SUCESSO! ---")
                print(f"Endereço encontrado no índice {n} (for_change={for_change})")
                pk_bytes = number_to_string(child_secexp, order)
                wif = SecretToASecret(pk_bytes, compressed=False)
                print(f"Chave Privada (WIF): {wif}")
                return
            
            # Tentar também com chaves comprimidas (embora improvável para 2013)
            pubkey_compressed = vk.to_string('compressed')
            address_compressed = hash_160_to_bc_address(hash_160(pubkey_compressed))
            if address_compressed == TARGET_ADDRESS:
                print(f"\n--- SUCESSO (COMPRIMIDO)! ---")
                print(f"Endereço encontrado no índice {n} (for_change={for_change})")
                pk_bytes = number_to_string(child_secexp, order)
                wif = SecretToASecret(pk_bytes, compressed=True)
                print(f"Chave Privada (WIF): {wif}")
                return

    print("\n--- FALHA ---")
    print("Endereço não encontrado nos primeiros 5000 índices.")

if __name__ == "__main__":
    recover()
