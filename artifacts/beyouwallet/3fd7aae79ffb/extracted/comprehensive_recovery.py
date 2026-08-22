import hashlib
import base58
import ecdsa
import struct
from Crypto.Hash import RIPEMD160

TARGET_ADDRESS = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
# Seed binária mencionada no relatório
SEED_HEX_REPORT = "9d087b7cc9a85f048d59eb50666ea70c"
# Frase mnemônica mencionada no relatório
MNEMONIC_REPORT = "fly come chick true clear another king fear raise third down"

def ripemd160(data):
    h = RIPEMD160.new()
    h.update(data)
    return h.digest()

def get_address_from_private_key(private_key_bytes):
    try:
        sk = ecdsa.SigningKey.from_string(private_key_bytes, curve=ecdsa.SECP256k1)
        vk = sk.get_verifying_key()
        # Electrum 1.x usava chaves públicas NÃO comprimidas
        public_key = b'\x04' + vk.to_string()
        sha256_pubkey = hashlib.sha256(public_key).digest()
        ripemd160_pubkey = ripemd160(sha256_pubkey)
        versioned_payload = b'\x00' + ripemd160_pubkey
        checksum = hashlib.sha256(hashlib.sha256(versioned_payload).digest()).digest()[:4]
        address = base58.b58encode(versioned_payload + checksum).decode('utf-8')
        return address
    except Exception:
        return None

def test_derivation(seed_bytes, label):
    print(f"\n--- Testando: {label} ---")
    print(f"Seed: {seed_bytes.hex()}")
    
    # Electrum 1.x derivação: k = SHA256(seed + index)
    for index in range(1000):
        # Variação A: Little Endian index
        pk_a = hashlib.sha256(seed_bytes + struct.pack('<I', index)).digest()
        addr_a = get_address_from_private_key(pk_a)
        if addr_a == TARGET_ADDRESS:
            print(f"SUCESSO! Variação A (LE), Índice {index}")
            print(f"Chave Privada (Hex): {pk_a.hex()}")
            return True
            
        # Variação B: Big Endian index
        pk_b = hashlib.sha256(seed_bytes + struct.pack('>I', index)).digest()
        addr_b = get_address_from_private_key(pk_b)
        if addr_b == TARGET_ADDRESS:
            print(f"SUCESSO! Variação B (BE), Índice {index}")
            print(f"Chave Privada (Hex): {pk_b.hex()}")
            return True

        # Variação C: String index
        pk_c = hashlib.sha256(seed_bytes + str(index).encode()).digest()
        addr_c = get_address_from_private_key(pk_c)
        if addr_c == TARGET_ADDRESS:
            print(f"SUCESSO! Variação C (String), Índice {index}")
            print(f"Chave Privada (Hex): {pk_c.hex()}")
            return True

        # Variação D: Electrum 1.x Change (seed + "1" + index)
        pk_d = hashlib.sha256(seed_bytes + b"1" + struct.pack('>I', index)).digest()
        addr_d = get_address_from_private_key(pk_d)
        if addr_d == TARGET_ADDRESS:
            print(f"SUCESSO! Variação D (Change BE), Índice {index}")
            print(f"Chave Privada (Hex): {pk_d.hex()}")
            return True

        # Variação E: Electrum 1.x Receive (seed + "0" + index)
        pk_e = hashlib.sha256(seed_bytes + b"0" + struct.pack('>I', index)).digest()
        addr_e = get_address_from_private_key(pk_e)
        if addr_e == TARGET_ADDRESS:
            print(f"SUCESSO! Variação E (Receive BE), Índice {index}")
            print(f"Chave Privada (Hex): {pk_e.hex()}")
            return True
            
    print("Não encontrado neste set.")
    return False

if __name__ == "__main__":
    # 1. Testar a seed hex diretamente
    test_derivation(bytes.fromhex(SEED_HEX_REPORT), "Seed Hex do Relatório")
    
    # 2. Testar a seed derivada da mnemônica (SHA256 da frase)
    seed_from_mnemonic = hashlib.sha256(MNEMONIC_REPORT.encode()).digest()
    test_derivation(seed_from_mnemonic, "Seed SHA256(Mnemônica)")
    
    # 3. Testar a seed hex como string
    test_derivation(SEED_HEX_REPORT.encode(), "Seed Hex como String")
    
    # 4. Testar a mnemônica diretamente como seed
    test_derivation(MNEMONIC_REPORT.encode(), "Mnemônica como Seed")
