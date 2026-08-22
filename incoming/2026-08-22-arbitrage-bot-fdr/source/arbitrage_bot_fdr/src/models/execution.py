"""
Módulo de Execução de Arbitragem
Responsável por executar as operações de compra e venda nas exchanges
"""

import time
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from src.models.database import db
from src.models.fdr import FDRManager
from src.models.arbitrage import ArbitrageOpportunity

@dataclass
class TradeOrder:
    """Estrutura de dados para ordens de trading"""
    exchange: str
    symbol: str
    side: str  # 'buy' or 'sell'
    amount: float
    price: float
    order_id: str
    status: str  # 'pending', 'filled', 'cancelled', 'failed'
    timestamp: datetime

class ArbitrageExecution(db.Model):
    """Modelo de banco de dados para execuções de arbitragem"""
    __tablename__ = 'arbitrage_executions'
    
    id = db.Column(db.Integer, primary_key=True)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('arbitrage_opportunities.id'), nullable=False)
    buy_order_id = db.Column(db.String(100))
    sell_order_id = db.Column(db.String(100))
    amount_btc = db.Column(db.Float, nullable=False)
    buy_price = db.Column(db.Float, nullable=False)
    sell_price = db.Column(db.Float, nullable=False)
    expected_profit = db.Column(db.Float, nullable=False)
    actual_profit = db.Column(db.Float)
    status = db.Column(db.String(20), default='initiated')  # 'initiated', 'executing', 'completed', 'failed', 'partial'
    error_message = db.Column(db.Text)
    started_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    completed_at = db.Column(db.DateTime)
    
    # Relacionamento
    opportunity = db.relationship('ArbitrageOpportunity', backref='executions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'opportunity_id': self.opportunity_id,
            'buy_order_id': self.buy_order_id,
            'sell_order_id': self.sell_order_id,
            'amount_btc': self.amount_btc,
            'buy_price': self.buy_price,
            'sell_price': self.sell_price,
            'expected_profit': self.expected_profit,
            'actual_profit': self.actual_profit,
            'status': self.status,
            'error_message': self.error_message,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class MockExchangeAPI:
    """API mock para simular operações de exchange"""
    
    def __init__(self, exchange_name: str):
        self.exchange_name = exchange_name
        self.orders = {}
        self.balance_btc = 0.0
        self.balance_usd = 10000.0  # $10,000 inicial
        self.trading_fee = 0.001  # 0.1%
        
    def place_buy_order(self, symbol: str, amount: float, price: float) -> Dict:
        """Simula uma ordem de compra"""
        try:
            order_id = f"{self.exchange_name}_{int(time.time())}_{len(self.orders)}"
            cost = amount * price
            fee = cost * self.trading_fee
            total_cost = cost + fee
            
            if self.balance_usd < total_cost:
                return {
                    'success': False,
                    'error': 'Saldo insuficiente em USD',
                    'required': total_cost,
                    'available': self.balance_usd
                }
            
            # Simular execução (90% de chance de sucesso)
            import random
            if random.random() < 0.9:
                self.balance_usd -= total_cost
                self.balance_btc += amount
                status = 'filled'
            else:
                status = 'failed'
            
            order = {
                'order_id': order_id,
                'exchange': self.exchange_name,
                'symbol': symbol,
                'side': 'buy',
                'amount': amount,
                'price': price,
                'fee': fee,
                'status': status,
                'timestamp': datetime.now()
            }
            
            self.orders[order_id] = order
            
            return {
                'success': status == 'filled',
                'order': order
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def place_sell_order(self, symbol: str, amount: float, price: float) -> Dict:
        """Simula uma ordem de venda"""
        try:
            order_id = f"{self.exchange_name}_{int(time.time())}_{len(self.orders)}"
            
            if self.balance_btc < amount:
                return {
                    'success': False,
                    'error': 'Saldo insuficiente em BTC',
                    'required': amount,
                    'available': self.balance_btc
                }
            
            # Simular execução (90% de chance de sucesso)
            import random
            if random.random() < 0.9:
                revenue = amount * price
                fee = revenue * self.trading_fee
                net_revenue = revenue - fee
                
                self.balance_btc -= amount
                self.balance_usd += net_revenue
                status = 'filled'
            else:
                status = 'failed'
            
            order = {
                'order_id': order_id,
                'exchange': self.exchange_name,
                'symbol': symbol,
                'side': 'sell',
                'amount': amount,
                'price': price,
                'fee': fee if status == 'filled' else 0,
                'status': status,
                'timestamp': datetime.now()
            }
            
            self.orders[order_id] = order
            
            return {
                'success': status == 'filled',
                'order': order
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_order_status(self, order_id: str) -> Optional[Dict]:
        """Retorna o status de uma ordem"""
        return self.orders.get(order_id)
    
    def get_balance(self) -> Dict:
        """Retorna saldos da exchange"""
        return {
            'btc': self.balance_btc,
            'usd': self.balance_usd
        }

class ArbitrageExecutor:
    """Executor principal de operações de arbitragem"""
    
    def __init__(self):
        self.fdr_manager = FDRManager()
        self.exchanges = {
            'binance': MockExchangeAPI('binance'),
            'coinbase': MockExchangeAPI('coinbase'),
            'kraken': MockExchangeAPI('kraken')
        }
        self.max_execution_time = 300  # 5 minutos máximo por execução
        self.min_profit_threshold = 10.0  # Mínimo $10 de lucro
        
    def execute_arbitrage(self, opportunity_id: int, amount_btc: float) -> Dict:
        """Executa uma operação de arbitragem"""
        try:
            # Buscar oportunidade
            opportunity = ArbitrageOpportunity.query.get(opportunity_id)
            if not opportunity:
                return {
                    'success': False,
                    'error': 'Oportunidade não encontrada'
                }
            
            # Verificar se ainda é viável
            if opportunity.status != 'detected':
                return {
                    'success': False,
                    'error': f'Oportunidade já está em status: {opportunity.status}'
                }
            
            # Verificar lucro mínimo
            expected_profit = opportunity.profit_usd * (amount_btc / opportunity.volume_btc)
            if expected_profit < self.min_profit_threshold:
                return {
                    'success': False,
                    'error': f'Lucro esperado muito baixo: ${expected_profit:.2f}'
                }
            
            # Solicitar fundos do FDR
            fdr_txid = self.fdr_manager.request_funds_for_arbitrage(
                amount_btc, 
                opportunity.buy_exchange
            )
            
            if not fdr_txid:
                return {
                    'success': False,
                    'error': 'Não foi possível obter fundos do FDR'
                }
            
            # Criar registro de execução
            execution = ArbitrageExecution(
                opportunity_id=opportunity_id,
                amount_btc=amount_btc,
                buy_price=opportunity.buy_price,
                sell_price=opportunity.sell_price,
                expected_profit=expected_profit,
                status='initiated'
            )
            
            db.session.add(execution)
            db.session.commit()
            
            # Atualizar status da oportunidade
            opportunity.status = 'executing'
            opportunity.executed_at = db.func.current_timestamp()
            db.session.commit()
            
            # Executar as ordens
            result = self._execute_orders(execution, opportunity, amount_btc)
            
            return result
            
        except Exception as e:
            print(f"Erro na execução de arbitragem: {e}")
            db.session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
    
    def _execute_orders(self, execution: ArbitrageExecution, 
                       opportunity: ArbitrageOpportunity, amount_btc: float) -> Dict:
        """Executa as ordens de compra e venda"""
        try:
            buy_exchange = self.exchanges.get(opportunity.buy_exchange)
            sell_exchange = self.exchanges.get(opportunity.sell_exchange)
            
            if not buy_exchange or not sell_exchange:
                execution.status = 'failed'
                execution.error_message = 'Exchange não disponível'
                db.session.commit()
                return {
                    'success': False,
                    'error': 'Exchange não disponível'
                }
            
            execution.status = 'executing'
            db.session.commit()
            
            # Passo 1: Ordem de compra
            print(f"Executando compra de {amount_btc} BTC em {opportunity.buy_exchange} por ${opportunity.buy_price}")
            
            buy_result = buy_exchange.place_buy_order(
                'BTC/USD', 
                amount_btc, 
                opportunity.buy_price
            )
            
            if not buy_result['success']:
                execution.status = 'failed'
                execution.error_message = f"Falha na compra: {buy_result.get('error', 'Erro desconhecido')}"
                db.session.commit()
                return {
                    'success': False,
                    'error': execution.error_message
                }
            
            execution.buy_order_id = buy_result['order']['order_id']
            db.session.commit()
            
            # Passo 2: Ordem de venda (simultânea)
            print(f"Executando venda de {amount_btc} BTC em {opportunity.sell_exchange} por ${opportunity.sell_price}")
            
            sell_result = sell_exchange.place_sell_order(
                'BTC/USD', 
                amount_btc, 
                opportunity.sell_price
            )
            
            if not sell_result['success']:
                execution.status = 'partial'
                execution.error_message = f"Falha na venda: {sell_result.get('error', 'Erro desconhecido')}"
                db.session.commit()
                
                # TODO: Implementar lógica de reversão da compra
                return {
                    'success': False,
                    'error': execution.error_message,
                    'partial': True,
                    'buy_order': buy_result['order']
                }
            
            execution.sell_order_id = sell_result['order']['order_id']
            
            # Calcular lucro real
            buy_cost = amount_btc * opportunity.buy_price + buy_result['order']['fee']
            sell_revenue = amount_btc * opportunity.sell_price - sell_result['order']['fee']
            actual_profit = sell_revenue - buy_cost
            
            execution.actual_profit = actual_profit
            execution.status = 'completed'
            execution.completed_at = db.func.current_timestamp()
            
            # Atualizar status da oportunidade
            opportunity.status = 'completed'
            
            db.session.commit()
            
            # Retornar lucros ao FDR
            self.fdr_manager.receive_arbitrage_profits(actual_profit / opportunity.sell_price, opportunity.sell_exchange)
            
            result = {
                'success': True,
                'execution_id': execution.id,
                'amount_btc': amount_btc,
                'expected_profit': execution.expected_profit,
                'actual_profit': actual_profit,
                'buy_order': buy_result['order'],
                'sell_order': sell_result['order'],
                'profit_percentage': (actual_profit / buy_cost) * 100
            }
            
            print(f"Arbitragem concluída com sucesso! Lucro: ${actual_profit:.2f}")
            
            return result
            
        except Exception as e:
            execution.status = 'failed'
            execution.error_message = str(e)
            db.session.commit()
            
            print(f"Erro na execução das ordens: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_execution_status(self, execution_id: int) -> Optional[Dict]:
        """Retorna o status de uma execução"""
        try:
            execution = ArbitrageExecution.query.get(execution_id)
            if execution:
                return execution.to_dict()
            return None
            
        except Exception as e:
            print(f"Erro ao buscar status de execução: {e}")
            return None
    
    def get_recent_executions(self, limit: int = 20) -> List[Dict]:
        """Retorna execuções recentes"""
        try:
            executions = ArbitrageExecution.query.order_by(
                ArbitrageExecution.started_at.desc()
            ).limit(limit).all()
            
            return [exec.to_dict() for exec in executions]
            
        except Exception as e:
            print(f"Erro ao buscar execuções recentes: {e}")
            return []
    
    def get_performance_stats(self) -> Dict:
        """Retorna estatísticas de performance"""
        try:
            total_executions = ArbitrageExecution.query.count()
            successful_executions = ArbitrageExecution.query.filter_by(status='completed').count()
            failed_executions = ArbitrageExecution.query.filter_by(status='failed').count()
            
            total_profit = db.session.query(
                db.func.sum(ArbitrageExecution.actual_profit)
            ).filter(ArbitrageExecution.status == 'completed').scalar() or 0
            
            avg_profit = db.session.query(
                db.func.avg(ArbitrageExecution.actual_profit)
            ).filter(ArbitrageExecution.status == 'completed').scalar() or 0
            
            success_rate = (successful_executions / total_executions * 100) if total_executions > 0 else 0
            
            return {
                'total_executions': total_executions,
                'successful_executions': successful_executions,
                'failed_executions': failed_executions,
                'success_rate_percentage': success_rate,
                'total_profit_usd': total_profit,
                'average_profit_usd': avg_profit,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Erro ao calcular estatísticas: {e}")
            return {}
    
    def auto_execute_best_opportunity(self, max_amount_btc: float = 0.1) -> Dict:
        """Executa automaticamente a melhor oportunidade disponível"""
        try:
            # Buscar a melhor oportunidade não executada
            best_opportunity = ArbitrageOpportunity.query.filter_by(
                status='detected'
            ).order_by(ArbitrageOpportunity.profit_percentage.desc()).first()
            
            if not best_opportunity:
                return {
                    'success': False,
                    'error': 'Nenhuma oportunidade disponível'
                }
            
            # Determinar quantidade a executar
            amount_to_execute = min(max_amount_btc, best_opportunity.volume_btc)
            
            # Executar
            result = self.execute_arbitrage(best_opportunity.id, amount_to_execute)
            
            return result
            
        except Exception as e:
            print(f"Erro na execução automática: {e}")
            return {
                'success': False,
                'error': str(e)
            }

