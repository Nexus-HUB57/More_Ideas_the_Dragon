"""
Módulo Bitcoin Core
Implementa funcionalidades básicas de Bitcoin: geração de endereços, chaves privadas,
assinatura de transações e integração com a blockchain
"""
import hashlib
try:
    # Tenta usar RIPEMD160 nativo
    hashlib.new('ripemd160')
except ValueError:
    # Se não disponível, importa da biblioteca adicional
    import hashlib_additional
import ecdsa
import base58
import secrets
from typing import Tuple, Dict, List
import requests
import time


class BitcoinAddress:
    """Classe para geração e manipulação de endereços Bitcoin"""
    
    @staticmethod
    def generate_private_key() -> str:
        """
        Gera uma chave privada aleatória
        
        Returns:
            Chave privada em formato hexadecimal
        """
        # Gera 32 bytes aleatórios (256 bits)
        private_key_bytes = secrets.token_bytes(32)
        return private_key_bytes.hex()
    
    @staticmethod
    def private_key_to_wif(private_key_hex: str, compressed: bool = True) -> str:
        """
        Converte uma chave privada para formato WIF (Wallet Import Format)
        
        Args:
            private_key_hex: Chave privada em hexadecimal
            compressed: Se True, gera WIF para chave pública comprimida
            
        Returns:
            Chave privada em formato WIF
        """
        # Adiciona prefixo da mainnet (0x80)
        extended_key = '80' + private_key_hex
        
        # Adiciona sufixo para chave comprimida
        if compressed:
            extended_key += '01'
        
        # Converte para bytes
        extended_key_bytes = bytes.fromhex(extended_key)
        
        # Calcula checksum (double SHA256)
        checksum = hashlib.sha256(hashlib.sha256(extended_key_bytes).digest()).digest()[:4]
        
        # Adiciona checksum
        final_key = extended_key_bytes + checksum
        
        # Codifica em Base58
        wif = base58.b58encode(final_key).decode('utf-8')
        
        return wif
    
    @staticmethod
    def wif_to_private_key(wif: str) -> str:
        """
        Converte uma chave privada de formato WIF para hexadecimal
        
        Args:
            wif: Chave privada em formato WIF
            
        Returns:
            Chave privada em formato hexadecimal
        """
        # Decodifica de Base58
        decoded = base58.b58decode(wif)
        
        # Remove prefixo (1 byte), checksum (4 bytes) e sufixo de compressão (1 byte se presente)
        if len(decoded) == 38:  # Chave comprimida
            private_key_bytes = decoded[1:-5]
        else:  # Chave não comprimida
            private_key_bytes = decoded[1:-4]
        
        return private_key_bytes.hex()
    
    @staticmethod
    def private_key_to_public_key(private_key_hex: str, compressed: bool = True) -> str:
        """
        Deriva a chave pública a partir da chave privada
        
        Args:
            private_key_hex: Chave privada em hexadecimal
            compressed: Se True, gera chave pública comprimida
            
        Returns:
            Chave pública em formato hexadecimal
        """
        # Converte chave privada para inteiro
        private_key_int = int(private_key_hex, 16)
        
        # Gera chave pública usando ECDSA (curva secp256k1)
        signing_key = ecdsa.SigningKey.from_secret_exponent(
            private_key_int,
            curve=ecdsa.SECP256k1
        )
        verifying_key = signing_key.get_verifying_key()
        
        # Obtém coordenadas x e y
        x = verifying_key.pubkey.point.x()
        y = verifying_key.pubkey.point.y()
        
        if compressed:
            # Formato comprimido: 02/03 + x (33 bytes)
            prefix = '02' if y % 2 == 0 else '03'
            public_key = prefix + x.to_bytes(32, 'big').hex()
        else:
            # Formato não comprimido: 04 + x + y (65 bytes)
            public_key = '04' + x.to_bytes(32, 'big').hex() + y.to_bytes(32, 'big').hex()
        
        return public_key
    
    @staticmethod
    def public_key_to_address(public_key_hex: str) -> str:
        """
        Converte uma chave pública para um endereço Bitcoin (P2PKH)
        
        Args:
            public_key_hex: Chave pública em formato hexadecimal
            
        Returns:
            Endereço Bitcoin
        """
        # Converte para bytes
        public_key_bytes = bytes.fromhex(public_key_hex)
        
        # SHA256
        sha256_hash = hashlib.sha256(public_key_bytes).digest()
        
        # RIPEMD160
        from Crypto.Hash import RIPEMD160
        ripemd160 = RIPEMD160.new()
        ripemd160.update(sha256_hash)
        public_key_hash = ripemd160.digest()
        
        # Adiciona prefixo da mainnet (0x00)
        versioned_hash = b'\x00' + public_key_hash
        
        # Calcula checksum (double SHA256)
        checksum = hashlib.sha256(hashlib.sha256(versioned_hash).digest()).digest()[:4]
        
        # Adiciona checksum
        address_bytes = versioned_hash + checksum
        
        # Codifica em Base58
        address = base58.b58encode(address_bytes).decode('utf-8')
        
        return address
    
    @classmethod
    def generate_address(cls) -> Tuple[str, str, str]:
        """
        Gera um novo endereço Bitcoin completo
        
        Returns:
            Tupla (endereço, chave_privada_wif, chave_privada_hex)
        """
        # Gera chave privada
        private_key_hex = cls.generate_private_key()
        
        # Converte para WIF
        private_key_wif = cls.private_key_to_wif(private_key_hex)
        
        # Gera chave pública
        public_key = cls.private_key_to_public_key(private_key_hex)
        
        # Gera endereço
        address = cls.public_key_to_address(public_key)
        
        return address, private_key_wif, private_key_hex


