import unittest
from baitcoin.core.blockchain import Blockchain
from baitcoin.explorer.explorer import BaitcoinExplorer

class TestBaitcoinExplorer(unittest.TestCase):
    def test_explorer_indexing(self):
        bc = Blockchain()
        bc.add_block([{"sender": "agent_a", "recipient": "agent_b", "amount": 100, "signature": "sig123"}] )
        
        explorer = BaitcoinExplorer(bc)
        
        # Test get block by height
        genesis = explorer.get_block_by_height(0)
        self.assertIsNotNone(genesis)
        self.assertEqual(genesis["index"], 0)

        # Test stats
        stats = explorer.get_network_stats()
        self.assertEqual(stats["chain_height"], 1)
        self.assertTrue(stats["is_valid"])

        # Test unified search
        search_res = explorer.search("0")
        self.assertEqual(search_res["type"], "block")

if __name__ == "__main__":
    unittest.main()
