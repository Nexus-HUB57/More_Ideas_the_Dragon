from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.order import P2POrder
from src.models.wallet import Wallet, Transaction
from datetime import datetime

p2p_bp = Blueprint('p2p', __name__)

@p2p_bp.route('/p2p/orders', methods=['GET'])
def get_p2p_orders():
    """Lista todas as ordens P2P ativas"""
    try:
        order_type = request.args.get('type')  # buy ou sell
        currency = request.args.get('currency')  # BNJ, USDT
        payment_method = request.args.get('payment_method')  # PIX, TED, etc
        
        query = P2POrder.query.filter_by(status='active')
        
        if order_type:
            query = query.filter_by(order_type=order_type)
        if currency:
            query = query.filter_by(currency=currency)
        if payment_method:
            query = query.filter_by(payment_method=payment_method)
        
        orders = query.order_by(P2POrder.created_at.desc()).all()
        
        return jsonify({
            'orders': [order.to_dict() for order in orders],
            'total': len(orders)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@p2p_bp.route('/p2p/orders', methods=['POST'])
def create_p2p_order():
    """Cria uma nova ordem P2P"""
    try:
        data = request.get_json()
        
        # Validações básicas
        required_fields = ['user_id', 'order_type', 'currency', 'amount', 
                          'price_per_unit', 'payment_method']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        user_id = data['user_id']
        order_type = data['order_type']
        currency = data['currency']
        amount = float(data['amount'])
        price_per_unit = float(data['price_per_unit'])
        total_price = amount * price_per_unit
        payment_method = data['payment_method']
        
        # Campos opcionais
        min_amount = float(data.get('min_amount', 0))
        max_amount = float(data.get('max_amount', amount))
        description = data.get('description', '')
        
        # Verificar se o usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Para ordens de venda, verificar se tem saldo suficiente
        if order_type == 'sell':
            wallet = Wallet.query.filter_by(
                user_id=user_id, 
                currency=currency
            ).first()
            
            if not wallet or wallet.available_balance < amount:
                return jsonify({'error': f'Saldo insuficiente em {currency}'}), 400
            
            # Bloquear o saldo
            if not wallet.lock_balance(amount):
                return jsonify({'error': 'Erro ao bloquear saldo'}), 500
        
        # Criar a ordem P2P
        p2p_order = P2POrder(
            user_id=user_id,
            order_type=order_type,
            currency=currency,
            amount=amount,
            price_per_unit=price_per_unit,
            total_price=total_price,
            payment_method=payment_method,
            min_amount=min_amount,
            max_amount=max_amount,
            description=description
        )
        
        db.session.add(p2p_order)
        db.session.commit()
        
        return jsonify({
            'message': 'Ordem P2P criada com sucesso',
            'order': p2p_order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@p2p_bp.route('/p2p/orders/<order_id>', methods=['GET'])
def get_p2p_order(order_id):
    """Obtém detalhes de uma ordem P2P específica"""
    try:
        order = P2POrder.query.get(order_id)
        if not order:
            return jsonify({'error': 'Ordem não encontrada'}), 404
        
        return jsonify(order.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@p2p_bp.route('/p2p/orders/<order_id>', methods=['PUT'])
def update_p2p_order(order_id):
    """Atualiza uma ordem P2P"""
    try:
        order = P2POrder.query.get(order_id)
        if not order:
            return jsonify({'error': 'Ordem não encontrada'}), 404
        
        data = request.get_json()
        
        # Campos que podem ser atualizados
        updatable_fields = ['amount', 'price_per_unit', 'min_amount', 
                           'max_amount', 'description', 'status']
        
        for field in updatable_fields:
            if field in data:
                if field in ['amount', 'price_per_unit', 'min_amount', 'max_amount']:
                    setattr(order, field, float(data[field]))
                else:
                    setattr(order, field, data[field])
        
        # Recalcular total se necessário
        if 'amount' in data or 'price_per_unit' in data:
            order.total_price = order.amount * order.price_per_unit
        
        order.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Ordem P2P atualizada com sucesso',
            'order': order.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@p2p_bp.route('/p2p/orders/<order_id>', methods=['DELETE'])
def cancel_p2p_order(order_id):
    """Cancela uma ordem P2P"""
    try:
        order = P2POrder.query.get(order_id)
        if not order:
            return jsonify({'error': 'Ordem não encontrada'}), 404
        
        if order.status != 'active':
            return jsonify({'error': 'Ordem não pode ser cancelada'}), 400
        
        # Se for ordem de venda, desbloquear saldo
        if order.order_type == 'sell':
            wallet = Wallet.query.filter_by(
                user_id=order.user_id, 
                currency=order.currency
            ).first()
            
            if wallet:
                wallet.unlock_balance(order.amount)
        
        order.status = 'cancelled'
        order.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Ordem P2P cancelada com sucesso',
            'order': order.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@p2p_bp.route('/p2p/orders/<order_id>/accept', methods=['POST'])
def accept_p2p_order(order_id):
    """Aceita uma ordem P2P (inicia negociação)"""
    try:
        data = request.get_json()
        buyer_id = data.get('buyer_id')
        trade_amount = float(data.get('amount', 0))
        
        if not buyer_id:
            return jsonify({'error': 'ID do comprador é obrigatório'}), 400
        
        order = P2POrder.query.get(order_id)
        if not order:
            return jsonify({'error': 'Ordem não encontrada'}), 404
        
        if order.status != 'active':
            return jsonify({'error': 'Ordem não está ativa'}), 400
        
        # Verificar se não é o próprio criador da ordem
        if order.user_id == buyer_id:
            return jsonify({'error': 'Não é possível aceitar sua própria ordem'}), 400
        
        # Verificar quantidade mínima e máxima
        if trade_amount < order.min_amount or trade_amount > order.max_amount:
            return jsonify({'error': f'Quantidade deve estar entre {order.min_amount} e {order.max_amount}'}), 400
        
        # Verificar se o comprador existe
        buyer = User.query.get(buyer_id)
        if not buyer:
            return jsonify({'error': 'Comprador não encontrado'}), 404
        
        # Para ordens de compra P2P, verificar se o vendedor (quem aceita) tem saldo
        if order.order_type == 'buy':
            seller_wallet = Wallet.query.filter_by(
                user_id=buyer_id, 
                currency=order.currency
            ).first()
            
            if not seller_wallet or seller_wallet.available_balance < trade_amount:
                return jsonify({'error': f'Saldo insuficiente em {order.currency}'}), 400
        
        # Criar transação P2P (simulada - em produção seria mais complexa)
        trade_total = trade_amount * order.price_per_unit
        
        # Criar transações de histórico
        if order.order_type == 'buy':
            # Ordem de compra: transferir do vendedor (quem aceita) para o comprador (criador da ordem)
            seller_id = buyer_id
            actual_buyer_id = order.user_id
        else:
            # Ordem de venda: transferir do vendedor (criador da ordem) para o comprador (quem aceita)
            seller_id = order.user_id
            actual_buyer_id = buyer_id
        
        # Processar transferência (simplificada)
        process_p2p_trade(order, seller_id, actual_buyer_id, trade_amount, trade_total)
        
        # Atualizar status da ordem
        order.status = 'completed'
        order.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Ordem P2P aceita e processada com sucesso',
            'trade_amount': trade_amount,
            'trade_total': trade_total,
            'order': order.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def process_p2p_trade(order, seller_id, buyer_id, amount, total):
    """Processa uma negociação P2P"""
    try:
        # Carteiras do vendedor
        seller_wallet = Wallet.query.filter_by(
            user_id=seller_id, 
            currency=order.currency
        ).first()
        
        # Carteiras do comprador (para receber a criptomoeda)
        buyer_wallet = Wallet.query.filter_by(
            user_id=buyer_id, 
            currency=order.currency
        ).first()
        
        if not buyer_wallet:
            # Criar carteira se não existir
            buyer_wallet = Wallet(
                user_id=buyer_id,
                currency=order.currency,
                balance=0.0,
                address=f"{order.currency.lower()}_{buyer_id}_{datetime.utcnow().timestamp()}"
            )
            db.session.add(buyer_wallet)
        
        # Transferir criptomoeda do vendedor para o comprador
        if order.order_type == 'sell':
            # Desbloquear e deduzir do saldo do vendedor
            seller_wallet.deduct_balance(amount)
        else:
            # Para ordem de compra, deduzir diretamente
            seller_wallet.balance -= amount
        
        buyer_wallet.add_balance(amount)
        
        # Criar transações de histórico
        transactions = [
            Transaction(
                user_id=seller_id,
                wallet_id=seller_wallet.id,
                transaction_type='p2p',
                amount=-amount,  # Negativo para saída
                currency=order.currency,
                status='completed',
                reference_id=order.id,
                description=f'Venda P2P de {amount} {order.currency} por R$ {total:.2f}'
            ),
            Transaction(
                user_id=buyer_id,
                wallet_id=buyer_wallet.id,
                transaction_type='p2p',
                amount=amount,  # Positivo para entrada
                currency=order.currency,
                status='completed',
                reference_id=order.id,
                description=f'Compra P2P de {amount} {order.currency} por R$ {total:.2f}'
            )
        ]
        
        for transaction in transactions:
            db.session.add(transaction)
        
    except Exception as e:
        raise e

@p2p_bp.route('/p2p/my-orders/<int:user_id>', methods=['GET'])
def get_user_p2p_orders(user_id):
    """Obtém as ordens P2P de um usuário específico"""
    try:
        orders = P2POrder.query.filter_by(user_id=user_id).order_by(
            P2POrder.created_at.desc()
        ).all()
        
        return jsonify({
            'orders': [order.to_dict() for order in orders],
            'total': len(orders)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@p2p_bp.route('/p2p/statistics', methods=['GET'])
def get_p2p_statistics():
    """Obtém estatísticas do mercado P2P"""
    try:
        # Estatísticas básicas
        total_orders = P2POrder.query.count()
        active_orders = P2POrder.query.filter_by(status='active').count()
        completed_orders = P2POrder.query.filter_by(status='completed').count()
        
        # Volume por moeda
        currencies = ['BNJ', 'USDT', 'BTC', 'ETH']
        volume_by_currency = {}
        
        for currency in currencies:
            volume = db.session.query(db.func.sum(P2POrder.total_price)).filter_by(
                currency=currency, 
                status='completed'
            ).scalar() or 0
            volume_by_currency[currency] = volume
        
        return jsonify({
            'total_orders': total_orders,
            'active_orders': active_orders,
            'completed_orders': completed_orders,
            'volume_by_currency': volume_by_currency
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

