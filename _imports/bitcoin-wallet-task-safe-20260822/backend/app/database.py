"""
Módulo de Gerenciamento de Banco de Dados
Implementa operações CRUD para carteiras, endereços e transações
"""
from pymongo import MongoClient
from datetime import datetime
from typing import Dict, List, Optional
import redis


class DatabaseManager:
    """Gerenciador de banco de dados MongoDB e Redis"""
    
    def __init__(self, mongodb_uri: str, db_name: str, redis_host: str, redis_port: int, redis_db: int):
        """
        Inicializa o gerenciador de banco de dados
        
        Args:
            mongodb_uri: URI de conexão do MongoDB
            db_name: Nome do banco de dados
            redis_host: Host do Redis
            redis_port: Porta do Redis
            redis_db: Número do banco Redis
        """
        # Conecta ao MongoDB
        self.client = MongoClient(mongodb_uri)
        self.db = self.client[db_name]
        
        # Coleções
        self.wallets = self.db['wallets']
        self.addresses = self.db['addresses']
        self.transactions = self.db['transactions']
        self.master_keys = self.db['master_keys']
        
        # Conecta ao Redis (cache)
        self.redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            db=redis_db,
            decode_responses=True
        )
    
    # ==================== OPERAÇÕES DE WALLET ====================
    
    def create_wallet(self, name: str) -> str:
        """
        Cria uma nova carteira
        
        Args:
            name: Nome da carteira
            
        Returns:
            ID da carteira criada
        """
        wallet = {
            'name': name,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = self.wallets.insert_one(wallet)
        return str(result.inserted_id)
    
    def get_wallet(self, wallet_id: str) -> Optional[Dict]:
        """
        Obtém informações de uma carteira
        
        Args:
            wallet_id: ID da carteira
            
        Returns:
            Dados da carteira ou None
        """
        from bson.objectid import ObjectId
        wallet = self.wallets.find_one({'_id': ObjectId(wallet_id)})
        if wallet:
            wallet['_id'] = str(wallet['_id'])
        return wallet
    
    def list_wallets(self) -> List[Dict]:
        """
        Lista todas as carteiras
        
        Returns:
            Lista de carteiras
        """
        wallets = list(self.wallets.find())
        for wallet in wallets:
            wallet['_id'] = str(wallet['_id'])
        return wallets
    
    def delete_wallet(self, wallet_id: str) -> bool:
        """
        Deleta uma carteira e todos os seus endereços
        
        Args:
            wallet_id: ID da carteira
            
        Returns:
            True se deletado com sucesso
        """
        from bson.objectid import ObjectId
        # Deleta endereços associados
        self.addresses.delete_many({'wallet_id': ObjectId(wallet_id)})
        # Deleta transações associadas
        self.transactions.delete_many({'wallet_id': ObjectId(wallet_id)})
        # Deleta a carteira
        result = self.wallets.delete_one({'_id': ObjectId(wallet_id)})
        return result.deleted_count > 0
    
    # ==================== OPERAÇÕES DE ENDEREÇO ====================
    
    def add_address(self, wallet_id: str, address: str, private_key_encrypted: str) -> str:
        """
        Adiciona um endereço a uma carteira
        
        Args:
            wallet_id: ID da carteira
            address: Endereço Bitcoin
            private_key_encrypted: Chave privada criptografada
            
        Returns:
            ID do endereço criado
        """
        from bson.objectid import ObjectId
        address_doc = {
            'wallet_id': ObjectId(wallet_id),
            'address': address,
            'private_key_encrypted': private_key_encrypted,
            'created_at': datetime.utcnow()
        }
        result = self.addresses.insert_one(address_doc)
        
        # Invalida cache
        self.redis_client.delete(f'wallet_addresses:{wallet_id}')
        
        return str(result.inserted_id)
    
    def get_address(self, address_id: str) -> Optional[Dict]:
        """
        Obtém informações de um endereço
        
        Args:
            address_id: ID do endereço
            
        Returns:
            Dados do endereço ou None
        """
        from bson.objectid import ObjectId
        address = self.addresses.find_one({'_id': ObjectId(address_id)})
        if address:
            address['_id'] = str(address['_id'])
            address['wallet_id'] = str(address['wallet_id'])
        return address
    
    def get_address_by_bitcoin_address(self, bitcoin_address: str) -> Optional[Dict]:
        """
        Obtém informações de um endereço pelo endereço Bitcoin
        
        Args:
            bitcoin_address: Endereço Bitcoin
            
        Returns:
            Dados do endereço ou None
        """
        address = self.addresses.find_one({'address': bitcoin_address})
        if address:
            address['_id'] = str(address['_id'])
            address['wallet_id'] = str(address['wallet_id'])
        return address
    
    def list_wallet_addresses(self, wallet_id: str) -> List[Dict]:
        """
        Lista todos os endereços de uma carteira
        
        Args:
            wallet_id: ID da carteira
            
        Returns:
            Lista de endereços
        """
        from bson.objectid import ObjectId
        
        # Tenta obter do cache
        cache_key = f'wallet_addresses:{wallet_id}'
        cached = self.redis_client.get(cache_key)
        
        if not cached:
            addresses = list(self.addresses.find({'wallet_id': ObjectId(wallet_id)}))
            for address in addresses:
                address['_id'] = str(address['_id'])
                address['wallet_id'] = str(address['wallet_id'])
            
            # Armazena no cache por 5 minutos
            import json
            self.redis_client.setex(cache_key, 300, json.dumps(addresses, default=str))
            
            return addresses
        else:
            import json
            return json.loads(cached)
    
    # ==================== OPERAÇÕES DE MASTER KEY ====================
    
    def save_master_key(self, wallet_id: str, master_key_encrypted: str, key_count: int) -> str:
        """
        Salva a Master Key de uma carteira (Protocolo CAISK)
        
        Args:
            wallet_id: ID da carteira
            master_key_encrypted: Master Key criptografada
            key_count: Número de chaves na Master Key
            
        Returns:
            ID do documento da Master Key
        """
        from bson.objectid import ObjectId
        master_key_doc = {
            'wallet_id': ObjectId(wallet_id),
            'master_key_encrypted': master_key_encrypted,
            'key_count': key_count,
            'created_at': datetime.utcnow()
        }
        result = self.master_keys.insert_one(master_key_doc)
        return str(result.inserted_id)
    
    def get_master_key(self, wallet_id: str) -> Optional[Dict]:
        """
        Obtém a Master Key de uma carteira
        
        Args:
            wallet_id: ID da carteira
            
        Returns:
            Dados da Master Key ou None
        """
        from bson.objectid import ObjectId
        master_key = self.master_keys.find_one({'wallet_id': ObjectId(wallet_id)})
        if master_key:
            master_key['_id'] = str(master_key['_id'])
            master_key['wallet_id'] = str(master_key['wallet_id'])
        return master_key
    
    # ==================== OPERAÇÕES DE TRANSAÇÃO ====================
    
    def save_transaction(self, wallet_id: str, txid: str, inputs: List[Dict], 
                        outputs: List[Dict], fee: int) -> str:
        """
        Salva uma transação no banco de dados
        
        Args:
            wallet_id: ID da carteira
            txid: ID da transação
            inputs: Lista de inputs
            outputs: Lista de outputs
            fee: Taxa da transação
            
        Returns:
            ID do documento da transação
        """
        from bson.objectid import ObjectId
        transaction_doc = {
            'wallet_id': ObjectId(wallet_id),
            'txid': txid,
            'inputs': inputs,
            'outputs': outputs,
            'fee': fee,
            'created_at': datetime.utcnow()
        }
        result = self.transactions.insert_one(transaction_doc)
        
        # Invalida cache
        self.redis_client.delete(f'wallet_transactions:{wallet_id}')
        
        return str(result.inserted_id)
    
    def get_transaction(self, txid: str) -> Optional[Dict]:
        """
        Obtém informações de uma transação
        
        Args:
            txid: ID da transação
            
        Returns:
            Dados da transação ou None
        """
        transaction = self.transactions.find_one({'txid': txid})
        if transaction:
            transaction['_id'] = str(transaction['_id'])
            transaction['wallet_id'] = str(transaction['wallet_id'])
        return transaction
    
    def list_wallet_transactions(self, wallet_id: str) -> List[Dict]:
        """
        Lista todas as transações de uma carteira
        
        Args:
            wallet_id: ID da carteira
            
        Returns:
            Lista de transações
        """
        from bson.objectid import ObjectId
        
        # Tenta obter do cache
        cache_key = f'wallet_transactions:{wallet_id}'
        cached = self.redis_client.get(cache_key)
        
        if not cached:
            transactions = list(self.transactions.find({'wallet_id': ObjectId(wallet_id)}).sort('created_at', -1))
            for transaction in transactions:
                transaction['_id'] = str(transaction['_id'])
                transaction['wallet_id'] = str(transaction['wallet_id'])
            
            # Armazena no cache por 2 minutos
            import json
            self.redis_client.setex(cache_key, 120, json.dumps(transactions, default=str))
            
            return transactions
        else:
            import json
            return json.loads(cached)
