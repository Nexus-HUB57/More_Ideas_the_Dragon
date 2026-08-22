import unittest
from baitcoin.ai.gen_agent_synth import GenAgentSynthEngine

class TestGenAgentSynth(unittest.TestCase):
    def test_agent_synthesis(self):
        engine = GenAgentSynthEngine("test-namespace")
        
        # Sintetizar agente yield-optimizer com capacidade extra
        blueprint = engine.synthesize_agent("yield-optimizer", custom_capabilities=["flash-loan-check"])
        
        self.assertEqual(blueprint.archetype, "yield-optimizer")
        self.assertIn("defi-staking", blueprint.capabilities)
        self.assertIn("flash-loan-check", blueprint.capabilities)
        self.assertEqual(blueprint.pqc_algorithm, "HMAC-SHA3-512")
        self.assertTrue(len(blueprint.security_hash) > 0)
        
        # Testar manifesto exportável
        manifest_str = engine.export_blueprint_manifest(blueprint.synth_id)
        self.assertIn(blueprint.synth_id, manifest_str)
        self.assertIn("yield-optimizer", manifest_str)

    def test_invalid_archetype(self):
        engine = GenAgentSynthEngine()
        with self.assertRaises(ValueError):
            engine.synthesize_agent("non-existent-archetype")

if __name__ == "__main__":
    unittest.main()
