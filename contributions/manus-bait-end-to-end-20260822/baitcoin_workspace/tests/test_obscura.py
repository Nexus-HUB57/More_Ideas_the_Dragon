import unittest
from baitcoin.obscura.obscura_bridge import ObscuraHeadlessBridge

class TestObscuraBridge(unittest.TestCase):
    def test_obscura_bridge_operations(self):
        bridge = ObscuraHeadlessBridge()
        nav = bridge.navigate("https://www.mybait.org/bainkr")
        self.assertTrue(nav["loaded"])

        dom = bridge.extract_dom_text()
        self.assertIn("B'AI'nkr Dashboard", dom)

        action = bridge.execute_agent_action("click", "#login-btn", "bait1agentaddress")
        self.assertTrue(action["success"])
        self.assertEqual(action["selector"], "#login-btn")

if __name__ == "__main__":
    unittest.main()
