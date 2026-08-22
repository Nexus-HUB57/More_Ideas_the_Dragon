
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
from ecdsa.util import string_to_number
import Crypto.Hash.RIPEMD160 as RIPEMD160
import time

def sha256(x): return hashlib.sha256(x).digest()
def Hash(x): return sha256(sha256(x))
def ripemd160(x):
    h = RIPEMD160.new()
    h.update(x)
    return h.digest()
def hash_160(public_key): return ripemd160(sha256(public_key))
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

def check_seed(seed_bytes, target_address):
    secexp = stretch_key(seed_bytes)
    master_private_key = ecdsa.SigningKey.from_secret_exponent(secexp, curve=SECP256k1)
    mpk = master_private_key.get_verifying_key().to_string()
    order = SECP256k1.generator.order()
    for for_change in [0, 1]:
        for n in range(5): # Testar apenas os primeiros 5 para velocidade
            z = get_sequence(mpk, for_change, n)
            child_secexp = (secexp + z) % order
            sk = ecdsa.SigningKey.from_secret_exponent(child_secexp, curve=SECP256k1)
            vk = sk.get_verifying_key()
            pubkey = b'\x04' + vk.to_string()
            if hash_160_to_bc_address(hash_160(pubkey)) == target_address:
                return child_secexp
    return None

def hamming_search(base_seed_hex, target_address):
    base_seed = int(base_seed_hex, 16)
    target_address = target_address
    
    print(f"Iniciando busca por distância de Hamming 1 para a seed...")
    start_time = time.time()
    
    for i in range(128):
        if i % 32 == 0: print(f"Testando bit {i}...")
        test_seed_int = base_seed ^ (1 << i)
        test_seed_bytes = test_seed_int.to_bytes(16, 'big')
        
        res = check_seed(test_seed_bytes, target_address)
        if res:
            print(f"\n[!!!] SUCESSO ENCONTRADO com Hamming 1!")
            print(f"Seed corrigida: {test_seed_bytes.hex()}")
            return res

    print(f"Hamming 1 concluído em {time.time() - start_time:.2f}s. Nenhum resultado.")
    return None

if __name__ == "__main__":
    hamming_search("9d087b7cc9a85f048d59eb50666ea70c", "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC")
