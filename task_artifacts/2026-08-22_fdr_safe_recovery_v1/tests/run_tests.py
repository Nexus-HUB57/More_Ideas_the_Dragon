import unittest

from src.fdr_security import FDRVault


class FDRSecurityTests(unittest.TestCase):
    def test_encrypt_decrypt_round_trip(self):
        vault = FDRVault("test-only-password")
        record = {"kind": "placeholder", "value": "not-a-secret"}
        envelope = vault.encrypt_record(record)
        self.assertEqual(vault.decrypt_record(envelope), record)
        self.assertEqual(envelope["format"], "fdr-v1")

    def test_wrong_password_fails(self):
        envelope = FDRVault("correct-password").encrypt_record({"x": 1})
        with self.assertRaises(Exception):
            FDRVault("wrong-password").decrypt_record(envelope)

    def test_random_nonce_and_salt(self):
        first = FDRVault("same-password").encrypt_record({"x": 1})
        second = FDRVault("same-password").encrypt_record({"x": 1})
        self.assertNotEqual(first["salt"], second["salt"])
        self.assertNotEqual(first["nonce"], second["nonce"])


if __name__ == "__main__":
    unittest.main()
