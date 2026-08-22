
import sys
import os

# Adicionar o diretório atual ao path para importar o arquivo baixado
sys.path.append('/home/ubuntu')

try:
    # O arquivo baixado não é um módulo limpo (tem imports relativos)
    # Vamos ler o conteúdo e extrair apenas o que precisamos ou corrigir os imports.
    with open('/home/ubuntu/old_mnemonic_full.py', 'r') as f:
        content = f.read()
    
    # Remover imports problemáticos
    content = content.replace('from .mnemonic import Wordlist', 'class Wordlist(list): pass')
    content = content.replace('from .util import is_hex_str', 'def is_hex_str(s): return True')
    
    # Executar o conteúdo para definir as funções e variáveis
    namespace = {}
    exec(content, namespace)
    
    # Corrigir a classe Wordlist para funcionar como esperado
    _words = namespace['_words']
    class Wordlist(list):
        def index(self, word):
            return super().index(word)
    
    wordlist = Wordlist(_words)
    namespace['wordlist'] = wordlist
    namespace['n'] = len(wordlist)
    
    seed_hex = "9d087b7cc9a85f048d59eb50666ea70c"
    mnemonic = namespace['mn_encode'](seed_hex)
    print(f"Seed Hex: {seed_hex}")
    print(f"Mnemonic: {' '.join(mnemonic)}")
    
except Exception as e:
    print(f"Erro: {e}")
    import traceback
    traceback.print_exc()
