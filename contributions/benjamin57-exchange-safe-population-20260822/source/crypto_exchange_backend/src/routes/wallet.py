from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.wallet import Wallet, Transaction
from datetime import datetime
import secrets

wallet_bp = Blueprint('wallet', __name__)

@wallet_bp.route('/wallets', methods=['GET'])
def get_wallets():
    """Lista todas as carteiras ou de um usuário específico"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        if user_id:
            wallets = Wallet.query.filter_by(user_id=user_id).all()
        else:
            wallets = Wallet.query.all()
        
        return jsonify({
            'wallets': [wallet.to_dict() for wallet in wallets],
            'total': len(wallets)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_bp.route('/wallets', methods=['POST'])
def create_wallet():
    """Cria uma nova carteira"""
    try:
        data = request.get_json()
        
        # Validações básicas
        required_fields = ['user_id', 'currency']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        user_id = data['user_id']
        currency = data['currency'].upper()
        initial_balance = float(data.get('balance', 0.0))
        
        # Verificar se o usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Verificar se já existe uma carteira para essa moeda
        existing_wallet = Wallet.query.filter_by(
            user_id=user_id, 
            currency=currency
        ).first()
        
        if existing_wallet:
            return jsonify({'error': f'Carteira {currency} já existe para este usuário'}), 400
        
        # Gerar endereço único
        address = generate_wallet_address(currency, user_id)
        
        # Criar a carteira
        wallet = Wallet(
            user_id=user_id,
            currency=currency,
            balance=initial_balance,
            address=address
        )
        
        db.session.add(wallet)
        db.session.commit()
        
        # Se houve saldo inicial, criar transação de depósito
        if initial_balance > 0:
            transaction = Transaction(
                user_id=user_id,
                wallet_id=wallet.id,
                transaction_type='deposit',
                amount=initial_balance,
                currency=currency,
                status='completed',
                description=f'Depósito inicial de {initial_balance} {currency}'
            )
            db.session.add(transaction)
            db.session.commit()
        
        return jsonify({
            'message': 'Carteira criada com sucesso',
            'wallet': wallet.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def generate_wallet_address(currency, user_id):
    """Gera um endereço único para a carteira"""
    timestamp = str(int(datetime.utcnow().timestamp()))
    random_part = secrets.token_hex(8)
    
    if currency == 'BTC':
        return f"1{random_part[:15]}{timestamp[-8:]}"
    elif currency == 'ETH':
        return f"0x{random_part}{timestamp[-8:]}"
    elif currency == 'LTC':
        return f"L{random_part[:15]}{timestamp[-8:]}"
    elif currency == 'BNJ':
        return f"BNJ{random_part[:12]}{timestamp[-8:]}"
    elif currency == 'USDT':
        return f"USDT{random_part[:11]}{timestamp[-8:]}"
    else:
        return f"{currency}{random_part[:10]}{timestamp[-8:]}"

@wallet_bp.route('/wallets/<int:wallet_id>', methods=['GET'])
def get_wallet(wallet_id):
    """Obtém detalhes de uma carteira específica"""
    try:
        wallet = Wallet.query.get(wallet_id)
        if not wallet:
            return jsonify({'error': 'Carteira não encontrada'}), 404
        
        return jsonify(wallet.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_bp.route('/wallets/<int:wallet_id>/balance', methods=['PUT'])
def update_wallet_balance(wallet_id):
    """Atualiza o saldo de uma carteira (para testes/admin)"""
    try:
        data = request.get_json()
        
        if 'balance' not in data:
            return jsonify({'error': 'Campo balance é obrigatório'}), 400
        
        wallet = Wallet.query.get(wallet_id)
        if not wallet:
            return jsonify({'error': 'Carteira não encontrada'}), 404
        
        new_balance = float(data['balance'])
        old_balance = wallet.balance
        difference = new_balance - old_balance
        
        wallet.balance = new_balance
        
        # Criar transação de histórico
        transaction_type = 'deposit' if difference > 0 else 'withdrawal'
        transaction = Transaction(
            user_id=wallet.user_id,
            wallet_id=wallet.id,
            transaction_type=transaction_type,
            amount=abs(difference),
            currency=wallet.currency,
            status='completed',
            description=f'Ajuste de saldo: {old_balance} → {new_balance} {wallet.currency}'
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Saldo atualizado com sucesso',
            'wallet': wallet.to_dict(),
            'difference': difference
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@wallet_bp.route('/wallets/<int:wallet_id>/transactions', methods=['GET'])
def get_wallet_transactions(wallet_id):
    """Obtém o histórico de transações de uma carteira"""
    try:
        wallet = Wallet.query.get(wallet_id)
        if not wallet:
            return jsonify({'error': 'Carteira não encontrada'}), 404
        
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        transactions = Transaction.query.filter_by(wallet_id=wallet_id).order_by(
            Transaction.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        total_transactions = Transaction.query.filter_by(wallet_id=wallet_id).count()
        
        return jsonify({
            'wallet_id': wallet_id,
            'currency': wallet.currency,
            'transactions': [transaction.to_dict() for transaction in transactions],
            'total': total_transactions,
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_bp.route('/wallets/transfer', methods=['POST'])
def transfer_between_wallets():
    """Transfere fundos entre carteiras (interno)"""
    try:
        data = request.get_json()
        
        # Validações básicas
        required_fields = ['from_wallet_id', 'to_wallet_id', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        from_wallet_id = data['from_wallet_id']
        to_wallet_id = data['to_wallet_id']
        amount = float(data['amount'])
        description = data.get('description', 'Transferência interna')
        
        if amount <= 0:
            return jsonify({'error': 'Valor deve ser positivo'}), 400
        
        # Buscar carteiras
        from_wallet = Wallet.query.get(from_wallet_id)
        to_wallet = Wallet.query.get(to_wallet_id)
        
        if not from_wallet:
            return jsonify({'error': 'Carteira de origem não encontrada'}), 404
        
        if not to_wallet:
            return jsonify({'error': 'Carteira de destino não encontrada'}), 404
        
        # Verificar se são da mesma moeda
        if from_wallet.currency != to_wallet.currency:
            return jsonify({'error': 'Carteiras devem ser da mesma moeda'}), 400
        
        # Verificar saldo suficiente
        if from_wallet.available_balance < amount:
            return jsonify({'error': 'Saldo insuficiente'}), 400
        
        # Processar transferência
        from_wallet.balance -= amount
        to_wallet.balance += amount
        
        # Criar transações de histórico
        transactions = [
            Transaction(
                user_id=from_wallet.user_id,
                wallet_id=from_wallet.id,
                transaction_type='withdrawal',
                amount=amount,
                currency=from_wallet.currency,
                status='completed',
                description=f'Transferência para carteira {to_wallet_id}: {description}'
            ),
            Transaction(
                user_id=to_wallet.user_id,
                wallet_id=to_wallet.id,
                transaction_type='deposit',
                amount=amount,
                currency=to_wallet.currency,
                status='completed',
                description=f'Transferência da carteira {from_wallet_id}: {description}'
            )
        ]
        
        for transaction in transactions:
            db.session.add(transaction)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Transferência realizada com sucesso',
            'from_wallet': from_wallet.to_dict(),
            'to_wallet': to_wallet.to_dict(),
            'amount': amount
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@wallet_bp.route('/wallets/summary/<int:user_id>', methods=['GET'])
def get_user_wallet_summary(user_id):
    """Obtém resumo das carteiras de um usuário"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        wallets = Wallet.query.filter_by(user_id=user_id).all()
        
        # Calcular valores totais
        total_balance_usd = 0
        wallet_summary = []
        
        # Preços simulados (em produção viria de uma API)
        prices = {
            'BTC': 45000.0,
            'ETH': 3000.0,
            'LTC': 100.0,
            'BNJ': 1.10,
            'USDT': 1.0
        }
        
        for wallet in wallets:
            price_usd = prices.get(wallet.currency, 1.0)
            balance_usd = wallet.balance * price_usd
            total_balance_usd += balance_usd
            
            wallet_data = wallet.to_dict()
            wallet_data['price_usd'] = price_usd
            wallet_data['balance_usd'] = balance_usd
            
            wallet_summary.append(wallet_data)
        
        return jsonify({
            'user_id': user_id,
            'username': user.username,
            'wallets': wallet_summary,
            'total_wallets': len(wallets),
            'total_balance_usd': total_balance_usd
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_bp.route('/wallets/<int:wallet_id>', methods=['DELETE'])
def delete_wallet(wallet_id):
    """Deleta uma carteira (apenas se saldo for zero)"""
    try:
        wallet = Wallet.query.get(wallet_id)
        if not wallet:
            return jsonify({'error': 'Carteira não encontrada'}), 404
        
        if wallet.balance > 0 or wallet.locked_balance > 0:
            return jsonify({'error': 'Não é possível deletar carteira com saldo'}), 400
        
        # Deletar transações relacionadas
        Transaction.query.filter_by(wallet_id=wallet_id).delete()
        
        # Deletar carteira
        db.session.delete(wallet)
        db.session.commit()
        
        return jsonify({'message': 'Carteira deletada com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

