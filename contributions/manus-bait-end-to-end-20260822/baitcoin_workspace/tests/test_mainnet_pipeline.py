import unittest
from baitcoin.mainnet_pipeline import MainnetOrchestratorPipeline

class TestMainnetPipeline(unittest.TestCase):
    def test_pipeline_execution(self):
        pipeline = MainnetOrchestratorPipeline("/home/ubuntu/baitcoin_workspace/test_data")
        wallet = pipeline.generate_exclusive_wallet("test_operator")
        self.assertTrue(wallet["address"].startswith("bait"))
        
        agent = pipeline.synthesize_and_register_agent("market-maker", ["spread-capture"])
        self.assertEqual(agent["archetype"], "market-maker")
        self.assertIn("spread-capture", agent["capabilities"])

if __name__ == "__main__":
    unittest.main()
