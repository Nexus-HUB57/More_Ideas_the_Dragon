from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from . import db

class WalletFile(db.Model):
    __tablename__ = 'wallet_files'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)  # .dat, .txt, .core
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    currency = Column(String(10), nullable=True)  # BTC, ETH, LTC, etc.
    wallet_address = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com usuário
    user = relationship("User", back_populates="wallet_files")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'currency': self.currency,
            'wallet_address': self.wallet_address,
            'description': self.description,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class WalletBackup(db.Model):
    __tablename__ = 'wallet_backups'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    wallet_file_id = Column(Integer, ForeignKey('wallet_files.id'), nullable=False)
    backup_name = Column(String(255), nullable=False)
    backup_path = Column(String(500), nullable=False)
    backup_size = Column(Integer, nullable=False)
    backup_hash = Column(String(64), nullable=False)  # SHA256
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    user = relationship("User")
    wallet_file = relationship("WalletFile")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'wallet_file_id': self.wallet_file_id,
            'backup_name': self.backup_name,
            'backup_size': self.backup_size,
            'backup_hash': self.backup_hash,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

