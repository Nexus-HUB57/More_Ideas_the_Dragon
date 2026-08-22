
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
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

def test_brain():
    target_address = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
    inputs = [
        "fly come chick true clear another king fear raise third down",
        "9d087b7cc9a85f048d59eb50666ea70c",
        "Benjamin2020*1981$" # Passphrase mencionada no conhecimento relacionado
    ]
    
    print("Testando Brainwallet...")
    for inp in inputs:
        # Testar SHA256 simples e Double SHA256
        for algo in [sha256, Hash]:
            priv = algo(inp.encode('utf-8'))
            sk = ecdsa.SigningKey.from_string(priv, curve=SECP256k1)
            vk = sk.get_verifying_key()
            for compressed in [False, True]:
                if compressed: pubkey = (b'\x02' if vk.pubkey.point.y() % 2 == 0 else b'\x03') + vk.to_string()[:32]
                else: pubkey = b'\x04' + vk.to_string()
                if hash_160_to_bc_address(hash_160(pubkey)) == target_address:
                    print(f"ACHOU Brainwallet! Input: {inp}, Algo: {algo.__name__}, Compressed: {compressed}")
                    return

    print("Nenhuma Brainwallet encontrada.")

if __name__ == "__main__":
    test_brain()
