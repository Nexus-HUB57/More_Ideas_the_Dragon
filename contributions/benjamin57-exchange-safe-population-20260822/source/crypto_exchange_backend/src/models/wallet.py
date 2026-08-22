from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

# Usar a mesma instância do db do modelo user
from src.models.user import db

class Wallet(db.Model):
    __tablename__ = 'wallets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    currency = db.Column(db.String(10), nullable=False)  # BNJ, USDT, BTC, ETH
    balance = db.Column(db.Float, default=0.0)
    locked_balance = db.Column(db.Float, default=0.0)  # Saldo bloqueado em ordens
    address = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com usuário será definido após importação
    # user = db.relationship('User', backref=db.backref('wallets', lazy=True))
    
    @property
    def available_balance(self):
        return self.balance - self.locked_balance
    
    def lock_balance(self, amount):
        """Bloqueia saldo para uma ordem"""
        if self.available_balance >= amount:
            self.locked_balance += amount
            return True
        return False
    
    def unlock_balance(self, amount):
        """Desbloqueia saldo de uma ordem cancelada"""
        self.locked_balance = max(0, self.locked_balance - amount)
    
    def deduct_balance(self, amount):
        """Deduz saldo após execução de ordem"""
        if self.locked_balance >= amount:
            self.locked_balance -= amount
            self.balance -= amount
            return True
        return False
    
    def add_balance(self, amount):
        """Adiciona saldo após recebimento"""
        self.balance += amount
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'currency': self.currency,
            'balance': self.balance,
            'locked_balance': self.locked_balance,
            'available_balance': self.available_balance,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallets.id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # deposit, withdrawal, trade, p2p
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    reference_id = db.Column(db.String(36))  # ID da ordem/trade relacionado
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos serão definidos após importação
    # user = db.relationship('User', backref=db.backref('transactions', lazy=True))
    # wallet = db.relationship('Wallet', backref=db.backref('transactions', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'wallet_id': self.wallet_id,
            'transaction_type': self.transaction_type,
            'amount': self.amount,
            'currency': self.currency,
            'status': self.status,
            'reference_id': self.reference_id,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MarketData(db.Model):
    __tablename__ = 'market_data'
    
    id = db.Column(db.Integer, primary_key=True)
    pair = db.Column(db.String(10), nullable=False)  # BNJ/USDT
    price = db.Column(db.Float, nullable=False)
    volume_24h = db.Column(db.Float, default=0.0)
    change_24h = db.Column(db.Float, default=0.0)  # Percentual
    high_24h = db.Column(db.Float, default=0.0)
    low_24h = db.Column(db.Float, default=0.0)
    last_trade_price = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'pair': self.pair,
            'price': self.price,
            'volume_24h': self.volume_24h,
            'change_24h': self.change_24h,
            'high_24h': self.high_24h,
            'low_24h': self.low_24h,
            'last_trade_price': self.last_trade_price,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

