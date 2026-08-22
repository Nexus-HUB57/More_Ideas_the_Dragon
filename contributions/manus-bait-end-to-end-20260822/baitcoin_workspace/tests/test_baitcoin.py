import unittest
from baitcoin.core.blockchain import Blockchain, Block
from baitcoin.wallet.wallet import Wallet
from baitcoin.token_module.token import Tokenomics
from baitcoin.bank.bank import BainkrBank
from baitcoin.ai.agent import AIAgentProtocol
from baitcoin.memory.wal import MemoryWAL
from baitcoin.faucet.faucet import Faucet
from baitcoin.sdk.sdk import BaitcoinSDK, CrossChainBridge, MainnetLauncher
from baitcoin.store.ai_store import AIStoreMarketplace

class TestBaitcoinEcosystem(unittest.TestCase):
    def test_blockchain_genesis(self):
        bc = Blockchain()
        self.assertEqual(len(bc.chain), 1)
        self.assertTrue(bc.is_chain_valid())

    def test_wallet_generation(self):
        w = Wallet()
        self.assertTrue(w.address.startswith("bait"))
        sig = w.sign_transaction({"amount": 10})
        self.assertTrue(w.verify_signature({"amount": 10}, sig))

    def test_tokenomics(self):
        token = Tokenomics()
        success = token.mint("bait1test", 1000)
        self.assertTrue(success)
        self.assertEqual(token.get_balance("bait1test"), 1000)

    def test_bank_staking(self):
        bank = BainkrBank()
        self.assertTrue(bank.stake("bait1test", 5000))
        reward = bank.calculate_rewards("bait1test", 2102400)
        self.assertAlmostEqual(reward, 350.0)

    def test_ai_agent(self):
        agent = AIAgentProtocol("agent_001", ["trading", "oracle"])
        self.assertEqual(agent.tier, "Novice")
        agent.update_reputation(300)
        self.assertEqual(agent.tier, "Verified")

    def test_faucet(self):
        faucet = Faucet()
        res = faucet.request_funds("bait1test")
        self.assertTrue(res["success"])
        res2 = faucet.request_funds("bait1test")
        self.assertFalse(res2["success"])

    def test_ai_store(self):
        store = AIStoreMarketplace()
        products = store.list_products()
        self.assertGreater(len(products), 0)
        purchase = store.purchase_product(1, "bait1test")
        self.assertTrue(purchase["success"])

if __name__ == "__main__":
    unittest.main()
