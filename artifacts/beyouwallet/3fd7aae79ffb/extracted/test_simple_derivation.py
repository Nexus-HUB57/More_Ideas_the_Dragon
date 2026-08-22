
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
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

def test_simple():
    seed_hex = "9d087b7cc9a85f048d59eb50666ea70c"
    target_address = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
    seed_bytes = bytes.fromhex(seed_hex)
    
    print(f"Testando derivação simplificada para seed: {seed_hex}")
    
    for i in range(1000):
        # Testar diferentes formas de concatenar o índice
        variants = [
            seed_bytes + str(i).encode('utf-8'),
            seed_bytes + i.to_bytes(4, 'big'),
            seed_bytes + i.to_bytes(4, 'little'),
            seed_bytes + str(i).encode('utf-16')
        ]
        
        for data in variants:
            priv_key = sha256(data)
            sk = ecdsa.SigningKey.from_string(priv_key, curve=SECP256k1)
            vk = sk.get_verifying_key()
            
            # Testar comprimido e não comprimido
            for compressed in [True, False]:
                if compressed:
                    pubkey = (b'\x02' if vk.pubkey.point.y() % 2 == 0 else b'\x03') + vk.to_string()[:32]
                else:
                    pubkey = b'\x04' + vk.to_string()
                
                address = hash_160_to_bc_address(hash_160(pubkey))
                if address == target_address:
                    print(f"\n[!!!] SUCESSO ENCONTRADO!")
                    print(f"Índice: {i}")
                    print(f"Variante: {data}")
                    print(f"Comprimido: {compressed}")
                    return

    print("Nenhum resultado na derivação simplificada.")

if __name__ == "__main__":
    test_simple()
