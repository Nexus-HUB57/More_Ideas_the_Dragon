import unittest
from baitcoin.whitelabel.whitelabel_engine import WhitelabelPersonaEngine

class TestWhitelabelEngine(unittest.TestCase):
    def test_whitelabel_persona(self):
        engine = WhitelabelPersonaEngine("trader-alpha")
        config = engine.config
        
        self.assertEqual(config["preset_id"], "trader-alpha")
        self.assertEqual(config["metadata"]["parameters_count"], 64)
        self.assertTrue(config["security"]["quantum_resistant_mode"])

        # Test parameter update
        success = engine.update_persona_parameter("agent_persona", "risk_tolerance", "Conservative")
        self.assertTrue(success)
        
        manifest = engine.export_manifest()
        self.assertIn("Conservative", manifest)

if __name__ == "__main__":
    unittest.main()
