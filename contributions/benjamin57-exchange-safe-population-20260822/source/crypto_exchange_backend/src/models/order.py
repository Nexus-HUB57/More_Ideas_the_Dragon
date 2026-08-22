from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

# Usar a mesma instância do db do modelo user
from src.models.user import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    pair = db.Column(db.String(10), nullable=False)  # BNJ/USDT
    order_type = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    amount = db.Column(db.Float, nullable=False)  # Quantidade
    price = db.Column(db.Float, nullable=False)  # Preço unitário
    total = db.Column(db.Float, nullable=False)  # Total da ordem
    status = db.Column(db.String(20), default='open')  # open, filled, cancelled, partial
    filled_amount = db.Column(db.Float, default=0.0)  # Quantidade executada
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com usuário será definido após importação
    # user = db.relationship('User', backref=db.backref('orders', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'pair': self.pair,
            'order_type': self.order_type,
            'amount': self.amount,
            'price': self.price,
            'total': self.total,
            'status': self.status,
            'filled_amount': self.filled_amount,
            'remaining_amount': self.amount - self.filled_amount,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Trade(db.Model):
    __tablename__ = 'trades'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    buy_order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    sell_order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    pair = db.Column(db.String(10), nullable=False)
    amount = db.Column(db.Float, nullable=False)  # Quantidade negociada
    price = db.Column(db.Float, nullable=False)  # Preço da negociação
    total = db.Column(db.Float, nullable=False)  # Total negociado
    buyer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos serão definidos após importação
    # buy_order = db.relationship('Order', foreign_keys=[buy_order_id])
    # sell_order = db.relationship('Order', foreign_keys=[sell_order_id])
    # buyer = db.relationship('User', foreign_keys=[buyer_id])
    # seller = db.relationship('User', foreign_keys=[seller_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'buy_order_id': self.buy_order_id,
            'sell_order_id': self.sell_order_id,
            'pair': self.pair,
            'amount': self.amount,
            'price': self.price,
            'total': self.total,
            'buyer_id': self.buyer_id,
            'seller_id': self.seller_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class P2POrder(db.Model):
    __tablename__ = 'p2p_orders'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_type = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    currency = db.Column(db.String(10), nullable=False)  # BNJ, USDT
    amount = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # PIX, TED, etc
    min_amount = db.Column(db.Float, default=0.0)
    max_amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')  # active, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com usuário será definido após importação
    # user = db.relationship('User', backref=db.backref('p2p_orders', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'order_type': self.order_type,
            'currency': self.currency,
            'amount': self.amount,
            'price_per_unit': self.price_per_unit,
            'total_price': self.total_price,
            'payment_method': self.payment_method,
            'min_amount': self.min_amount,
            'max_amount': self.max_amount,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

