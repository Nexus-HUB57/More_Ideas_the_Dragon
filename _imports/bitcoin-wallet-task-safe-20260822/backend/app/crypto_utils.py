"""
Módulo de Criptografia para Chaves Privadas
Implementa o Protocolo CAISK (Crypto Address Import Security Key)
"""
import hashlib
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
import base64


class CryptoManager:
    """Gerenciador de criptografia de chaves privadas"""
    
    def __init__(self, passphrase: str):
        """
        Inicializa o gerenciador de criptografia
        
        Args:
            passphrase: Senha mestra para criptografia/descriptografia
        """
        self.passphrase = passphrase
    
    def _derive_key(self, salt: bytes) -> bytes:
        """
        Deriva uma chave de criptografia a partir da passphrase
        
        Args:
            salt: Salt para derivação da chave
            
        Returns:
            Chave derivada de 32 bytes
        """
        from Crypto.Hash import SHA256
        return PBKDF2(
            self.passphrase.encode('utf-8'),
            salt,
            dkLen=32,
            count=100000,
            hmac_hash_module=SHA256
        )
    
    def encrypt_private_key(self, private_key: str) -> str:
        """
        Criptografa uma chave privada usando AES-256
        
        Args:
            private_key: Chave privada em formato WIF ou hexadecimal
            
        Returns:
            Chave privada criptografada em formato base64
        """
        # Gera salt e nonce aleatórios
        salt = get_random_bytes(16)
        nonce = get_random_bytes(16)
        
        # Deriva a chave de criptografia
        key = self._derive_key(salt)
        
        # Criptografa a chave privada
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        ciphertext, tag = cipher.encrypt_and_digest(private_key.encode('utf-8'))
        
        # Combina salt, nonce, tag e ciphertext
        encrypted_data = salt + nonce + tag + ciphertext
        
        # Retorna em formato base64
        return base64.b64encode(encrypted_data).decode('utf-8')
    
    def decrypt_private_key(self, encrypted_private_key: str) -> str:
        """
        Descriptografa uma chave privada
        
        Args:
            encrypted_private_key: Chave privada criptografada em formato base64
            
        Returns:
            Chave privada descriptografada
        """
        # Decodifica de base64
        encrypted_data = base64.b64decode(encrypted_private_key.encode('utf-8'))
        
        # Extrai os componentes
        salt = encrypted_data[:16]
        nonce = encrypted_data[16:32]
        tag = encrypted_data[32:48]
        ciphertext = encrypted_data[48:]
        
        # Deriva a chave de descriptografia
        key = self._derive_key(salt)
        
        # Descriptografa
        cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        
        return plaintext.decode('utf-8')
    
    def encrypt_master_key(self, private_keys: list) -> tuple:
        """
        Criptografa múltiplas chaves privadas em uma Master Key
        Implementa o Protocolo CAISK
        
        Args:
            private_keys: Lista de chaves privadas
            
        Returns:
            Tupla (master_key_encrypted, key_mapping)
        """
        # Cria um mapeamento de índice para chave
        key_mapping = {}
        master_key_data = []
        
        for idx, private_key in enumerate(private_keys):
            key_mapping[idx] = {
                'index': idx,
                'encrypted': self.encrypt_private_key(private_key)
            }
            master_key_data.append(private_key)
        
        # Criptografa o conjunto completo
        combined_keys = '|||'.join(master_key_data)
        master_key_encrypted = self.encrypt_private_key(combined_keys)
        
        return master_key_encrypted, key_mapping
    
    def decrypt_master_key(self, master_key_encrypted: str) -> list:
        """
        Descriptografa a Master Key e retorna todas as chaves privadas
        
        Args:
            master_key_encrypted: Master Key criptografada
            
        Returns:
            Lista de chaves privadas descriptografadas
        """
        # Descriptografa a Master Key
        combined_keys = self.decrypt_private_key(master_key_encrypted)
        
        # Separa as chaves individuais
        private_keys = combined_keys.split('|||')
        
        return private_keys
