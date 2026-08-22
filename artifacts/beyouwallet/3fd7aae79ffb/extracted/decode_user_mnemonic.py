
import sys
import os

sys.path.append('/home/ubuntu')

with open('/home/ubuntu/old_mnemonic_full.py', 'r') as f:
    content = f.read()

content = content.replace('from .mnemonic import Wordlist', 'class Wordlist(list): pass')
content = content.replace('from .util import is_hex_str', 'def is_hex_str(s): return True')

namespace = {}
exec(content, namespace)

_words = namespace['_words']
class Wordlist(list):
    def index(self, word):
        return super().index(word)

wordlist = Wordlist(_words)
namespace['wordlist'] = wordlist
namespace['n'] = len(wordlist)

user_mnemonic = "fly come chick true clear another king fear raise third down".split()
# user_mnemonic has 11 words.

print(f"Mnemônico base: {' '.join(user_mnemonic)}")
print(f"Número de palavras: {len(user_mnemonic)}")

# Se tentarmos decodificar 9 palavras (3 grupos), teríamos 24 bytes hex.
# Se tentarmos decodificar 12 palavras (4 grupos), teríamos 32 bytes hex.

def mn_decode(wlist):
    n = 1626
    out = ''
    for i in range(len(wlist)//3):
        word1, word2, word3 = wlist[3*i:3*i+3]
        w1 =  wordlist.index(word1)
        w2 = (wordlist.index(word2)) % n
        w3 = (wordlist.index(word3)) % n
        x = w1 +n*((w2-w1)%n) +n*n*((w3-w2)%n)
        out += '%08x'%x
    return out

# Vamos tentar decodificar os primeiros 3 grupos (9 palavras)
try:
    partial_seed = mn_decode(user_mnemonic[:9])
    print(f"Seed parcial (9 palavras): {partial_seed}")
except Exception as e:
    print(f"Erro na decodificação parcial: {e}")

# O usuário forneceu 11 palavras. Talvez a 12ª esteja faltando.
# Ou talvez o mnemônico seja de um tipo diferente?
# Electrum 1.x mnemonics eram SEMPRE 12 ou 24 palavras.
