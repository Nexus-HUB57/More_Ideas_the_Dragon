import unittest
from baitcoin.core.blockchain import Blockchain
from baitcoin.explorer.explorer import BaitcoinExplorer
from baitcoin.api.rest_api import BaitcoinRestAPI

class TestBaitcoinAPI(unittest.TestCase):
    def test_rest_api_endpoints(self):
        bc = Blockchain()
        explorer = BaitcoinExplorer(bc)
        api = BaitcoinRestAPI(explorer)

        # Test status endpoint
        res = api.handle_request("/api/v1/status", "agent_client_001")
        self.assertEqual(res["status"], 200)
        self.assertEqual(res["data"]["chain_height"], 0)

        # Test block height endpoint
        res_block = api.handle_request("/api/v1/block/height", "agent_client_001", {"height": 0})
        self.assertEqual(res_block["status"], 200)
        self.assertEqual(res_block["data"]["index"], 0)

        # Test rate limiting
        for _ in range(120):
            api.handle_request("/api/v1/status", "spammer_agent")
        res_limited = api.handle_request("/api/v1/status", "spammer_agent")
        self.assertEqual(res_limited["status"], 429)

if __name__ == "__main__":
    unittest.main()
