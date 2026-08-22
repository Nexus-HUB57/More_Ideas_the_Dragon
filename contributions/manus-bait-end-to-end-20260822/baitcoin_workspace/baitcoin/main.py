import sys
import os
import json
import logging

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.blockchain import Blockchain
from wallet.wallet import Wallet
from token_module.token import Tokenomics
from bank.bank import BainkrBank
from ai.agent import AIAgentProtocol
from explorer.explorer import BaitcoinExplorer
from api.rest_api import BaitcoinRestAPI
from memory.wal import MemoryWAL
from obscura.obscura_bridge import ObscuraHeadlessBridge
from whitelabel.whitelabel_engine import WhitelabelPersonaEngine
from faucet.faucet import Faucet
from sdk.sdk import BaitcoinSDK, CrossChainBridge, MainnetLauncher
from store.ai_store import AIStoreMarketplace
from core.quantum_security import QuantumResistantConsensus

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [BAITCOIN-MAINNET] - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BaitcoinEcosystemOrchestrator:
    def __init__(self):
        logger.info("Inicializando o Ecossistema b'AI'tcoin Mainnet...")
        self.blockchain = Blockchain()
        self.pqc = QuantumResistantConsensus()
        self.wallet = Wallet()
        self.tokenomics = Tokenomics()
        self.bank = BainkrBank()
        self.agent = AIAgentProtocol("ChimeraMainnetAgent-01", ["trading", "oracle", "validation"])
        self.explorer = BaitcoinExplorer(self.blockchain)
        self.api = BaitcoinRestAPI(self.explorer)
        self.wal = MemoryWAL()
        self.obscura = ObscuraHeadlessBridge()
        self.whitelabel = WhitelabelPersonaEngine("chimera-quantum")
        self.faucet = Faucet()
        self.sdk = BaitcoinSDK()
        self.bridge = CrossChainBridge()
        self.launcher = MainnetLauncher()
        self.store = AIStoreMarketplace()
        logger.info("Todos os 14 módulos core inicializados com sucesso!")

    def get_system_status(self) -> dict:
        return {
            "mainnet_health": self.launcher.health_check(),
            "blockchain_height": self.blockchain.get_latest_block().index,
            "chain_valid": self.blockchain.is_chain_valid(),
            "agent_status": {
                "id": self.agent.agent_id,
                "tier": self.agent.tier,
                "reputation": self.agent.reputation_score
            },
            "store_products": len(self.store.list_products()),
            "pqc_status": "Active (HMAC-SHA3-512)"
        }
