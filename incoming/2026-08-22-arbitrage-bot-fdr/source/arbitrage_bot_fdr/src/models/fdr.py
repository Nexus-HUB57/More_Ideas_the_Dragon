"""
Fundo Descentralizado de Reserva (FDR) - Modelo Principal
Responsável pelo gerenciamento seguro de fundos Bitcoin para operações de arbitragem
"""

import json
import hashlib
import time
from typing import Dict, List, Optional, Tuple
from bitcoinlib.wallets import Wallet
from bitcoinlib.keys import HDKey
from bitcoinlib.transactions import Transaction
import requests
from src.models.database import db

class FDRWallet(db.Model):
    """Modelo de banco de dados para carteiras do FDR"""
    __tablename__ = 'fdr_wallets'
    
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(64), unique=True, nullable=False)
    wallet_type = db.Column(db.String(20), nullable=False)  # 'cold', 'hot', 'multisig'
    balance_btc = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'address': self.address,
            'wallet_type': self.wallet_type,
            'balance_btc': self.balance_btc,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'is_active': self.is_active
        }

class FDRTransaction(db.Model):
    """Modelo de banco de dados para transações do FDR"""
    __tablename__ = 'fdr_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    txid = db.Column(db.String(64), unique=True, nullable=False)
    from_address = db.Column(db.String(64), nullable=False)
    to_address = db.Column(db.String(64), nullable=False)
    amount_btc = db.Column(db.Float, nullable=False)
    fee_btc = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # 'deposit', 'withdrawal', 'arbitrage'
    status = db.Column(db.String(20), default='pending')  # 'pending', 'confirmed', 'failed'
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    confirmed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'txid': self.txid,
            'from_address': self.from_address,
            'to_address': self.to_address,
            'amount_btc': self.amount_btc,
            'fee_btc': self.fee_btc,
            'transaction_type': self.transaction_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None
        }