class BlockchainClient:
    """Cliente para interagir com a blockchain Bitcoin (Mainnet)"""
    
    def __init__(self, api_urls: List[str]):
        """
        Inicializa o cliente de blockchain
        
        Args:
            api_urls: Lista de URLs de APIs de blockchain
        """
        self.api_urls = api_urls
    
    def get_address_balance(self, address: str) -> int:
        """
        Obtém o saldo de um endereço Bitcoin
        
        Args:
            address: Endereço Bitcoin
            
        Returns:
            Saldo em satoshis
        """
        # Tenta múltiplas APIs (Protocolo TSRA)
        for api_url in self.api_urls:
            try:
                if 'blockstream.info' in api_url:
                    response = requests.get(f'{api_url}/address/{address}', timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        return data['chain_stats']['funded_txo_sum'] - data['chain_stats']['spent_txo_sum']
                
                elif 'mempool.space' in api_url:
                    response = requests.get(f'{api_url}/address/{address}', timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        return data['chain_stats']['funded_txo_sum'] - data['chain_stats']['spent_txo_sum']
                
            except Exception as e:
                print(f"Erro ao consultar {api_url}: {e}")
                continue
        
        raise Exception("Falha ao obter saldo de todas as APIs")
    
    def get_address_utxos(self, address: str) -> List[Dict]:
        """
        Obtém os UTXOs de um endereço
        
        Args:
            address: Endereço Bitcoin
            
        Returns:
            Lista de UTXOs
        """
        # Tenta múltiplas APIs
        for api_url in self.api_urls:
            try:
                if 'blockstream.info' in api_url:
                    response = requests.get(f'{api_url}/address/{address}/utxo', timeout=10)
                    if response.status_code == 200:
                        return response.json()
                
                elif 'mempool.space' in api_url:
                    response = requests.get(f'{api_url}/address/{address}/utxo', timeout=10)
                    if response.status_code == 200:
                        return response.json()
                
            except Exception as e:
                print(f"Erro ao consultar {api_url}: {e}")
                continue
        
        raise Exception("Falha ao obter UTXOs de todas as APIs")
    
    def broadcast_transaction(self, raw_tx_hex: str) -> str:
        """
        Faz broadcast de uma transação para a rede Bitcoin
        Implementa o Protocolo TSRA para broadcast seguro
        
        Args:
            raw_tx_hex: Transação em formato hexadecimal
            
        Returns:
            TXID da transação
        """
        # Tenta múltiplas APIs (Protocolo TSRA)
        for api_url in self.api_urls:
            try:
                if 'blockstream.info' in api_url:
                    response = requests.post(
                        f'{api_url}/tx',
                        data=raw_tx_hex,
                        headers={'Content-Type': 'text/plain'},
                        timeout=10
                    )
                    if response.status_code == 200:
                        txid = response.text.strip()
                        # Valida que o TXID tem 64 caracteres hexadecimais
                        if len(txid) == 64 and all(c in '0123456789abcdef' for c in txid.lower()):
                            return txid
                
                elif 'mempool.space' in api_url:
                    response = requests.post(
                        f'{api_url}/tx',
                        data=raw_tx_hex,
                        headers={'Content-Type': 'text/plain'},
                        timeout=10
                    )
                    if response.status_code == 200:
                        txid = response.text.strip()
                        if len(txid) == 64 and all(c in '0123456789abcdef' for c in txid.lower()):
                            return txid
                
            except Exception as e:
                print(f"Erro ao fazer broadcast em {api_url}: {e}")
                continue
        
        raise Exception("Falha ao fazer broadcast em todas as APIs - Protocolo TSRA")
    
    def get_current_block_height(self) -> int:
        """
        Obtém a altura do bloco atual da blockchain
        Implementa o Protocolo TSRA
        
        Returns:
            Altura do bloco atual
        """
        for api_url in self.api_urls:
            try:
                if 'blockstream.info' in api_url:
                    response = requests.get(f'{api_url}/blocks/tip/height', timeout=10)
                    if response.status_code == 200:
                        return int(response.text.strip())
                
                elif 'mempool.space' in api_url:
                    response = requests.get(f'{api_url}/blocks/tip/height', timeout=10)
                    if response.status_code == 200:
                        return int(response.text.strip())
                
            except Exception as e:
                print(f"Erro ao consultar {api_url}: {e}")
                continue
        
        raise Exception("Falha ao obter altura do bloco de todas as APIs")
    
    def verify_transaction(self, txid: str) -> bool:
        """
        Verifica se uma transação foi confirmada na blockchain
        Implementa o Protocolo TSRA de validação
        
        Args:
            txid: ID da transação
            
        Returns:
            True se a transação foi encontrada, False caso contrário
        """
        for api_url in self.api_urls:
            try:
                if 'blockstream.info' in api_url:
                    response = requests.get(f'{api_url}/tx/{txid}', timeout=10)
                    if response.status_code == 200:
                        return True
                
                elif 'mempool.space' in api_url:
                    response = requests.get(f'{api_url}/tx/{txid}', timeout=10)
                    if response.status_code == 200:
                        return True
                
            except Exception as e:
                continue
        
        return False
