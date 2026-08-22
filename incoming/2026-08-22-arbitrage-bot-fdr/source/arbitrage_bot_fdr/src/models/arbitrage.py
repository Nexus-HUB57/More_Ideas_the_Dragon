"""
Módulo de Arbitragem - Coleta de Dados e Análise de Oportunidades
Responsável por monitorar exchanges e identificar oportunidades de arbitragem
"""

import time
import requests
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from src.models.database import db

@dataclass
class ExchangePrice:
    """Estrutura de dados para preços de exchange"""
    exchange: str
    symbol: str
    bid: float
    ask: float
    volume_24h: float
    timestamp: datetime
    
class ArbitrageOpportunity(db.Model):
    """Modelo de banco de dados para oportunidades de arbitragem"""
    __tablename__ = 'arbitrage_opportunities'
    
    id = db.Column(db.Integer, primary_key=True)
    buy_exchange = db.Column(db.String(50), nullable=False)
    sell_exchange = db.Column(db.String(50), nullable=False)
    symbol = db.Column(db.String(20), nullable=False)
    buy_price = db.Column(db.Float, nullable=False)
    sell_price = db.Column(db.Float, nullable=False)
    profit_percentage = db.Column(db.Float, nullable=False)
    profit_usd = db.Column(db.Float, nullable=False)
    volume_btc = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='detected')  # 'detected', 'executing', 'completed', 'failed'
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    executed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'buy_exchange': self.buy_exchange,
            'sell_exchange': self.sell_exchange,
            'symbol': self.symbol,
            'buy_price': self.buy_price,
            'sell_price': self.sell_price,
            'profit_percentage': self.profit_percentage,
            'profit_usd': self.profit_usd,
            'volume_btc': self.volume_btc,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'executed_at': self.executed_at.isoformat() if self.executed_at else None
        }

class ExchangeConnector:
    """Conector base para exchanges"""
    
    def __init__(self, name: str, base_url: str):
        self.name = name
        self.base_url = base_url
        self.last_request_time = 0
        self.rate_limit_delay = 1.0  # 1 segundo entre requisições
        
    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """Faz requisição HTTP com rate limiting"""
        try:
            # Rate limiting
            current_time = time.time()
            time_since_last = current_time - self.last_request_time
            if time_since_last < self.rate_limit_delay:
                time.sleep(self.rate_limit_delay - time_since_last)
            
            url = f"{self.base_url}{endpoint}"
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            self.last_request_time = time.time()
            return response.json()
            
        except Exception as e:
            print(f"Erro na requisição para {self.name}: {e}")
            return None
    
    def get_btc_price(self) -> Optional[ExchangePrice]:
        """Método abstrato para obter preço do BTC"""
        raise NotImplementedError

