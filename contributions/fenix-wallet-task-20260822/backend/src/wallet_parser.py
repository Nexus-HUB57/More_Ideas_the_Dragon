"""
Módulo para parsing de arquivos wallet.dat do Bitcoin Core
"""
import os
import struct
import hashlib
import binascii
from typing import List, Dict, Optional, Tuple
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
import base58

class WalletParser:
    """Parser para arquivos wallet.dat do Bitcoin Core"""
    
    def __init__(self):
        self.keys = []
        self.addresses = []
        
    def parse_wallet_file(self, file_path: str, password: Optional[str] = None) -> Dict:
        """
        Parse um arquivo wallet.dat e extrai as chaves privadas
        
        Args:
            file_path: Caminho para o arquivo wallet.dat
            password: Senha da carteira (se criptografada)
            
        Returns:
            Dict contendo as chaves extraídas e informações da carteira
        """
        try:
            # Tenta usar pywallet para extrair as chaves
            return self._parse_with_pywallet(file_path, password)
        except Exception as e:
            print(f"Erro ao usar pywallet: {e}")
            # Fallback para método manual
            return self._parse_manually(file_path, password)
    
    def _parse_with_pywallet(self, file_path: str, password: Optional[str] = None) -> Dict:
        """
        Usa uma abordagem manual para extrair chaves (pywallet não tem read_wallet)
        """
        result = {
            'keys': [],
            'addresses': [],
            'encrypted': False,
            'error': None
        }
        
        try:
            # Usa o método manual diretamente
            return self._parse_manually(file_path, password)
            
        except Exception as e:
            result['error'] = str(e)
            return result
    
    def _parse_manually(self, file_path: str, password: Optional[str] = None) -> Dict:
        """
        Método manual para extrair chaves de wallet.dat
        """
        result = {
            'keys': [],
            'addresses': [],
            'encrypted': False,
            'error': None
        }
        
        try:
            with open(file_path, 'rb') as f:
                data = f.read()
            
            # Verifica se é um arquivo JSON (formato Electrum)
            try:
                # Tenta decodificar como JSON
                json_str = data.decode('utf-8')
                import json
                wallet_data = json.loads(json_str)
                
                # Se é um arquivo JSON, processa como carteira Electrum
                if isinstance(wallet_data, dict):
                    return self._parse_electrum_json(wallet_data)
                    
            except (UnicodeDecodeError, json.JSONDecodeError):
                # Não é JSON, continua com parsing binário
                pass
            
            # Procura por padrões de chaves privadas em formato binário
            # Chaves privadas no Bitcoin Core são precedidas por marcadores específicos
            key_markers = [
                b'\x01\x01\x04\x20',  # Marcador comum para chaves privadas
                b'\x30\x81\x87\x02\x01\x00',  # Formato ASN.1 DER
            ]
            
            for marker in key_markers:
                offset = 0
                while True:
                    pos = data.find(marker, offset)
                    if pos == -1:
                        break
                    
                    # Extrai a chave privada (32 bytes após o marcador)
                    key_start = pos + len(marker)
                    if key_start + 32 <= len(data):
                        private_key_bytes = data[key_start:key_start + 32]
                        
                        # Verifica se é uma chave válida (não todos zeros)
                        if private_key_bytes != b'\x00' * 32:
                            try:
                                wif = self._bytes_to_wif(private_key_bytes)
                                address = self._private_key_to_address(private_key_bytes)
                                
                                result['keys'].append({
                                    'wif': wif,
                                    'address': address,
                                    'compressed': False
                                })
                                
                                result['addresses'].append(address)
                                
                            except Exception as e:
                                print(f"Erro ao processar chave: {e}")
                    
                    offset = pos + 1
            
            return result
            
        except Exception as e:
            result['error'] = str(e)
            return result
    
    def _parse_electrum_json(self, wallet_data: dict) -> Dict:
        """
        Parse de arquivo JSON do Electrum
        """
        result = {
            'keys': [],
            'addresses': [],
            'encrypted': False,
            'error': None
        }
        
        try:
            # Verifica se há histórico de endereços
            addr_history = wallet_data.get('addr_history', {})
            
            # Para cada endereço no histórico, tenta encontrar a chave privada
            for address in addr_history.keys():
                # Por enquanto, adiciona apenas o endereço sem a chave privada
                # Em um arquivo Electrum real, as chaves privadas estariam em 'keystore'
                result['keys'].append({
                    'wif': 'N/A - Chave não encontrada',
                    'address': address,
                    'compressed': False
                })
                
                result['addresses'].append(address)
            
            # Verifica se há keystore (onde ficam as chaves privadas no Electrum)
            keystore = wallet_data.get('keystore', {})
            if keystore:
                # Processa as chaves do keystore se disponível
                seed = keystore.get('seed')
                if seed:
                    result['encrypted'] = True
                    # Aqui seria necessário derivar as chaves privadas a partir da seed
                    # Por simplicidade, mantemos apenas os endereços
            
            return result
            
        except Exception as e:
            result['error'] = str(e)
            return result
    
    def _bytes_to_wif(self, private_key_bytes: bytes, compressed: bool = False) -> str:
        """
        Converte bytes de chave privada para formato WIF
        """
        # Adiciona o prefixo da mainnet (0x80)
        extended_key = b'\x80' + private_key_bytes
        
        # Adiciona sufixo para chaves comprimidas
        if compressed:
            extended_key += b'\x01'
        
        # Calcula o checksum (duplo SHA256)
        hash1 = hashlib.sha256(extended_key).digest()
        hash2 = hashlib.sha256(hash1).digest()
        checksum = hash2[:4]
        
        # Codifica em Base58
        wif = base58.b58encode(extended_key + checksum).decode('ascii')
        return wif
    
    def _private_key_to_address(self, private_key_bytes: bytes) -> str:
        """
        Deriva o endereço Bitcoin a partir da chave privada
        """
        try:
            from bitcoinlib.keys import Key
            
            # Cria um objeto Key da bitcoinlib
            key = Key(private_key_bytes)
            return key.address()
            
        except Exception:
            # Fallback para implementação manual
            import ecdsa
            
            # Gera a chave pública usando ECDSA
            sk = ecdsa.SigningKey.from_string(private_key_bytes, curve=ecdsa.SECP256k1)
            vk = sk.get_verifying_key()
            public_key = b'\x04' + vk.to_string()
            
            # Hash da chave pública (SHA256 + RIPEMD160)
            sha256_hash = hashlib.sha256(public_key).digest()
            ripemd160_hash = hashlib.new('ripemd160', sha256_hash).digest()
            
            # Adiciona o prefixo da mainnet (0x00)
            versioned_hash = b'\x00' + ripemd160_hash
            
            # Calcula o checksum
            hash1 = hashlib.sha256(versioned_hash).digest()
            hash2 = hashlib.sha256(hash1).digest()
            checksum = hash2[:4]
            
            # Codifica em Base58
            address = base58.b58encode(versioned_hash + checksum).decode('ascii')
            return address
    
    def validate_wif(self, wif: str) -> bool:
        """
        Valida se uma string WIF é válida
        """
        try:
            decoded = base58.b58decode(wif)
            if len(decoded) not in [37, 38]:  # 37 para não comprimida, 38 para comprimida
                return False
            
            # Verifica o checksum
            payload = decoded[:-4]
            checksum = decoded[-4:]
            
            hash1 = hashlib.sha256(payload).digest()
            hash2 = hashlib.sha256(hash1).digest()
            
            return hash2[:4] == checksum
            
        except Exception:
            return False
    
    def get_supported_formats(self) -> List[str]:
        """
        Retorna os formatos de arquivo suportados
        """
        return ['.dat', '.wallet', '.backup']

