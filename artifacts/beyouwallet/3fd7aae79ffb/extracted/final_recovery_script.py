
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
from ecdsa.util import string_to_number
import Crypto.Hash.RIPEMD160 as RIPEMD160

# Carregar a wordlist de 1626 palavras
with open('/home/ubuntu/electrum_wordlist.txt', 'r') as f:
    wordlist = [line.strip() for line in f if line.strip()]

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

def mn_decode(words, wordlist, reverse=True):
    n = len(wordlist)
    out = 0
    word_order = reversed(words) if reverse else words
    for w in word_order:
        out = out * n + wordlist.index(w)
    h = hex(out)[2:].rstrip('L')
    if len(h) % 2 != 0: h = '0' + h
    return bytes.fromhex(h)

def recover():
    target_address = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
    phrase_11 = "fly come chick true clear another king fear raise third down"
    words_11 = phrase_11.split()
    
    print(f"Iniciando busca exaustiva para a 12ª palavra...")
    print(f"Endereço Alvo: {target_address}")
    
    for i, word in enumerate(wordlist):
        if i % 100 == 0:
            print(f"Progresso: {i}/{len(wordlist)} palavras testadas...", flush=True)
        
        full_phrase = words_11 + [word]
        for rev in [True, False]:
            try:
                seed_bytes = mn_decode(full_phrase, wordlist, reverse=rev)
            secexp = stretch_key(seed_bytes)
            master_private_key = ecdsa.SigningKey.from_secret_exponent(secexp, curve=SECP256k1)
            mpk = master_private_key.get_verifying_key().to_string()
            order = SECP256k1.generator.order()

            for for_change in [0, 1]:
                for n_idx in range(20): # Testar mais índices por segurança
                    z = get_sequence(mpk, for_change, n_idx)
                    child_secexp = (secexp + z) % order
                    sk = ecdsa.SigningKey.from_secret_exponent(child_secexp, curve=SECP256k1)
                    vk = sk.get_verifying_key()
                    
                    # Electrum 1.x usava chaves não comprimidas
                    pubkey = b'\x04' + vk.to_string()
                    address = hash_160_to_bc_address(hash_160(pubkey))
                    
                    if address == target_address:
                        print(f"\n[!!!] SUCESSO ENCONTRADO!")
                        print(f"12ª Palavra: {word}")
                        print(f"Frase completa: {' '.join(full_phrase)}")
                        
                        priv_key_bytes = child_secexp.to_bytes(32, byteorder='big')
                        fullkey = b'\x80' + priv_key_bytes
                        sha256_1 = hashlib.sha256(fullkey).digest()
                        sha256_2 = hashlib.sha256(sha256_1).digest()
                        wif = base58.b58encode(fullkey + sha256_2[:4]).decode('utf-8')
                        print(f"Chave Privada (WIF): {wif}")
                        return
        except Exception:
            continue

if __name__ == "__main__":
    recover()
