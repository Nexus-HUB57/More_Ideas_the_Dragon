"""
Configurações do Sistema de Carteira Digital Bitcoin
"""
import os

class Config:
    """Configurações base do sistema"""
    
    # Configurações de segurança
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    MASTER_PASSPHRASE = '${CAISK_PASSPHRASE}'
    
    # Configurações do MongoDB
    MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://localhost:27017/'
    MONGODB_DB_NAME = 'bitcoin_wallet'
    
    # Configurações do Redis
    REDIS_HOST = os.environ.get('REDIS_HOST') or 'localhost'
    REDIS_PORT = int(os.environ.get('REDIS_PORT') or 6379)
    REDIS_DB = int(os.environ.get('REDIS_DB') or 0)
    
    # Configurações da API Bitcoin
    BITCOIN_NETWORK = 'mainnet'  # SEMPRE mainnet - Protocolo TSRA
    
    # APIs de Blockchain (para consultas e broadcast)
    BLOCKCHAIN_APIS = [
        'https://blockstream.info/api',
        'https://mempool.space/api',
        'https://blockchain.info'
    ]
    
    # Configurações de transação
    DEFAULT_FEE_RATE = 10  # satoshis por byte
    
    # Diretório para arquivos temporários
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    ALLOWED_EXTENSIONS = {'txt', 'dat', 'core', 'wallet', 'backup'}
    
    # Configurações de logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    
    @staticmethod
    def init_app(app):
        """Inicializa a aplicação com as configurações"""
        # Cria diretório de uploads se não existir
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)


class DevelopmentConfig(Config):
    """Configurações para ambiente de desenvolvimento"""
    DEBUG = True


class ProductionConfig(Config):
    """Configurações para ambiente de produção"""
    DEBUG = False
    
    @classmethod
    def init_app(cls, app):
        Config.init_app(app)


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
