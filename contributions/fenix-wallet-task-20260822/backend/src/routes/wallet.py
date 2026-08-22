"""
Rotas da API para gerenciamento de carteiras
"""
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
import hashlib
from typing import Dict, List
from src.wallet_parser import WalletParser
from src.electrum_client import ElectrumClient

wallet_bp = Blueprint('wallet', __name__)

# Diretório para armazenar carteiras importadas
WALLET_STORAGE_DIR = os.path.join(os.path.dirname(__file__), '..', 'wallet_storage')
os.makedirs(WALLET_STORAGE_DIR, exist_ok=True)

# Instância global do parser e cliente Electrum
wallet_parser = WalletParser()
electrum_client = ElectrumClient()

@wallet_bp.route('/wallets', methods=['GET'])
def get_wallets():
    """
    Retorna a lista de carteiras disponíveis
    """
    try:
        wallets = []
        
        # Carteiras padrão (Fênix e Gênesis)
        default_wallets = [
            {
                'id': 'fenix',
                'name': 'Fênix',
                'type': 'default',
                'addresses_count': 0,
                'total_balance': 0
            },
            {
                'id': 'genesis',
                'name': 'Gênesis',
                'type': 'default',
                'addresses_count': 0,
                'total_balance': 0
            }
        ]
        
        wallets.extend(default_wallets)
        
        # Carteiras importadas
        wallet_index_file = os.path.join(WALLET_STORAGE_DIR, 'wallet_index.json')
        if os.path.exists(wallet_index_file):
            with open(wallet_index_file, 'r') as f:
                imported_wallets = json.load(f)
                wallets.extend(imported_wallets)
        
        return jsonify({
            'success': True,
            'wallets': wallets
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@wallet_bp.route('/wallets/import', methods=['POST'])
def import_wallet():
    """
    Importa um arquivo de carteira (wallet.dat, .wallet, .backup)
    """
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Nenhum arquivo foi enviado'
            }), 400
        
        file = request.files['file']
        password = request.form.get('password', '')
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'Nenhum arquivo selecionado'
            }), 400
        
        # Verifica se o formato é suportado
        filename = secure_filename(file.filename)
        file_ext = os.path.splitext(filename)[1].lower()
        
        if file_ext not in wallet_parser.get_supported_formats():
            return jsonify({
                'success': False,
                'error': f'Formato de arquivo não suportado: {file_ext}'
            }), 400
        
        # Salva o arquivo temporariamente
        temp_file_path = os.path.join(WALLET_STORAGE_DIR, f'temp_{filename}')
        file.save(temp_file_path)
        
        try:
            # Parse do arquivo de carteira
            wallet_data = wallet_parser.parse_wallet_file(temp_file_path, password if password else None)
            
            if wallet_data.get('error'):
                return jsonify({
                    'success': False,
                    'error': f'Erro ao processar carteira: {wallet_data["error"]}'
                }), 400
            
            if not wallet_data.get('keys'):
                return jsonify({
                    'success': False,
                    'error': 'Nenhuma chave privada encontrada no arquivo'
                }), 400
            
            # Gera um ID único para a carteira
            wallet_id = hashlib.md5(filename.encode()).hexdigest()[:8]
            wallet_name = f'Importada - {os.path.splitext(filename)[0]}'
            
            # Salva os dados da carteira
            wallet_info = {
                'id': wallet_id,
                'name': wallet_name,
                'type': 'imported',
                'source_file': filename,
                'addresses_count': len(wallet_data['keys']),
                'total_balance': 0,
                'keys': wallet_data['keys']
            }
            
            # Salva a carteira no armazenamento
            wallet_file_path = os.path.join(WALLET_STORAGE_DIR, f'{wallet_id}.json')
            with open(wallet_file_path, 'w') as f:
                json.dump(wallet_info, f, indent=2)
            
            # Atualiza o índice de carteiras
            wallet_index_file = os.path.join(WALLET_STORAGE_DIR, 'wallet_index.json')
            wallet_index = []
            
            if os.path.exists(wallet_index_file):
                with open(wallet_index_file, 'r') as f:
                    wallet_index = json.load(f)
            
            # Remove a entrada existente se houver
            wallet_index = [w for w in wallet_index if w['id'] != wallet_id]
            
            # Adiciona a nova carteira (sem as chaves no índice)
            wallet_index.append({
                'id': wallet_id,
                'name': wallet_name,
                'type': 'imported',
                'source_file': filename,
                'addresses_count': len(wallet_data['keys']),
                'total_balance': 0
            })
            
            with open(wallet_index_file, 'w') as f:
                json.dump(wallet_index, f, indent=2)
            
            return jsonify({
                'success': True,
                'wallet_id': wallet_id,
                'wallet_name': wallet_name,
                'addresses_count': len(wallet_data['keys']),
                'message': f'Carteira importada com sucesso! {len(wallet_data["keys"])} chaves encontradas.'
            })
            
        finally:
            # Remove o arquivo temporário
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@wallet_bp.route('/wallets/<wallet_id>/balances', methods=['GET'])
def get_wallet_balances(wallet_id):
    """
    Obtém os saldos de uma carteira específica
    """
    try:
        # Carrega os dados da carteira
        wallet_data = _load_wallet_data(wallet_id)
        if not wallet_data:
            return jsonify({
                'success': False,
                'error': 'Carteira não encontrada'
            }), 404
        
        # Se for uma carteira padrão sem chaves, retorna dados vazios
        if not wallet_data.get('keys'):
            return jsonify({
                'success': True,
                'wallet_id': wallet_id,
                'addresses': [],
                'total_confirmed': 0,
                'total_unconfirmed': 0,
                'total_transactions': 0
            })
        
        # Obtém os saldos via Electrum
        addresses_data = []
        total_confirmed = 0
        total_unconfirmed = 0
        total_transactions = 0
        
        for key_data in wallet_data['keys']:
            address = key_data['address']
            wif = key_data['wif']
            
            # Consulta o saldo via Electrum
            balance_info = electrum_client.get_address_balance(address)
            history_info = electrum_client.get_address_history(address)
            
            confirmed_balance = balance_info.get('confirmed', 0) / 100000000  # Converte de satoshis para BTC
            unconfirmed_balance = balance_info.get('unconfirmed', 0) / 100000000
            tx_count = len(history_info.get('transactions', []))
            
            addresses_data.append({
                'wif': wif,
                'address': address,
                'confirmed_balance': confirmed_balance,
                'unconfirmed_balance': unconfirmed_balance,
                'transaction_count': tx_count,
                'status': 'confirmed' if confirmed_balance > 0 else 'empty'
            })
            
            total_confirmed += confirmed_balance
            total_unconfirmed += unconfirmed_balance
            total_transactions += tx_count
        
        return jsonify({
            'success': True,
            'wallet_id': wallet_id,
            'addresses': addresses_data,
            'total_confirmed': total_confirmed,
            'total_unconfirmed': total_unconfirmed,
            'total_transactions': total_transactions
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@wallet_bp.route('/wallets/<wallet_id>/export', methods=['GET'])
def export_wallet_csv(wallet_id):
    """
    Exporta os dados da carteira em formato CSV
    """
    try:
        # Carrega os dados da carteira
        wallet_data = _load_wallet_data(wallet_id)
        if not wallet_data:
            return jsonify({
                'success': False,
                'error': 'Carteira não encontrada'
            }), 404
        
        # Gera o CSV
        csv_lines = ['WIF,Endereço,Saldo Confirmado (BTC),Saldo Não Confirmado (BTC),Transações']
        
        for key_data in wallet_data.get('keys', []):
            address = key_data['address']
            wif = key_data['wif']
            
            # Obtém os saldos atuais
            balance_info = electrum_client.get_address_balance(address)
            history_info = electrum_client.get_address_history(address)
            
            confirmed_balance = balance_info.get('confirmed', 0) / 100000000
            unconfirmed_balance = balance_info.get('unconfirmed', 0) / 100000000
            tx_count = len(history_info.get('transactions', []))
            
            csv_lines.append(f'{wif},{address},{confirmed_balance},{unconfirmed_balance},{tx_count}')
        
        csv_content = '\\n'.join(csv_lines)
        
        return jsonify({
            'success': True,
            'csv_content': csv_content,
            'filename': f'{wallet_data.get("name", "wallet")}_export.csv'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def _load_wallet_data(wallet_id: str) -> Dict:
    """
    Carrega os dados de uma carteira específica
    """
    # Carteiras padrão
    if wallet_id in ['fenix', 'genesis']:
        return {
            'id': wallet_id,
            'name': wallet_id.capitalize(),
            'type': 'default',
            'keys': []
        }
    
    # Carteiras importadas
    wallet_file_path = os.path.join(WALLET_STORAGE_DIR, f'{wallet_id}.json')
    if os.path.exists(wallet_file_path):
        with open(wallet_file_path, 'r') as f:
            return json.load(f)
    
    return None

