import os
import json
import struct
import hashlib
import base64
from typing import Dict, List, Optional, Any, Tuple
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Protocol.KDF import PBKDF2, scrypt
import binascii

class AdvancedWalletAnalyzer:
    """Classe avançada para análise de múltiplos formatos de carteira a partir de dados binários"""
    
    def __init__(self):
        self.supported_formats = {
            'bitcoin_core': ['dat'],
            'electrum': ['wallet'],
            'ethereum_keystore': ['json'],
            'exodus': ['json'],
            'multibit': ['wallet', 'key'],
            'armory': ['wallet'],
            'blockchain_info': ['json']
        }
    
    def analyze_wallet_comprehensive(self, data: bytes, password: Optional[str] = None) -> Dict[str, Any]:
        """
        Análise abrangente de carteira com detecção automática de formato a partir de dados binários
        """
        try:
            base_info = {
                'size_bytes': len(data),
                'size_formatted': self._format_file_size(len(data)),
                'format_detected': None,
                'wallet_type': None,
                'encrypted': False,
                'encryption_method': None,
                'keys_count': 0,
                'addresses_count': 0,
                'transactions_count': 0,
                'creation_date': None,
                'last_modified': None, # Não aplicável para dados em memória
                'integrity_check': 'unknown',
                'supported_operations': [],
                'security_level': 'unknown',
                'metadata': {},
                'error': None
            }
            
            format_info = self._detect_wallet_format(data)
            base_info.update(format_info)
            
            if base_info['wallet_type'] == 'bitcoin_core':
                analysis = self._analyze_bitcoin_core(data, password)
            elif base_info['wallet_type'] == 'electrum':
                analysis = self._analyze_electrum_wallet(data, password)
            elif base_info['wallet_type'] == 'ethereum_keystore':
                analysis = self._analyze_ethereum_keystore(data, password)
            elif base_info['wallet_type'] == 'exodus':
                analysis = self._analyze_exodus_wallet(data, password)
            else:
                analysis = self._analyze_generic_wallet(data)
            
            base_info.update(analysis)
            
            base_info['security_level'] = self._evaluate_security_level(base_info)
            
            base_info['supported_operations'] = self._get_supported_operations(base_info)
            
            return base_info
            
        except Exception as e:
            return {
                'error': f"Erro na análise: {str(e)}",
                'wallet_type': 'unknown',
                'encrypted': False,
                'keys_count': 0,
                'addresses_count': 0
            }
    
    def security_audit(self, data: bytes, password: Optional[str] = None) -> Dict[str, Any]:
        """Realiza uma auditoria de segurança em dados de carteira"""
        # Esta é uma implementação simplificada para demonstração
        # Em um sistema real, envolveria análises mais profundas e heurísticas
        audit_result = self.analyze_wallet_comprehensive(data, password)
        
        score = 0
        recommendations = []
        
        if audit_result.get('encrypted'):
            score += 30
        else:
            recommendations.append("A carteira não está criptografada. Considere criptografá-la com uma senha forte.")
            
        if audit_result.get('keys_count', 0) > 0:
            score += 20
            
        if 'hd' in str(audit_result.get('wallet_type', '')).lower() or 'hierarchical' in str(audit_result.get('metadata', {}).get('wallet_type', '')).lower():
            score += 25
            recommendations.append("Carteira HD detectada. Isso é uma boa prática de segurança.")
        else:
            recommendations.append("Considere usar uma carteira Hierarchical Deterministic (HD) para melhor gerenciamento de chaves.")
            
        # Assumimos que o backup é uma boa prática, mas não podemos verificar diretamente aqui
        recommendations.append("Mantenha backups seguros da sua carteira em locais diferentes.")
        recommendations.append("Use autenticação de dois fatores (2FA) sempre que disponível.")
        recommendations.append("Mantenha o software da sua carteira e sistema operacional atualizados.")
        recommendations.append("Verifique regularmente a atividade da sua carteira em busca de transações suspeitas.")
        
        if score >= 80:
            security_level = 'Muito Alta'
        elif score >= 60:
            security_level = 'Alta'
        elif score >= 40:
            security_level = 'Média'
        else:
            security_level = 'Baixa'
            
        audit_result['security_score'] = score
        audit_result['security_level'] = security_level
        audit_result['recommendations'] = recommendations
        
        return audit_result

    def _detect_wallet_format(self, data: bytes) -> Dict[str, Any]:
        """Detecta o formato da carteira baseado em assinaturas e estrutura dos dados"""
        try:
            header = data[:64]
            content_sample = data[:1024]  # Primeiros 1KB para análise
            
            # Bitcoin Core wallet.dat (Berkeley DB)
            if header.startswith(b'\x00\x00\x00\x00\x62\x31\x05\x00'):
                return {
                    'format_detected': 'Berkeley DB',
                    'wallet_type': 'bitcoin_core',
                    'version_info': 'Bitcoin Core wallet.dat'
                }
            
            # Ethereum Keystore (JSON)
            try:
                json_content = json.loads(data.decode('utf-8'))
                if 'crypto' in json_content and 'kdf' in json_content.get('crypto', {}):
                    return {
                        'format_detected': 'Ethereum Keystore',
                        'wallet_type': 'ethereum_keystore',
                        'version_info': f"Keystore version {json_content.get('version', 'unknown')}"
                    }
                elif 'mnemonic' in json_content or 'exodus' in str(json_content).lower():
                    return {
                        'format_detected': 'Exodus JSON',
                        'wallet_type': 'exodus',
                        'version_info': 'Exodus wallet backup'
                    }
                elif 'electrum' in str(json_content).lower() or 'seed_version' in json_content:
                    return {
                        'format_detected': 'Electrum JSON',
                        'wallet_type': 'electrum',
                        'version_info': 'Electrum wallet file'
                    }
            except json.JSONDecodeError:
                pass # Não é JSON, ou JSON inválido
            except UnicodeDecodeError:
                pass # Não é texto UTF-8
            
            # SQLite (alguns wallets modernos)
            if header.startswith(b'SQLite format 3'):
                return {
                    'format_detected': 'SQLite Database',
                    'wallet_type': 'sqlite_wallet',
                    'version_info': 'SQLite-based wallet'
                }
            
            return {
                'format_detected': 'Unknown',
                'wallet_type': 'unknown',
                'version_info': 'Formato não reconhecido'
            }
            
        except Exception as e:
            return {
                'format_detected': 'Error',
                'wallet_type': 'unknown',
                'version_info': f'Erro na detecção: {str(e)}'
            }
    
    def _analyze_bitcoin_core(self, data: bytes, password: Optional[str] = None) -> Dict[str, Any]:
        """Análise específica para Bitcoin Core wallet.dat a partir de dados binários"""
        try:
            content = data
            
            keys_count = content.count(b'key')
            addresses_count = content.count(b'name')
            transactions_count = content.count(b'tx')
            
            encrypted = b'mkey' in content or b'crypt' in content
            encryption_method = 'AES-256-CBC' if encrypted else None
            
            version_info = self._extract_bitcoin_version(content)
            
            return {
                'encrypted': encrypted,
                'encryption_method': encryption_method,
                'keys_count': keys_count,
                'addresses_count': addresses_count,
                'transactions_count': transactions_count,
                'integrity_check': 'valid' if keys_count > 0 else 'suspicious',
                'metadata': {
                    'version': version_info,
                    'has_master_key': b'mkey' in content,
                    'has_default_key': b'defaultkey' in content,
                    'estimated_addresses': addresses_count
                }
            }
            
        except Exception as e:
            return {
                'encrypted': False,
                'keys_count': 0,
                'addresses_count': 0,
                'error': f'Erro na análise Bitcoin Core: {str(e)}'
            }
    
    def _analyze_electrum_wallet(self, data: bytes, password: Optional[str] = None) -> Dict[str, Any]:
        """Análise específica para carteiras Electrum a partir de dados binários"""
        try:
            wallet_data = json.loads(data.decode('utf-8'))
            
            encrypted = 'seed' not in wallet_data and 'xprv' not in wallet_data
            seed_version = wallet_data.get('seed_version', 'unknown')
            
            keystore = wallet_data.get('keystore', {})
            addresses = wallet_data.get('addresses', {})
            
            keys_count = len(keystore.get('keypairs', {})) if 'keypairs' in keystore else 0
            addresses_count = len(addresses)
            
            wallet_type_detail = 'standard'
            if 'x1/' in str(wallet_data):
                wallet_type_detail = 'multisig'
            elif 'seed_type' in wallet_data:
                wallet_type_detail = wallet_data['seed_type']
            
            return {
                'encrypted': encrypted,
                'encryption_method': 'Electrum native' if encrypted else None,
                'keys_count': keys_count,
                'addresses_count': addresses_count,
                'integrity_check': 'valid',
                'metadata': {
                    'seed_version': seed_version,
                    'wallet_type': wallet_type_detail,
                    'use_encryption': wallet_data.get('use_encryption', False),
                    'gap_limit': wallet_data.get('gap_limit', 20)
                }
            }
            
        except Exception as e:
            return {
                'encrypted': False,
                'keys_count': 0,
                'addresses_count': 0,
                'error': f'Erro na análise Electrum: {str(e)}'
            }
    
    def _analyze_ethereum_keystore(self, data: bytes, password: Optional[str] = None) -> Dict[str, Any]:
        """Análise específica para Ethereum Keystore a partir de dados binários"""
        try:
            keystore_data = json.loads(data.decode('utf-8'))
            
            crypto_data = keystore_data.get('crypto', {})
            kdf = crypto_data.get('kdf', 'unknown')
            cipher = crypto_data.get('cipher', 'unknown')
            
            encrypted = True
            encryption_method = f"{kdf.upper()} + {cipher}"
            
            address = keystore_data.get('address', '')
            if address and not address.startswith('0x'):
                address = '0x' + address
            
            return {
                'encrypted': encrypted,
                'encryption_method': encryption_method,
                'keys_count': 1,
                'addresses_count': 1,
                'integrity_check': 'valid',
                'metadata': {
                    'version': keystore_data.get('version', 3),
                    'kdf': kdf,
                    'cipher': cipher,
                    'address': address,
                    'id': keystore_data.get('id', '')
                }
            }
            
        except Exception as e:
            return {
                'encrypted': True,
                'keys_count': 0,
                'addresses_count': 0,
                'error': f'Erro na análise Ethereum: {str(e)}'
            }
    
    def _analyze_exodus_wallet(self, data: bytes, password: Optional[str] = None) -> Dict[str, Any]:
        """Análise específica para carteiras Exodus a partir de dados binários"""
        try:
            exodus_data = json.loads(data.decode('utf-8'))
            
            encrypted = 'mnemonic' not in exodus_data or isinstance(exodus_data.get('mnemonic'), dict)
            
            assets = exodus_data.get('assets', {})
            keys_count = len(assets) if assets else 1
            
            return {
                'encrypted': encrypted,
                'encryption_method': 'Exodus proprietary' if encrypted else None,
                'keys_count': keys_count,
                'addresses_count': keys_count,
                'integrity_check': 'valid',
                'metadata': {
                    'backup_type': 'exodus',
                    'assets_count': len(assets),
                    'has_mnemonic': 'mnemonic' in exodus_data
                }
            }
            
        except Exception as e:
            return {
                'encrypted': False,
                'keys_count': 0,
                'addresses_count': 0,
                'error': f'Erro na análise Exodus: {str(e)}'
            }
    
    def _analyze_generic_wallet(self, data: bytes) -> Dict[str, Any]:
        """Análise genérica para formatos desconhecidos a partir de dados binários"""
        try:
            content = data
            
            keys_patterns = [b'key', b'priv', b'secret']
            addresses_patterns = [b'addr', b'address', b'1', b'3', b'bc1']
            crypto_patterns = [b'crypt', b'encrypt', b'aes', b'cipher']
            
            keys_count = sum(content.count(pattern) for pattern in keys_patterns)
            addresses_count = sum(content.count(pattern) for pattern in addresses_patterns)
            encrypted = any(pattern in content for pattern in crypto_patterns)
            
            return {
                'encrypted': encrypted,
                'encryption_method': 'Unknown' if encrypted else None,
                'keys_count': keys_count,
                'addresses_count': addresses_count,
                'integrity_check': 'unknown',
                'metadata': {
                    'analysis_type': 'pattern_matching',
                    'confidence': 'low'
                }
            }
            
        except Exception as e:
            return {
                'encrypted': False,
                'keys_count': 0,
                'addresses_count': 0,
                'error': f'Erro na análise genérica: {str(e)}'
            }
    
    def _extract_bitcoin_version(self, content: bytes) -> str:
        """Extrai informação de versão do Bitcoin Core"""
        # Implementação simplificada: procura por strings de versão
        if b'/Bitcoin Core:' in content:
            start = content.find(b'/Bitcoin Core:') + len(b'/Bitcoin Core:')
            end = content.find(b'/', start)
            if start != -1 and end != -1:
                return content[start:end].decode('utf-8', errors='ignore').strip()
        return 'unknown'

    def _format_file_size(self, size_bytes: int) -> str:
        """Formata o tamanho do arquivo para uma string legível"""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.2f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.2f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"
