
import hashlib
import ecdsa
import base58
from ecdsa.curves import SECP256k1
from ecdsa.util import string_to_number
import Crypto.Hash.RIPEMD160 as RIPEMD160
import sys

# Ler a wordlist diretamente do arquivo para evitar problemas de importação
def load_wordlist():
    with open('/home/ubuntu/recuperacao_bitcoin/old_mnemonic_full.py', 'r') as f:
        content = f.read()
    # Extrair a tupla _words usando regex ou execução simples
    start = content.find('_words = (') + len('_words = (')
    end = content.find(')', start)
    words_str = content[start:end]
    words = [w.strip().strip('"').strip("'") for w in words_str.split(',')]
    return [w for w in words if w]

wordlist = load_wordlist()

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

def mn_decode(words, wordlist):
    n = len(wordlist)
    out = 0
    for w in reversed(words):
        try:
            i = wordlist.index(w)
        except ValueError:
            return None
        out = out * n + i
    
    # Electrum 1.x mn_decode logic
    h = hex(out)[2:].rstrip('L')
    if len(h) % 2 != 0: h = '0' + h
    return bytes.fromhex(h)

def recover():
    target_address = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"
    phrase_11 = "fly come chick true clear another king fear raise third down"
    words_11 = phrase_11.split()
    # wordlist já carregada acima
    
    print(f"Iniciando busca exaustiva para a 12ª palavra...")
    print(f"Endereço Alvo: {target_address}")
    
    for i, word in enumerate(wordlist):
        if i % 50 == 0:
            print(f"Progresso: {i}/{len(wordlist)} palavras testadas...", flush=True)
        
        full_phrase = words_11 + [word]
        # No Electrum 1.x, a ordem das palavras no mn_decode é importante
        # O algoritmo original faz: for w in words: out = out*n + i
        # Mas o mn_decode do Electrum 1.x na verdade usa a ordem inversa ou direta dependendo da versão.
        # Vamos testar a lógica padrão do old_mnemonic.py
        
        n = len(wordlist)
        out = 0
        for w in reversed(full_phrase):
            out = out * n + wordlist.index(w)
        
        seed_hex = hex(out)[2:].rstrip('L')
        if len(seed_hex) % 2 != 0: seed_hex = '0' + seed_hex
        seed_bytes = bytes.fromhex(seed_hex)
        
        # Derivação
        secexp = stretch_key(seed_bytes)
        master_private_key = ecdsa.SigningKey.from_secret_exponent(secexp, curve=SECP256k1)
        mpk = master_private_key.get_verifying_key().to_string()
        order = SECP256k1.generator.order()

        for for_change in [0, 1]:
            for n_idx in range(5): # Geralmente é um dos primeiros endereços
                z = get_sequence(mpk, for_change, n_idx)
                child_secexp = (secexp + z) % order
                sk = ecdsa.SigningKey.from_secret_exponent(child_secexp, curve=SECP256k1)
                vk = sk.get_verifying_key()
                
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

if __name__ == "__main__":
    recover()
