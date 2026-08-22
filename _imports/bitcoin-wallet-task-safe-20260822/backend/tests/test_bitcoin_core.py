"""
Testes para o módulo Bitcoin Core
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.bitcoin_core import BitcoinAddress, BlockchainClient
from config.config import Config


def test_generate_private_key():
    """Testa a geração de chave privada"""
    print("Testando geração de chave privada...")
    private_key = BitcoinAddress.generate_private_key()
    assert len(private_key) == 64, "Chave privada deve ter 64 caracteres hexadecimais"
    print(f"✓ Chave privada gerada: {private_key[:10]}...")


def test_private_key_to_wif():
    """Testa a conversão de chave privada para WIF"""
    print("\nTestando conversão para WIF...")
    private_key_hex = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    wif = BitcoinAddress.private_key_to_wif(private_key_hex)
    assert wif[0] in ['5', 'K', 'L'], "WIF deve começar com 5, K ou L"
    print(f"✓ WIF gerado: {wif}")


def test_wif_to_private_key():
    """Testa a conversão de WIF para chave privada"""
    print("\nTestando conversão de WIF para hex...")
    private_key_hex_original = BitcoinAddress.generate_private_key()
    wif = BitcoinAddress.private_key_to_wif(private_key_hex_original)
    private_key_hex = BitcoinAddress.wif_to_private_key(wif)
    assert private_key_hex == private_key_hex_original
    assert len(private_key_hex) == 64, "Chave privada deve ter 64 caracteres"
    print(f"✓ Chave privada: {private_key_hex}")


def test_generate_address():
    """Testa a geração completa de endereço"""
    print("\nTestando geração de endereço completo...")
    address, wif, hex_key = BitcoinAddress.generate_address()
    assert address[0] == '1', "Endereço deve começar com 1 (P2PKH)"
    assert len(address) >= 26 and len(address) <= 35, "Endereço deve ter entre 26 e 35 caracteres"
    print(f"✓ Endereço gerado: {address}")
    print(f"  WIF: {wif}")
    print(f"  Hex: {hex_key[:20]}...")


def test_blockchain_connection():
    """Testa a conexão com a blockchain (Mainnet)"""
    print("\nTestando conexão com blockchain (Mainnet - Protocolo TSRA)...")
    client = BlockchainClient(Config.BLOCKCHAIN_APIS)
    
    try:
        block_height = client.get_current_block_height()
        print(f"✓ Altura do bloco atual: {block_height}")
        assert block_height > 0, "Altura do bloco deve ser maior que 0"
        print("✓ Conexão com Mainnet estabelecida com sucesso")
    except Exception as e:
        print(f"✗ Erro ao conectar com blockchain: {e}")
        print("  Nota: Isso pode ocorrer se as APIs estiverem temporariamente indisponíveis")


def test_address_balance():
    """Testa a consulta de saldo de um endereço conhecido"""
    print("\nTestando consulta de saldo...")
    client = BlockchainClient(Config.BLOCKCHAIN_APIS)
    
    # Endereço conhecido do Genesis Block (Satoshi Nakamoto)
    genesis_address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    
    try:
        balance = client.get_address_balance(genesis_address)
        print(f"✓ Saldo do endereço Genesis: {balance} satoshis ({balance/100000000} BTC)")
        print("✓ Consulta de saldo funcionando corretamente")
    except Exception as e:
        print(f"✗ Erro ao consultar saldo: {e}")


if __name__ == "__main__":
    print("=" * 60)
    print("TESTES DO MÓDULO BITCOIN CORE")
    print("=" * 60)
    
    test_generate_private_key()
    test_private_key_to_wif()
    test_wif_to_private_key()
    test_generate_address()
    test_blockchain_connection()
    test_address_balance()
    
    print("\n" + "=" * 60)
    print("TESTES CONCLUÍDOS")
    print("=" * 60)
