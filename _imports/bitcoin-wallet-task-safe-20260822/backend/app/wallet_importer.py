"""
Módulo de Importação de Carteiras
Suporta múltiplos formatos: .txt, .dat, .core, .wallet, .backup
Implementa o Protocolo CAISK para gerenciamento seguro de chaves
"""
import re
import struct
import os
from typing import List, Tuple, Dict
from .bitcoin_core import BitcoinAddress


class WalletImporter:
    """Classe para importação de carteiras de múltiplos formatos"""
    
    @staticmethod
    def is_valid_wif(wif: str) -> bool:
        """
        Verifica se uma string é um WIF válido
        
        Args:
            wif: String para validar
            
        Returns:
            True se for um WIF válido
        """
        # WIF começa com 5, K ou L para mainnet
        if not wif or wif[0] not in ['5', 'K', 'L']:
            return False
        
        # WIF tem entre 51 e 52 caracteres
        if len(wif) < 51 or len(wif) > 52:
            return False
        
        try:
            # Tenta converter de WIF para hex
            BitcoinAddress.wif_to_private_key(wif)
            return True
        except:
            return False
    
    @staticmethod
    def is_valid_hex_key(hex_key: str) -> bool:
        """
        Verifica se uma string é uma chave privada hexadecimal válida
        
        Args:
            hex_key: String para validar
            
        Returns:
            True se for uma chave hex válida
        """
        # Chave privada tem 64 caracteres hexadecimais (32 bytes)
        if len(hex_key) != 64:
            return False
        
        try:
            int(hex_key, 16)
            return True
        except:
            return False
    
    @staticmethod
    def extract_keys_from_text(content: str) -> List[str]:
        """
        Extrai chaves privadas de um arquivo de texto
        
        Args:
            content: Conteúdo do arquivo
            
        Returns:
            Lista de chaves privadas (WIF ou hex)
        """
        keys = []
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Ignora linhas vazias e comentários
            if not line or line.startswith('#'):
                continue
            
            # Tenta encontrar WIF
            wif_pattern = r'\b[5KL][1-9A-HJ-NP-Za-km-z]{50,51}\b'
            wif_matches = re.findall(wif_pattern, line)
            for wif in wif_matches:
                if WalletImporter.is_valid_wif(wif):
                    keys.append(wif)
            
            # Tenta encontrar chave hexadecimal
            hex_pattern = r'\b[0-9a-fA-F]{64}\b'
            hex_matches = re.findall(hex_pattern, line)
            for hex_key in hex_matches:
                if WalletImporter.is_valid_hex_key(hex_key):
                    keys.append(hex_key)
        
        return keys
    
    @staticmethod
    def extract_keys_from_dat(file_path: str) -> List[str]:
        """
        Extrai chaves privadas de um arquivo .dat (formato Bitcoin Core)
        
        Args:
            file_path: Caminho do arquivo .dat
            
        Returns:
            Lista de chaves privadas
        """
        keys = []
        
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Procura por padrões de chaves privadas no arquivo binário
            # WIF em formato comprimido (começa com K ou L)
            wif_pattern = rb'[\x4b\x4c][1-9A-HJ-NP-Za-km-z]{50,51}'
            wif_matches = re.findall(wif_pattern, content)
            
            for wif_bytes in wif_matches:
                try:
                    wif = wif_bytes.decode('ascii')
                    if WalletImporter.is_valid_wif(wif):
                        keys.append(wif)
                except:
                    continue
            
            # Procura por chaves em formato hexadecimal
            # Chaves privadas geralmente aparecem após certos marcadores
            hex_pattern = rb'[\x01\x04\x20]([0-9a-fA-F]{64})'
            hex_matches = re.findall(hex_pattern, content)
            
            for hex_bytes in hex_matches:
                try:
                    hex_key = hex_bytes.decode('ascii')
                    if WalletImporter.is_valid_hex_key(hex_key):
                        keys.append(hex_key)
                except:
                    continue
            
        except Exception as e:
            print(f"Erro ao extrair chaves de arquivo .dat: {e}")
        
        return keys
    
    @staticmethod
    def extract_keys_from_core(file_path: str) -> List[str]:
        """
        Extrai chaves privadas de um arquivo .core
        
        Args:
            file_path: Caminho do arquivo .core
            
        Returns:
            Lista de chaves privadas
        """
        # Formato .core é similar ao .dat
        return WalletImporter.extract_keys_from_dat(file_path)
    
    @staticmethod
    def import_wallet_file(file_path: str) -> Tuple[List[str], List[str]]:
        """
        Importa chaves privadas de um arquivo de carteira
        Ordem de prioridade: .dat -> .txt -> .core (conforme preferência do usuário)
        
        Args:
            file_path: Caminho do arquivo
            
        Returns:
            Tupla (lista de chaves privadas, lista de endereços)
        """
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        
        private_keys = []
        
        # Ordem de extração: .dat -> .txt -> .core
        if ext == '.dat':
            private_keys = WalletImporter.extract_keys_from_dat(file_path)
        elif ext in ['.txt', '.backup', '.wallet']:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            private_keys = WalletImporter.extract_keys_from_text(content)
        elif ext == '.core':
            private_keys = WalletImporter.extract_keys_from_core(file_path)
        else:
            raise ValueError(f"Formato de arquivo não suportado: {ext}")
        
        # Remove duplicatas
        private_keys = list(set(private_keys))
        
        # Gera endereços para cada chave privada
        addresses = []
        for private_key in private_keys:
            try:
                # Converte para hex se for WIF
                if WalletImporter.is_valid_wif(private_key):
                    private_key_hex = BitcoinAddress.wif_to_private_key(private_key)
                else:
                    private_key_hex = private_key
                
                # Gera chave pública e endereço
                public_key = BitcoinAddress.private_key_to_public_key(private_key_hex)
                address = BitcoinAddress.public_key_to_address(public_key)
                addresses.append(address)
            except Exception as e:
                print(f"Erro ao processar chave privada: {e}")
                continue
        
        return private_keys, addresses
    
    @staticmethod
    def validate_imported_keys(private_keys: List[str]) -> Dict[str, bool]:
        """
        Valida uma lista de chaves privadas importadas
        
        Args:
            private_keys: Lista de chaves privadas
            
        Returns:
            Dicionário com status de validação de cada chave
        """
        validation_results = {}
        
        for idx, private_key in enumerate(private_keys):
            try:
                # Tenta gerar um endereço a partir da chave
                if WalletImporter.is_valid_wif(private_key):
                    private_key_hex = BitcoinAddress.wif_to_private_key(private_key)
                else:
                    private_key_hex = private_key
                
                public_key = BitcoinAddress.private_key_to_public_key(private_key_hex)
                address = BitcoinAddress.public_key_to_address(public_key)
                
                validation_results[f"key_{idx}"] = {
                    "valid": True,
                    "address": address,
                    "format": "WIF" if WalletImporter.is_valid_wif(private_key) else "HEX"
                }
            except Exception as e:
                validation_results[f"key_{idx}"] = {
                    "valid": False,
                    "error": str(e)
                }
        
        return validation_results
