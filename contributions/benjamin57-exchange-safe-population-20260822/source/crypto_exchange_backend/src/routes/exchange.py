from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.order import Order, Trade, P2POrder
from src.models.wallet import Wallet, Transaction, MarketData
from datetime import datetime
import uuid

exchange_bp = Blueprint('exchange', __name__)

# ===== LIVRO DE ORDENS =====

@exchange_bp.route('/orderbook/<pair>', methods=['GET'])
def get_orderbook(pair):
    """Obtém o livro de ordens para um par específico"""
    try:
        # Ordens de compra (ordenadas por preço decrescente)
        buy_orders = Order.query.filter_by(
            pair=pair, 
            order_type='buy', 
            status='open'
        ).order_by(Order.price.desc()).limit(20).all()
        
        # Ordens de venda (ordenadas por preço crescente)
        sell_orders = Order.query.filter_by(
            pair=pair, 
            order_type='sell', 
            status='open'
        ).order_by(Order.price.asc()).limit(20).all()
        
        return jsonify({
            'pair': pair,
            'bids': [order.to_dict() for order in buy_orders],
            'asks': [order.to_dict() for order in sell_orders],
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@exchange_bp.route('/orders', methods=['POST'])
def create_order():
    """Cria uma nova ordem"""
    try:
        data = request.get_json()
        
        # Validações básicas
        required_fields = ['user_id', 'pair', 'order_type', 'amount', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        user_id = data['user_id']
        pair = data['pair']
        order_type = data['order_type']
        amount = float(data['amount'])
        price = float(data['price'])
        total = amount * price
        
        # Verificar se o usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Determinar qual moeda será usada para pagamento
        base_currency, quote_currency = pair.split('/')
        
        if order_type == 'buy':
            # Para comprar, precisa ter saldo na moeda de cotação (USDT)
            required_currency = quote_currency
            required_amount = total
        else:
            # Para vender, precisa ter saldo na moeda base (BNJ)
            required_currency = base_currency
            required_amount = amount
        
        # Verificar saldo na carteira
        wallet = Wallet.query.filter_by(
            user_id=user_id, 
            currency=required_currency
        ).first()
        
        if not wallet or wallet.available_balance < required_amount:
            return jsonify({'error': f'Saldo insuficiente em {required_currency}'}), 400
        
        # Bloquear saldo
        if not wallet.lock_balance(required_amount):
            return jsonify({'error': 'Erro ao bloquear saldo'}), 500
        
        # Criar a ordem
        order = Order(
            user_id=user_id,
            pair=pair,
            order_type=order_type,
            amount=amount,
            price=price,
            total=total
        )
        
        db.session.add(order)
        db.session.commit()
        
        # Tentar executar a ordem imediatamente
        execute_order(order)
        
        return jsonify({
            'message': 'Ordem criada com sucesso',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def execute_order(new_order):
    """Executa uma ordem contra o livro de ordens existente"""
    try:
        if new_order.order_type == 'buy':
            # Buscar ordens de venda compatíveis (preço <= preço da ordem de compra)
            matching_orders = Order.query.filter_by(
                pair=new_order.pair,
                order_type='sell',
                status='open'
            ).filter(Order.price <= new_order.price).order_by(Order.price.asc()).all()
        else:
            # Buscar ordens de compra compatíveis (preço >= preço da ordem de venda)
            matching_orders = Order.query.filter_by(
                pair=new_order.pair,
                order_type='buy',
                status='open'
            ).filter(Order.price >= new_order.price).order_by(Order.price.desc()).all()
        
        remaining_amount = new_order.amount - new_order.filled_amount
        
        for matching_order in matching_orders:
            if remaining_amount <= 0:
                break
            
            # Calcular quantidade a ser executada
            available_amount = matching_order.amount - matching_order.filled_amount
            trade_amount = min(remaining_amount, available_amount)
            trade_price = matching_order.price  # Preço do maker
            trade_total = trade_amount * trade_price
            
            # Criar o trade
            trade = Trade(
                buy_order_id=new_order.id if new_order.order_type == 'buy' else matching_order.id,
                sell_order_id=new_order.id if new_order.order_type == 'sell' else matching_order.id,
                pair=new_order.pair,
                amount=trade_amount,
                price=trade_price,
                total=trade_total,
                buyer_id=new_order.user_id if new_order.order_type == 'buy' else matching_order.user_id,
                seller_id=new_order.user_id if new_order.order_type == 'sell' else matching_order.user_id
            )
            
            # Atualizar ordens
            new_order.filled_amount += trade_amount
            matching_order.filled_amount += trade_amount
            
            # Verificar se as ordens foram completamente executadas
            if new_order.filled_amount >= new_order.amount:
                new_order.status = 'filled'
            
            if matching_order.filled_amount >= matching_order.amount:
                matching_order.status = 'filled'
            
            # Processar transferência de fundos
            process_trade_settlement(trade)
            
            db.session.add(trade)
            remaining_amount -= trade_amount
        
        # Se a ordem não foi completamente executada, marcar como parcial
        if new_order.filled_amount > 0 and new_order.filled_amount < new_order.amount:
            new_order.status = 'partial'
        
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        raise e

def process_trade_settlement(trade):
    """Processa a liquidação de um trade (transferência de fundos)"""
    try:
        base_currency, quote_currency = trade.pair.split('/')
        
        # Carteiras do comprador
        buyer_base_wallet = Wallet.query.filter_by(
            user_id=trade.buyer_id, 
            currency=base_currency
        ).first()
        buyer_quote_wallet = Wallet.query.filter_by(
            user_id=trade.buyer_id, 
            currency=quote_currency
        ).first()
        
        # Carteiras do vendedor
        seller_base_wallet = Wallet.query.filter_by(
            user_id=trade.seller_id, 
            currency=base_currency
        ).first()
        seller_quote_wallet = Wallet.query.filter_by(
            user_id=trade.seller_id, 
            currency=quote_currency
        ).first()
        
        # Transferir moeda base do vendedor para o comprador
        seller_base_wallet.deduct_balance(trade.amount)
        buyer_base_wallet.add_balance(trade.amount)
        
        # Transferir moeda de cotação do comprador para o vendedor
        buyer_quote_wallet.deduct_balance(trade.total)
        seller_quote_wallet.add_balance(trade.total)
        
        # Criar transações de histórico
        transactions = [
            Transaction(
                user_id=trade.buyer_id,
                wallet_id=buyer_base_wallet.id,
                transaction_type='trade',
                amount=trade.amount,
                currency=base_currency,
                status='completed',
                reference_id=trade.id,
                description=f'Compra de {trade.amount} {base_currency} por {trade.total} {quote_currency}'
            ),
            Transaction(
                user_id=trade.seller_id,
                wallet_id=seller_quote_wallet.id,
                transaction_type='trade',
                amount=trade.total,
                currency=quote_currency,
                status='completed',
                reference_id=trade.id,
                description=f'Venda de {trade.amount} {base_currency} por {trade.total} {quote_currency}'
            )
        ]
        
        for transaction in transactions:
            db.session.add(transaction)
        
    except Exception as e:
        raise e

@exchange_bp.route('/orders/<order_id>', methods=['DELETE'])
def cancel_order(order_id):
    """Cancela uma ordem"""
    try:
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'error': 'Ordem não encontrada'}), 404
        
        if order.status not in ['open', 'partial']:
            return jsonify({'error': 'Ordem não pode ser cancelada'}), 400
        
        # Desbloquear saldo
        base_currency, quote_currency = order.pair.split('/')
        
        if order.order_type == 'buy':
            currency = quote_currency
            amount_to_unlock = (order.amount - order.filled_amount) * order.price
        else:
            currency = base_currency
            amount_to_unlock = order.amount - order.filled_amount
        
        wallet = Wallet.query.filter_by(
            user_id=order.user_id, 
            currency=currency
        ).first()
        
        if wallet:
            wallet.unlock_balance(amount_to_unlock)
        
        order.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'message': 'Ordem cancelada com sucesso',
            'order': order.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@exchange_bp.route('/trades/<pair>', methods=['GET'])
def get_recent_trades(pair):
    """Obtém trades recentes para um par"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        trades = Trade.query.filter_by(pair=pair).order_by(
            Trade.created_at.desc()
        ).limit(limit).all()
        
        return jsonify({
            'pair': pair,
            'trades': [trade.to_dict() for trade in trades]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@exchange_bp.route('/market-data/<pair>', methods=['GET'])
def get_market_data(pair):
    """Obtém dados de mercado para um par"""
    try:
        market_data = MarketData.query.filter_by(pair=pair).order_by(
            MarketData.timestamp.desc()
        ).first()
        
        if not market_data:
            # Criar dados iniciais se não existirem
            market_data = MarketData(
                pair=pair,
                price=1.10,  # Preço inicial BNJ/USDT
                volume_24h=0.0,
                change_24h=0.0,
                high_24h=1.10,
                low_24h=1.10
            )
            db.session.add(market_data)
            db.session.commit()
        
        return jsonify(market_data.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

