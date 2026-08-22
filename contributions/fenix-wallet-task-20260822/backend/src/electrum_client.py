"""
Cliente Electrum para comunicação com servidores ElectrumX
"""
import json
import socket
import ssl
import hashlib
import time
from typing import Dict, List, Optional, Tuple
import requests

class ElectrumClient:
    """Cliente para comunicação com servidores Electrum"""
    
    def __init__(self):
        self.servers = [
            ('electrum.blockstream.info', 50002, True),  # SSL
            ('fortress.qtornado.com', 443, True),        # SSL
            ('electrum.emzy.de', 50002, True),           # SSL
            ('electrum3.hachre.de', 50002, True),        # SSL
        ]
        self.current_server = None
        self.socket = None
        self.request_id = 0
        
        # Fallback para API BlockCypher
        self.blockcypher_token = "b5dc451970ad4fada007af38ae15332f"
    
    def connect(self) -> bool:
        """
        Conecta a um servidor Electrum
        """
        for server_host, server_port, use_ssl in self.servers:
            try:
                print(f"Tentando conectar a {server_host}:{server_port}")
                
                # Cria o socket
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(10)
                
                if use_ssl:
                    context = ssl.create_default_context()
                    context.check_hostname = False
                    context.verify_mode = ssl.CERT_NONE
                    sock = context.wrap_socket(sock)
                
                sock.connect((server_host, server_port))
                
                # Testa a conexão com um ping
                test_request = {
                    "id": self._get_request_id(),
                    "method": "server.version",
                    "params": ["FenixWallet", "1.4"]
                }
                
                sock.send((json.dumps(test_request) + '\\n').encode())
                response = sock.recv(4096).decode().strip()
                
                if response:
                    self.socket = sock
                    self.current_server = (server_host, server_port, use_ssl)
                    print(f"Conectado com sucesso a {server_host}:{server_port}")
                    return True
                
            except Exception as e:
                print(f"Erro ao conectar a {server_host}:{server_port}: {e}")
                continue
        
        print("Não foi possível conectar a nenhum servidor Electrum")
        return False
    
    def disconnect(self):
        """
        Desconecta do servidor atual
        """
        if self.socket:
            try:
                self.socket.close()
            except:
                pass
            self.socket = None
            self.current_server = None
    
    def _get_request_id(self) -> int:
        """
        Gera um ID único para a requisição
        """
        self.request_id += 1
        return self.request_id
    
    def _send_request(self, method: str, params: List) -> Dict:
        """
        Envia uma requisição para o servidor Electrum
        """
        if not self.socket:
            if not self.connect():
                raise Exception("Não foi possível conectar ao servidor Electrum")
        
        request = {
            "id": self._get_request_id(),
            "method": method,
            "params": params
        }
        
        try:
            # Envia a requisição
            self.socket.send((json.dumps(request) + '\\n').encode())
            
            # Recebe a resposta
            response = self.socket.recv(4096).decode().strip()
            
            if not response:
                raise Exception("Resposta vazia do servidor")
            
            response_data = json.loads(response)
            
            if 'error' in response_data:
                raise Exception(f"Erro do servidor: {response_data['error']}")
            
            return response_data.get('result', {})
            
        except Exception as e:
            print(f"Erro na comunicação Electrum: {e}")
            self.disconnect()
            raise e
    
    def _address_to_scripthash(self, address: str) -> str:
        """
        Converte um endereço Bitcoin para script hash (usado pelo protocolo Electrum)
        """
        try:
            import base58
            
            # Decodifica o endereço
            decoded = base58.b58decode(address)
            
            # Remove o checksum (últimos 4 bytes)
            payload = decoded[:-4]
            
            # Remove o prefixo da versão (primeiro byte)
            pubkey_hash = payload[1:]
            
            # Cria o script (OP_DUP OP_HASH160 <pubkey_hash> OP_EQUALVERIFY OP_CHECKSIG)
            script = bytes([0x76, 0xa9, 0x14]) + pubkey_hash + bytes([0x88, 0xac])
            
            # Calcula o hash do script
            script_hash = hashlib.sha256(script).digest()
            
            # Inverte os bytes (little endian)
            script_hash_reversed = script_hash[::-1]
            
            return script_hash_reversed.hex()
            
        except Exception as e:
            print(f"Erro ao converter endereço para scripthash: {e}")
            return ""
    
    def get_address_balance(self, address: str) -> Dict:
        """
        Obtém o saldo de um endereço
        """
        try:
            scripthash = self._address_to_scripthash(address)
            if not scripthash:
                return self._get_balance_blockcypher(address)
            
            result = self._send_request("blockchain.scripthash.get_balance", [scripthash])
            
            return {
                'confirmed': result.get('confirmed', 0),
                'unconfirmed': result.get('unconfirmed', 0)
            }
            
        except Exception as e:
            print(f"Erro ao obter saldo via Electrum: {e}")
            # Fallback para BlockCypher
            return self._get_balance_blockcypher(address)
    
    def get_address_history(self, address: str) -> Dict:
        """
        Obtém o histórico de transações de um endereço
        """
        try:
            scripthash = self._address_to_scripthash(address)
            if not scripthash:
                return self._get_history_blockcypher(address)
            
            result = self._send_request("blockchain.scripthash.get_history", [scripthash])
            
            return {
                'transactions': result if isinstance(result, list) else []
            }
            
        except Exception as e:
            print(f"Erro ao obter histórico via Electrum: {e}")
            # Fallback para BlockCypher
            return self._get_history_blockcypher(address)
    
    def _get_balance_blockcypher(self, address: str) -> Dict:
        """
        Obtém saldo usando a API BlockCypher como fallback
        """
        try:
            url = f"https://api.blockcypher.com/v1/btc/main/addrs/{address}/balance"
            params = {'token': self.blockcypher_token} if self.blockcypher_token else {}
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            return {
                'confirmed': data.get('balance', 0),
                'unconfirmed': data.get('unconfirmed_balance', 0)
            }
            
        except Exception as e:
            print(f"Erro ao obter saldo via BlockCypher: {e}")
            return {'confirmed': 0, 'unconfirmed': 0}
    
    def _get_history_blockcypher(self, address: str) -> Dict:
        """
        Obtém histórico usando a API BlockCypher como fallback
        """
        try:
            url = f"https://api.blockcypher.com/v1/btc/main/addrs/{address}"
            params = {'token': self.blockcypher_token} if self.blockcypher_token else {}
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            transactions = []
            for tx in data.get('txrefs', []):
                transactions.append({
                    'tx_hash': tx.get('tx_hash', ''),
                    'height': tx.get('block_height', 0),
                    'value': tx.get('value', 0)
                })
            
            return {
                'transactions': transactions
            }
            
        except Exception as e:
            print(f"Erro ao obter histórico via BlockCypher: {e}")
            return {'transactions': []}
    
    def set_blockcypher_token(self, token: str):
        """
        Define o token da API BlockCypher
        """
        self.blockcypher_token = token
    
    def __del__(self):
        """
        Destructor - desconecta automaticamente
        """
        self.disconnect()

