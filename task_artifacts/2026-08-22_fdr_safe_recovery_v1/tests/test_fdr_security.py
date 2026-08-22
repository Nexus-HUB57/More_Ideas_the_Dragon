import pytest

from src.fdr_security import FDRVault


def test_encrypt_decrypt_round_trip():
    vault = FDRVault("test-only-password")
    record = {"kind": "placeholder", "value": "not-a-secret"}
    envelope = vault.encrypt_record(record)
    assert vault.decrypt_record(envelope) == record
    assert envelope["format"] == "fdr-v1"


def test_wrong_password_fails():
    envelope = FDRVault("correct-password").encrypt_record({"x": 1})
    with pytest.raises(Exception):
        FDRVault("wrong-password").decrypt_record(envelope)


def test_random_nonce_and_salt():
    first = FDRVault("same-password").encrypt_record({"x": 1})
    second = FDRVault("same-password").encrypt_record({"x": 1})
    assert first["salt"] != second["salt"]
    assert first["nonce"] != second["nonce"]