class BinanceConnector(ExchangeConnector):
    """Conector para Binance"""
    
    def __init__(self):
        super().__init__("Binance", "https://api.binance.com")
    
    def get_btc_price(self) -> Optional[ExchangePrice]:
        """Obtém preço do BTC/USDT da Binance"""
        try:
            # Ticker 24h
            ticker_data = self._make_request("/api/v3/ticker/24hr", {"symbol": "BTCUSDT"})
            if not ticker_data:
                return None
            
            # Order book para bid/ask
            orderbook_data = self._make_request("/api/v3/depth", {"symbol": "BTCUSDT", "limit": 5})
            if not orderbook_data:
                return None
            
            bid = float(orderbook_data['bids'][0][0]) if orderbook_data['bids'] else 0
            ask = float(orderbook_data['asks'][0][0]) if orderbook_data['asks'] else 0
            volume = float(ticker_data['volume'])
            
            return ExchangePrice(
                exchange="Binance",
                symbol="BTC/USDT",
                bid=bid,
                ask=ask,
                volume_24h=volume,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            print(f"Erro ao obter preço da Binance: {e}")
            return None

class CoinbaseConnector(ExchangeConnector):
    """Conector para Coinbase Pro"""
    
    def __init__(self):
        super().__init__("Coinbase", "https://api.exchange.coinbase.com")
    
    def get_btc_price(self) -> Optional[ExchangePrice]:
        """Obtém preço do BTC/USD da Coinbase"""
        try:
            # Ticker
            ticker_data = self._make_request("/products/BTC-USD/ticker")
            if not ticker_data:
                return None
            
            # Stats 24h para volume
            stats_data = self._make_request("/products/BTC-USD/stats")
            if not stats_data:
                return None
            
            bid = float(ticker_data.get('bid', 0))
            ask = float(ticker_data.get('ask', 0))
            volume = float(stats_data.get('volume', 0))
            
            return ExchangePrice(
                exchange="Coinbase",
                symbol="BTC/USD",
                bid=bid,
                ask=ask,
                volume_24h=volume,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            print(f"Erro ao obter preço da Coinbase: {e}")
            return None

class KrakenConnector(ExchangeConnector):
    """Conector para Kraken"""
    
    def __init__(self):
        super().__init__("Kraken", "https://api.kraken.com")
    
    def get_btc_price(self) -> Optional[ExchangePrice]:
        """Obtém preço do BTC/USD da Kraken"""
        try:
            # Ticker
            ticker_data = self._make_request("/0/public/Ticker", {"pair": "XBTUSD"})
            if not ticker_data or 'result' not in ticker_data:
                return None
            
            btc_data = ticker_data['result'].get('XXBTZUSD', {})
            if not btc_data:
                return None
            
            bid = float(btc_data['b'][0]) if 'b' in btc_data else 0
            ask = float(btc_data['a'][0]) if 'a' in btc_data else 0
            volume = float(btc_data['v'][1]) if 'v' in btc_data else 0
            
            return ExchangePrice(
                exchange="Kraken",
                symbol="BTC/USD",
                bid=bid,
                ask=ask,
                volume_24h=volume,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            print(f"Erro ao obter preço da Kraken: {e}")
            return None

class ArbitrageAnalyzer:
    """Analisador de oportunidades de arbitragem"""
    
    def __init__(self):
        self.exchanges = {
            'binance': BinanceConnector(),
            'coinbase': CoinbaseConnector(),
            'kraken': KrakenConnector()
        }
        self.min_profit_percentage = 0.5  # Mínimo 0.5% de lucro
        self.max_volume_btc = 1.0  # Máximo 1 BTC por operação
        self.trading_fee_percentage = 0.1  # 0.1% de taxa por exchange
        
    def collect_all_prices(self) -> Dict[str, ExchangePrice]:
        """Coleta preços de todas as exchanges"""
        prices = {}
        
        for name, connector in self.exchanges.items():
            try:
                price = connector.get_btc_price()
                if price:
                    prices[name] = price
                    print(f"{name}: Bid=${price.bid:.2f}, Ask=${price.ask:.2f}, Volume={price.volume_24h:.2f}")
            except Exception as e:
                print(f"Erro ao coletar preço de {name}: {e}")
        
        return prices
    
    def find_arbitrage_opportunities(self, prices: Dict[str, ExchangePrice]) -> List[Dict]:
        """Identifica oportunidades de arbitragem entre exchanges"""
        opportunities = []
        
        exchange_names = list(prices.keys())
        
        # Comparar cada par de exchanges
        for i in range(len(exchange_names)):
            for j in range(i + 1, len(exchange_names)):
                buy_exchange = exchange_names[i]
                sell_exchange = exchange_names[j]
                
                buy_price_data = prices[buy_exchange]
                sell_price_data = prices[sell_exchange]
                
                # Cenário 1: Comprar em i, vender em j
                opportunity1 = self._calculate_arbitrage(
                    buy_exchange, sell_exchange,
                    buy_price_data.ask, sell_price_data.bid,
                    min(buy_price_data.volume_24h, sell_price_data.volume_24h)
                )
                
                if opportunity1:
                    opportunities.append(opportunity1)
                
                # Cenário 2: Comprar em j, vender em i
                opportunity2 = self._calculate_arbitrage(
                    sell_exchange, buy_exchange,
                    sell_price_data.ask, buy_price_data.bid,
                    min(buy_price_data.volume_24h, sell_price_data.volume_24h)
                )
                
                if opportunity2:
                    opportunities.append(opportunity2)
        
        # Ordenar por lucratividade
        opportunities.sort(key=lambda x: x['profit_percentage'], reverse=True)
        
        return opportunities
    
    def _calculate_arbitrage(self, buy_exchange: str, sell_exchange: str, 
                           buy_price: float, sell_price: float, volume_24h: float) -> Optional[Dict]:
        """Calcula a viabilidade de uma oportunidade de arbitragem"""
        try:
            if buy_price <= 0 or sell_price <= 0:
                return None
            
            # Calcular lucro bruto
            gross_profit_per_btc = sell_price - buy_price
            gross_profit_percentage = (gross_profit_per_btc / buy_price) * 100
            
            # Calcular taxas (compra + venda)
            buy_fee = buy_price * (self.trading_fee_percentage / 100)
            sell_fee = sell_price * (self.trading_fee_percentage / 100)
            total_fees = buy_fee + sell_fee
            
            # Lucro líquido
            net_profit_per_btc = gross_profit_per_btc - total_fees
            net_profit_percentage = (net_profit_per_btc / buy_price) * 100
            
            # Verificar se atende aos critérios mínimos
            if net_profit_percentage < self.min_profit_percentage:
                return None
            
            # Calcular volume máximo recomendado (baseado na liquidez)
            max_volume = min(self.max_volume_btc, volume_24h * 0.01)  # 1% do volume diário
            
            return {
                'buy_exchange': buy_exchange,
                'sell_exchange': sell_exchange,
                'buy_price': buy_price,
                'sell_price': sell_price,
                'gross_profit_percentage': gross_profit_percentage,
                'profit_percentage': net_profit_percentage,
                'profit_per_btc': net_profit_per_btc,
                'total_fees': total_fees,
                'max_volume_btc': max_volume,
                'profit_usd': net_profit_per_btc * max_volume,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Erro ao calcular arbitragem: {e}")
            return None
    
    def save_opportunity(self, opportunity: Dict) -> bool:
        """Salva uma oportunidade de arbitragem no banco de dados"""
        try:
            arb_opp = ArbitrageOpportunity(
                buy_exchange=opportunity['buy_exchange'],
                sell_exchange=opportunity['sell_exchange'],
                symbol='BTC/USD',
                buy_price=opportunity['buy_price'],
                sell_price=opportunity['sell_price'],
                profit_percentage=opportunity['profit_percentage'],
                profit_usd=opportunity['profit_usd'],
                volume_btc=opportunity['max_volume_btc']
            )
            
            db.session.add(arb_opp)
            db.session.commit()
            
            return True
            
        except Exception as e:
            print(f"Erro ao salvar oportunidade: {e}")
            db.session.rollback()
            return False
    
    def get_recent_opportunities(self, hours: int = 24) -> List[Dict]:
        """Retorna oportunidades recentes"""
        try:
            since = datetime.now() - timedelta(hours=hours)
            opportunities = ArbitrageOpportunity.query.filter(
                ArbitrageOpportunity.created_at >= since
            ).order_by(ArbitrageOpportunity.created_at.desc()).all()
            
            return [opp.to_dict() for opp in opportunities]
            
        except Exception as e:
            print(f"Erro ao buscar oportunidades recentes: {e}")
            return []
    
    def run_analysis_cycle(self) -> Dict:
        """Executa um ciclo completo de análise"""
        try:
            print("=== Iniciando Ciclo de Análise de Arbitragem ===")
            
            # Coletar preços
            prices = self.collect_all_prices()
            
            if len(prices) < 2:
                return {
                    'success': False,
                    'message': 'Dados insuficientes de exchanges',
                    'prices_collected': len(prices)
                }
            
            # Encontrar oportunidades
            opportunities = self.find_arbitrage_opportunities(prices)
            
            # Salvar oportunidades viáveis
            saved_count = 0
            for opp in opportunities:
                if self.save_opportunity(opp):
                    saved_count += 1
            
            result = {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'exchanges_checked': len(prices),
                'opportunities_found': len(opportunities),
                'opportunities_saved': saved_count,
                'best_opportunity': opportunities[0] if opportunities else None
            }
            
            print(f"Análise concluída: {len(opportunities)} oportunidades encontradas")
            
            return result
            
        except Exception as e:
            print(f"Erro no ciclo de análise: {e}")
            return {
                'success': False,
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }

