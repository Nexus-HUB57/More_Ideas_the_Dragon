
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
from ecdsa.util import string_to_number
import Crypto.Hash.RIPEMD160 as RIPEMD160

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

def test_all_methods(seed_hex, target_address):
    seed_bytes = bytes.fromhex(seed_hex)
    print(f"Iniciando busca exaustiva de métodos para seed: {seed_hex}")
    
    # Método 1: Electrum 1.x Standard
    print("Testando Método 1: Electrum 1.x Standard...")
    secexp = stretch_key(seed_bytes)
    master_private_key = ecdsa.SigningKey.from_secret_exponent(secexp, curve=SECP256k1)
    mpk = master_private_key.get_verifying_key().to_string()
    order = SECP256k1.generator.order()
    for for_change in [0, 1]:
        for n in range(100):
            z = get_sequence(mpk, for_change, n)
            child_secexp = (secexp + z) % order
            sk = ecdsa.SigningKey.from_secret_exponent(child_secexp, curve=SECP256k1)
            vk = sk.get_verifying_key()
            for compressed in [False, True]:
                if compressed: pubkey = (b'\x02' if vk.pubkey.point.y() % 2 == 0 else b'\x03') + vk.to_string()[:32]
                else: pubkey = b'\x04' + vk.to_string()
                if hash_160_to_bc_address(hash_160(pubkey)) == target_address:
                    print(f"ACHOU! Método 1, Change: {for_change}, Index: {n}, Compressed: {compressed}")
                    return True

    # Método 2: Derivação Direta SHA256
    print("Testando Método 2: Derivação Direta SHA256...")
    for n in range(1000):
        data = seed_bytes + str(n).encode()
        priv = sha256(data)
        sk = ecdsa.SigningKey.from_string(priv, curve=SECP256k1)
        vk = sk.get_verifying_key()
        for compressed in [False, True]:
            if compressed: pubkey = (b'\x02' if vk.pubkey.point.y() % 2 == 0 else b'\x03') + vk.to_string()[:32]
            else: pubkey = b'\x04' + vk.to_string()
            if hash_160_to_bc_address(hash_160(pubkey)) == target_address:
                print(f"ACHOU! Método 2, Index: {n}, Compressed: {compressed}")
                return True

    # Método 3: Derivação Direta Double SHA256
    print("Testando Método 3: Derivação Direta Double SHA256...")
    for n in range(1000):
        data = seed_bytes + str(n).encode()
        priv = Hash(data)
        sk = ecdsa.SigningKey.from_string(priv, curve=SECP256k1)
        vk = sk.get_verifying_key()
        for compressed in [False, True]:
            if compressed: pubkey = (b'\x02' if vk.pubkey.point.y() % 2 == 0 else b'\x03') + vk.to_string()[:32]
            else: pubkey = b'\x04' + vk.to_string()
            if hash_160_to_bc_address(hash_160(pubkey)) == target_address:
                print(f"ACHOU! Método 3, Index: {n}, Compressed: {compressed}")
                return True

    print("Nenhum método clássico funcionou.")
    return False

if __name__ == "__main__":
    test_all_methods("9d087b7cc9a85f048d59eb50666ea70c", "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC")
