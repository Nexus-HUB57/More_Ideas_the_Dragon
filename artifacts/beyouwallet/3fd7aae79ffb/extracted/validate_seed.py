
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
from ecdsa.util import string_to_number
import Crypto.Hash.RIPEMD160 as RIPEMD160

def sha256(x):
    return hashlib.sha256(x).digest()

def Hash(x):
    return sha256(sha256(x))

def ripemd160(x):
    h = RIPEMD160.new()
    h.update(x)
    return h.digest()

def hash_160(public_key):
    return ripemd160(sha256(public_key))

def hash_160_to_bc_address(h160, addrtype=0):
    vh160 = bytes([addrtype]) + h160
    h = Hash(vh160)
    addr = vh160 + h[0:4]
    return base58.b58encode(addr).decode('utf-8')

def stretch_key(seed):
    oldseed = seed
    for i in range(100000):
        seed = hashlib.sha256(seed + oldseed).digest()
    return string_to_number(seed)

def get_sequence(mpk, for_change, n):
    msg = ("%d:%d:" % (n, for_change)).encode('utf-8') + mpk
    return string_to_number(Hash(msg))

def validate(seed_hex, target_address):
    print(f"Validando Seed: {seed_hex}")
    print(f"Endereço Alvo: {target_address}")
    
    seed_bytes = bytes.fromhex(seed_hex)
    secexp = stretch_key(seed_bytes)
    master_private_key = ecdsa.SigningKey.from_secret_exponent(secexp, curve=SECP256k1)
    mpk = master_private_key.get_verifying_key().to_string()
    order = SECP256k1.generator.order()

    for for_change in [0, 1]:
        for n in range(100): # Testar os primeiros 100 endereços
            z = get_sequence(mpk, for_change, n)
            child_secexp = (secexp + z) % order
            sk = ecdsa.SigningKey.from_secret_exponent(child_secexp, curve=SECP256k1)
            vk = sk.get_verifying_key()
            
            # Electrum 1.x usava endereços não comprimidos por padrão
            pubkey = b'\x04' + vk.to_string()
            address = hash_160_to_bc_address(hash_160(pubkey))
            
            if address == target_address:
                print(f"\n[!!!] SUCESSO!")
                print(f"Tipo: {'Change' if for_change else 'Receive'}")
                print(f"Índice: {n}")
                
                # Gerar WIF
                priv_key_bytes = child_secexp.to_bytes(32, byteorder='big')
                fullkey = b'\x80' + priv_key_bytes
                sha256_1 = hashlib.sha256(fullkey).digest()
                sha256_2 = hashlib.sha256(sha256_1).digest()
                wif = base58.b58encode(fullkey + sha256_2[:4]).decode('utf-8')
                print(f"Chave Privada (WIF): {wif}")
                return True
    
    print("\nFalha: O endereço alvo não foi gerado por esta seed.")
    return False

if __name__ == "__main__":
    SEED_HEX = "9d087b7cc9a85f048d59eb50666ea70c"
    TARGET_ADDRESS = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
    validate(SEED_HEX, TARGET_ADDRESS)
