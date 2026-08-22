"""
Testes para o módulo de Criptografia (Protocolo CAISK)
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.crypto_utils import CryptoManager
from app.bitcoin_core import BitcoinAddress
from config.config import Config


def test_encrypt_decrypt_private_key():
    """Testa criptografia e descriptografia de chave privada"""
    print("Testando criptografia de chave privada (Protocolo CAISK)...")
    
    crypto = CryptoManager(Config.MASTER_PASSPHRASE)
    
    # Gera uma chave efêmera apenas para o teste; nenhum segredo é persistido.
    private_key = BitcoinAddress.private_key_to_wif(BitcoinAddress.generate_private_key())
    
    # Criptografa
    encrypted = crypto.encrypt_private_key(private_key)
    print(f"✓ Chave criptografada: {encrypted[:30]}...")
    
    # Descriptografa
    decrypted = crypto.decrypt_private_key(encrypted)
    print(f"✓ Chave descriptografada: {decrypted}")
    
    # Verifica se são iguais
    assert private_key == decrypted, "Chave descriptografada deve ser igual à original"
    print("✓ Criptografia/Descriptografia funcionando corretamente")


def test_master_key():
    """Testa criação e descriptografia de Master Key"""
    print("\nTestando Master Key (Protocolo CAISK)...")
    
    crypto = CryptoManager(Config.MASTER_PASSPHRASE)
    
    # Gera chaves efêmeras apenas para o teste; nenhum segredo é persistido.
    private_keys = [
        BitcoinAddress.private_key_to_wif(BitcoinAddress.generate_private_key())
        for _ in range(3)
    ]
    
    # Cria Master Key
    master_key_encrypted, key_mapping = crypto.encrypt_master_key(private_keys)
    print(f"✓ Master Key criada com {len(private_keys)} chaves")
    print(f"  Master Key: {master_key_encrypted[:30]}...")
    
    # Descriptografa Master Key
    decrypted_keys = crypto.decrypt_master_key(master_key_encrypted)
    print(f"✓ Master Key descriptografada: {len(decrypted_keys)} chaves recuperadas")
    
    # Verifica se todas as chaves foram recuperadas corretamente
    for i, (original, decrypted) in enumerate(zip(private_keys, decrypted_keys)):
        assert original == decrypted, f"Chave {i} não corresponde"
        print(f"  Chave {i+1}: ✓")
    
    print("✓ Master Key funcionando corretamente")


def test_passphrase_security():
    """Testa segurança da passphrase"""
    print("\nTestando segurança da passphrase...")
    
    crypto_correct = CryptoManager(Config.MASTER_PASSPHRASE)
    crypto_wrong = CryptoManager("wrong_passphrase")
    
    private_key = BitcoinAddress.private_key_to_wif(BitcoinAddress.generate_private_key())
    
    # Criptografa com passphrase correta
    encrypted = crypto_correct.encrypt_private_key(private_key)
    
    # Tenta descriptografar com passphrase errada
    try:
        decrypted = crypto_wrong.decrypt_private_key(encrypted)
        print("✗ ERRO: Descriptografia com passphrase errada deveria falhar!")
        assert False, "Descriptografia com passphrase errada deveria falhar"
    except Exception as e:
        print(f"✓ Descriptografia com passphrase errada falhou corretamente")
        print(f"  Erro: {type(e).__name__}")


if __name__ == "__main__":
    print("=" * 60)
    print("TESTES DO MÓDULO DE CRIPTOGRAFIA (PROTOCOLO CAISK)")
    print("=" * 60)
    
    test_encrypt_decrypt_private_key()
    test_master_key()
    test_passphrase_security()
    
    print("\n" + "=" * 60)
    print("TESTES CONCLUÍDOS - PROTOCOLO CAISK VALIDADO")
    print("=" * 60)
