"""
Aplicação Flask Principal
API RESTful para Sistema de Carteira Digital Bitcoin
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Adiciona o diretório pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from config.config import config
from app.database import DatabaseManager
from app.bitcoin_core import BitcoinAddress, BlockchainClient
from app.crypto_utils import CryptoManager
from app.wallet_importer import WalletImporter


def create_app(config_name='development'):
    """
    Cria e configura a aplicação Flask
    
    Args:
        config_name: Nome da configuração a ser usada
        
    Returns:
        Aplicação Flask configurada
    """
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Habilita CORS
    CORS(app)
    
    # Inicializa componentes
    db_manager = DatabaseManager(
        mongodb_uri=app.config['MONGODB_URI'],
        db_name=app.config['MONGODB_DB_NAME'],
        redis_host=app.config['REDIS_HOST'],
        redis_port=app.config['REDIS_PORT'],
        redis_db=app.config['REDIS_DB']
    )
    
    blockchain_client = BlockchainClient(app.config['BLOCKCHAIN_APIS'])
    crypto_manager = CryptoManager(app.config['MASTER_PASSPHRASE'])
    
    # ==================== ROTAS DA API ====================
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Verifica o status da API"""
        try:
            # Verifica conexão com blockchain
            block_height = blockchain_client.get_current_block_height()
            return jsonify({
                'status': 'healthy',
                'network': app.config['BITCOIN_NETWORK'],
                'current_block_height': block_height,
                'protocol': 'TSRA Active'
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'error': str(e)
            }), 500
    
    @app.route('/api/wallets', methods=['POST'])
    def create_wallet():
        """Cria uma nova carteira"""
        try:
            data = request.get_json()
            name = data.get('name', 'Default Wallet')
            
            wallet_id = db_manager.create_wallet(name)
            
            return jsonify({
                'success': True,
                'wallet_id': wallet_id,
                'name': name
            }), 201
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/wallets/<wallet_id>', methods=['GET'])
    def get_wallet(wallet_id):
        """Obtém informações de uma carteira"""
        try:
            wallet = db_manager.get_wallet(wallet_id)
            if not wallet:
                return jsonify({
                    'success': False,
                    'error': 'Wallet not found'
                }), 404
            
            # Obtém endereços da carteira
            addresses = db_manager.list_wallet_addresses(wallet_id)
            
            # Calcula saldo total
            total_balance = 0
            for address in addresses:
                try:
                    balance = blockchain_client.get_address_balance(address['address'])
                    total_balance += balance
                except:
                    continue
            
            wallet['addresses'] = addresses
            wallet['total_balance_satoshis'] = total_balance
            wallet['total_balance_btc'] = total_balance / 100000000
            
            return jsonify({
                'success': True,
                'wallet': wallet
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/wallets', methods=['GET'])
    def list_wallets():
        """Lista todas as carteiras"""
        try:
            wallets = db_manager.list_wallets()
            return jsonify({
                'success': True,
                'wallets': wallets
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/wallets/<wallet_id>', methods=['DELETE'])
    def delete_wallet(wallet_id):
        """Deleta uma carteira"""
        try:
            success = db_manager.delete_wallet(wallet_id)
            if not success:
                return jsonify({
                    'success': False,
                    'error': 'Wallet not found'
                }), 404
            
            return jsonify({
                'success': True,
                'message': 'Wallet deleted successfully'
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/wallets/<wallet_id>/addresses', methods=['POST'])
    def generate_address(wallet_id):
        """Gera um novo endereço para uma carteira"""
        try:
            # Verifica se a carteira existe
            wallet = db_manager.get_wallet(wallet_id)
            if not wallet:
                return jsonify({
                    'success': False,
                    'error': 'Wallet not found'
                }), 404
            
            # Gera novo endereço
            address, private_key_wif, private_key_hex = BitcoinAddress.generate_address()
            
            # Criptografa a chave privada
            private_key_encrypted = crypto_manager.encrypt_private_key(private_key_wif)
            
            # Salva no banco de dados
            address_id = db_manager.add_address(wallet_id, address, private_key_encrypted)
            
            return jsonify({
                'success': True,
                'address_id': address_id,
                'address': address,
                'message': 'Address generated successfully'
            }), 201
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/wallets/<wallet_id>/addresses', methods=['GET'])
    def list_addresses(wallet_id):
        """Lista os endereços de uma carteira"""
        try:
            addresses = db_manager.list_wallet_addresses(wallet_id)
            
            # Obtém saldo de cada endereço
            for address in addresses:
                try:
                    balance = blockchain_client.get_address_balance(address['address'])
                    address['balance_satoshis'] = balance
                    address['balance_btc'] = balance / 100000000
                except:
                    address['balance_satoshis'] = 0
                    address['balance_btc'] = 0
            
            return jsonify({
                'success': True,
                'addresses': addresses
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/wallets/<wallet_id>/import', methods=['POST'])
    def import_wallet(wallet_id):
        """Importa endereços e chaves privadas de um arquivo"""
        try:
            # Verifica se a carteira existe
            wallet = db_manager.get_wallet(wallet_id)
            if not wallet:
                return jsonify({
                    'success': False,
                    'error': 'Wallet not found'
                }), 404
            
            # Verifica se há arquivo no request
            if 'file' not in request.files:
                return jsonify({
                    'success': False,
                    'error': 'No file provided'
                }), 400
            
            file = request.files['file']
            if file.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'No file selected'
                }), 400
            
            # Salva o arquivo temporariamente
            filename = file.filename
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            # Importa as chaves
            private_keys, addresses = WalletImporter.import_wallet_file(file_path)
            
            # Remove o arquivo temporário
            os.remove(file_path)
            
            if not private_keys:
                return jsonify({
                    'success': False,
                    'error': 'No valid keys found in file'
                }), 400
            
            # Criptografa e salva as chaves (Protocolo CAISK)
            master_key_encrypted, key_mapping = crypto_manager.encrypt_master_key(private_keys)
            
            # Salva a Master Key
            db_manager.save_master_key(wallet_id, master_key_encrypted, len(private_keys))
            
            # Salva cada endereço individualmente
            imported_addresses = []
            for idx, (private_key, address) in enumerate(zip(private_keys, addresses)):
                private_key_encrypted = crypto_manager.encrypt_private_key(private_key)
                address_id = db_manager.add_address(wallet_id, address, private_key_encrypted)
                imported_addresses.append({
                    'address_id': address_id,
                    'address': address
                })
            
            return jsonify({
                'success': True,
                'imported_count': len(private_keys),
                'addresses': imported_addresses,
                'message': 'Wallet imported successfully - Protocolo CAISK activated'
            }), 201
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/addresses/<address>/balance', methods=['GET'])
    def get_address_balance(address):
        """Obtém o saldo de um endereço"""
        try:
            balance = blockchain_client.get_address_balance(address)
            return jsonify({
                'success': True,
                'address': address,
                'balance_satoshis': balance,
                'balance_btc': balance / 100000000
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/blockchain/height', methods=['GET'])
    def get_block_height():
        """Obtém a altura do bloco atual (Protocolo TSRA)"""
        try:
            height = blockchain_client.get_current_block_height()
            return jsonify({
                'success': True,
                'block_height': height,
                'network': 'mainnet'
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/wallets/<wallet_id>/transactions', methods=['GET'])
    def list_transactions(wallet_id):
        """Lista as transações de uma carteira"""
        try:
            transactions = db_manager.list_wallet_transactions(wallet_id)
            return jsonify({
                'success': True,
                'transactions': transactions
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    return app


if __name__ == '__main__':
    app = create_app('development')
    app.run(host='0.0.0.0', port=5000, debug=True)
