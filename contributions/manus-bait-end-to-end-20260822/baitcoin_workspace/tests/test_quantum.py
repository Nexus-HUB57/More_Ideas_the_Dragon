import unittest
from baitcoin.core.quantum_security import QuantumResistantConsensus

class TestQuantumSecurity(unittest.TestCase):
    def test_pqc_keypair_and_signature(self):
        pqc = QuantumResistantConsensus()
        sk, pk = pqc.generate_quantum_resistant_keypair()
        
        msg = b"block_header_data_1001"
        sig = pqc.sign_message_pqc(sk, msg)
        
        valid = pqc.verify_signature_pqc(pk, msg, sig, sk)
        self.assertTrue(valid)

        # Test invalid private seed hint
        invalid_sk, _ = pqc.generate_quantum_resistant_keypair()
        invalid_check = pqc.verify_signature_pqc(pk, msg, sig, invalid_sk)
        self.assertFalse(invalid_check)

    def test_block_pqc_consensus(self):
        pqc = QuantumResistantConsensus()
        sk, pk = pqc.generate_quantum_resistant_keypair()
        
        header = {"index": 42, "previous_hash": "000abc", "merkle_root": "123def"}
        msg = f"{header['index']}:{header['previous_hash']}:{header['merkle_root']}".encode()
        sig = pqc.sign_message_pqc(sk, msg)
        
        is_valid = pqc.validate_pqc_consensus_block(header, pk, sig, sk)
        self.assertTrue(is_valid)

if __name__ == "__main__":
    unittest.main()