class FDRManager:
    """Gerenciador principal do Fundo Descentralizado de Reserva"""
    
    def __init__(self):
        self.cold_storage_threshold = 0.8  # 80% dos fundos em cold storage
        self.hot_wallet_max = 0.1  # Máximo 10% em hot wallets
        self.multisig_threshold = 2  # 2 de 3 assinaturas necessárias
        
    def get_total_balance(self) -> float:
        """Retorna o saldo total do FDR em BTC"""
        try:
            total = db.session.query(db.func.sum(FDRWallet.balance_btc)).filter(
                FDRWallet.is_active == True
            ).scalar()
            return total or 0.0
        except Exception as e:
            print(f"Erro ao calcular saldo total: {e}")
            return 0.0
    
    def get_balance_by_type(self, wallet_type: str) -> float:
        """Retorna o saldo por tipo de carteira"""
        try:
            total = db.session.query(db.func.sum(FDRWallet.balance_btc)).filter(
                FDRWallet.wallet_type == wallet_type,
                FDRWallet.is_active == True
            ).scalar()
            return total or 0.0
        except Exception as e:
            print(f"Erro ao calcular saldo por tipo {wallet_type}: {e}")
            return 0.0
    
    def get_available_hot_balance(self) -> float:
        """Retorna o saldo disponível em hot wallets para arbitragem"""
        return self.get_balance_by_type('hot')
    
    def get_cold_storage_balance(self) -> float:
        """Retorna o saldo em cold storage"""
        return self.get_balance_by_type('cold')
    
    def update_wallet_balance(self, address: str) -> bool:
        """Atualiza o saldo de uma carteira específica via API blockchain"""
        try:
            # Usar API Blockchain.info para consultar saldo
            url = f"https://blockchain.info/balance?active={address}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if address in data:
                balance_satoshis = data[address].get("final_balance", 0)
                balance_btc = balance_satoshis / 100_000_000.0
                
                # Atualizar no banco de dados
                wallet = FDRWallet.query.filter_by(address=address).first()
                if wallet:
                    wallet.balance_btc = balance_btc
                    wallet.last_updated = db.func.current_timestamp()
                    db.session.commit()
                    return True
                    
        except Exception as e:
            print(f"Erro ao atualizar saldo da carteira {address}: {e}")
            
        return False
    
    def update_all_balances(self) -> Dict[str, float]:
        """Atualiza todos os saldos das carteiras do FDR"""
        wallets = FDRWallet.query.filter_by(is_active=True).all()
        updated_balances = {}
        
        for wallet in wallets:
            if self.update_wallet_balance(wallet.address):
                updated_balances[wallet.address] = wallet.balance_btc
                
        return updated_balances
    
    def add_wallet(self, address: str, wallet_type: str) -> bool:
        """Adiciona uma nova carteira ao FDR"""
        try:
            # Verificar se a carteira já existe
            existing = FDRWallet.query.filter_by(address=address).first()
            if existing:
                return False
                
            # Criar nova carteira
            new_wallet = FDRWallet(
                address=address,
                wallet_type=wallet_type,
                balance_btc=0.0
            )
            
            db.session.add(new_wallet)
            db.session.commit()
            
            # Atualizar saldo inicial
            self.update_wallet_balance(address)
            
            return True
            
        except Exception as e:
            print(f"Erro ao adicionar carteira {address}: {e}")
            db.session.rollback()
            return False
    
    def request_funds_for_arbitrage(self, amount_btc: float, exchange_address: str) -> Optional[str]:
        """Solicita fundos do FDR para operação de arbitragem"""
        try:
            available_hot = self.get_available_hot_balance()
            
            if available_hot < amount_btc:
                # Verificar se é necessário transferir de cold storage
                cold_balance = self.get_cold_storage_balance()
                if cold_balance >= amount_btc:
                    print(f"Fundos insuficientes em hot wallet. Necessário transferir {amount_btc} BTC de cold storage.")
                    return None
                else:
                    print(f"Fundos insuficientes no FDR. Solicitado: {amount_btc} BTC, Disponível: {available_hot + cold_balance} BTC")
                    return None
            
            # Simular criação de transação (em produção, usaria PSBT)
            txid = self._create_mock_transaction(amount_btc, exchange_address, 'arbitrage')
            
            return txid
            
        except Exception as e:
            print(f"Erro ao solicitar fundos para arbitragem: {e}")
            return None
    
    def receive_arbitrage_profits(self, amount_btc: float, from_address: str) -> bool:
        """Recebe lucros de arbitragem de volta ao FDR"""
        try:
            # Registrar transação de recebimento
            txid = self._create_mock_transaction(amount_btc, from_address, 'deposit')
            
            if txid:
                print(f"Lucros de arbitragem recebidos: {amount_btc} BTC (TXID: {txid})")
                return True
                
        except Exception as e:
            print(f"Erro ao receber lucros de arbitragem: {e}")
            
        return False
    
    def _create_mock_transaction(self, amount_btc: float, address: str, tx_type: str) -> Optional[str]:
        """Cria uma transação mock para simulação (em produção, usaria PSBT real)"""
        try:
            # Gerar TXID mock
            timestamp = str(int(time.time()))
            data = f"{amount_btc}{address}{tx_type}{timestamp}"
            txid = hashlib.sha256(data.encode()).hexdigest()
            
            # Registrar no banco de dados
            transaction = FDRTransaction(
                txid=txid,
                from_address="FDR_INTERNAL" if tx_type == 'arbitrage' else address,
                to_address=address if tx_type == 'arbitrage' else "FDR_INTERNAL",
                amount_btc=amount_btc,
                fee_btc=0.0001,  # Taxa mock
                transaction_type=tx_type,
                status='pending'
            )
            
            db.session.add(transaction)
            db.session.commit()
            
            return txid
            
        except Exception as e:
            print(f"Erro ao criar transação mock: {e}")
            db.session.rollback()
            return None
    
    def get_transaction_history(self, limit: int = 50) -> List[Dict]:
        """Retorna o histórico de transações do FDR"""
        try:
            transactions = FDRTransaction.query.order_by(
                FDRTransaction.created_at.desc()
            ).limit(limit).all()
            
            return [tx.to_dict() for tx in transactions]
            
        except Exception as e:
            print(f"Erro ao buscar histórico de transações: {e}")
            return []
    
    def get_fdr_status(self) -> Dict:
        """Retorna o status completo do FDR"""
        try:
            total_balance = self.get_total_balance()
            cold_balance = self.get_cold_storage_balance()
            hot_balance = self.get_available_hot_balance()
            multisig_balance = self.get_balance_by_type('multisig')
            
            return {
                'total_balance_btc': total_balance,
                'cold_storage_btc': cold_balance,
                'hot_wallet_btc': hot_balance,
                'multisig_btc': multisig_balance,
                'cold_storage_percentage': (cold_balance / total_balance * 100) if total_balance > 0 else 0,
                'hot_wallet_percentage': (hot_balance / total_balance * 100) if total_balance > 0 else 0,
                'total_wallets': FDRWallet.query.filter_by(is_active=True).count(),
                'last_updated': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
        except Exception as e:
            print(f"Erro ao obter status do FDR: {e}")
            return {}
    
    def validate_security_thresholds(self) -> Dict[str, bool]:
        """Valida se os limites de segurança estão sendo respeitados"""
        try:
            total_balance = self.get_total_balance()
            if total_balance == 0:
                return {'valid': True, 'warnings': []}
            
            cold_percentage = self.get_cold_storage_balance() / total_balance
            hot_percentage = self.get_available_hot_balance() / total_balance
            
            warnings = []
            valid = True
            
            if cold_percentage < self.cold_storage_threshold:
                warnings.append(f"Cold storage abaixo do limite ({cold_percentage:.1%} < {self.cold_storage_threshold:.1%})")
                valid = False
                
            if hot_percentage > self.hot_wallet_max:
                warnings.append(f"Hot wallet acima do limite ({hot_percentage:.1%} > {self.hot_wallet_max:.1%})")
                valid = False
            
            return {
                'valid': valid,
                'warnings': warnings,
                'cold_percentage': cold_percentage,
                'hot_percentage': hot_percentage
            }
            
        except Exception as e:
            print(f"Erro ao validar limites de segurança: {e}")
            return {'valid': False, 'warnings': ['Erro na validação']}

