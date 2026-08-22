from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import secrets

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    country = db.Column(db.String(50))
    city = db.Column(db.String(50))
    address = db.Column(db.Text)
    document_number = db.Column(db.String(50))  # CPF, RG, etc
    document_type = db.Column(db.String(20))
    is_verified = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    two_factor_enabled = db.Column(db.Boolean, default=False)
    api_key = db.Column(db.String(64), unique=True)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.set_password(password)
        self.generate_api_key()
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_api_key(self):
        self.api_key = secrets.token_urlsafe(32)
    
    @property
    def full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username

    def __repr__(self):
        return f'<User {self.username}>'

    # Relacionamento com arquivos de wallet
    wallet_files = relationship("WalletFile", back_populates="user")
    
    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
            'phone': self.phone,
            'country': self.country,
            'city': self.city,
            'address': self.address,
            'document_type': self.document_type,
            'is_active': self.is_active,
            'is_verified': self.is_verified,
            'two_factor_enabled': self.two_factor_enabled,
            'api_key': self.api_key,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        if include_sensitive:
            data.update({
                'document_number': self.document_number,
                'api_key': self.api_key
            })
        
        return data
