"""Primitives for local encryption of FDR records.

This module intentionally never stores passwords, master keys, seeds, WIFs,
or wallet databases. Secrets must be supplied by the caller at runtime.
"""
from __future__ import annotations

import base64
import json
import os
from dataclasses import dataclass
from typing import Any

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.scrypt import Scrypt


@dataclass(frozen=True)
class KdfParameters:
    n: int = 2**15
    r: int = 8
    p: int = 1
    length: int = 32


class FDRVault:
    """Encrypt and decrypt JSON-compatible records using Scrypt + AES-256-GCM."""

    FORMAT = "fdr-v1"
    SALT_BYTES = 16
    NONCE_BYTES = 12

    def __init__(self, password: str, params: KdfParameters | None = None) -> None:
        if not password:
            raise ValueError("password must not be empty")
        self.params = params or KdfParameters()
        self._password = password.encode("utf-8")

    def _derive_key(self, salt: bytes) -> bytes:
        return Scrypt(
            salt=salt,
            length=self.params.length,
            n=self.params.n,
            r=self.params.r,
            p=self.params.p,
        ).derive(self._password)

    def encrypt_record(self, record: dict[str, Any], aad: bytes = b"fdr") -> dict[str, Any]:
        salt = os.urandom(self.SALT_BYTES)
        nonce = os.urandom(self.NONCE_BYTES)
        plaintext = json.dumps(record, sort_keys=True, separators=(",", ":")).encode()
        ciphertext = AESGCM(self._derive_key(salt)).encrypt(nonce, plaintext, aad)
        return {
            "format": self.FORMAT,
            "kdf": "scrypt",
            "kdf_params": {"n": self.params.n, "r": self.params.r, "p": self.params.p},
            "salt": base64.b64encode(salt).decode(),
            "nonce": base64.b64encode(nonce).decode(),
            "ciphertext": base64.b64encode(ciphertext).decode(),
        }

    def decrypt_record(self, envelope: dict[str, Any], aad: bytes = b"fdr") -> dict[str, Any]:
        if envelope.get("format") != self.FORMAT:
            raise ValueError("unsupported envelope format")
        salt = base64.b64decode(envelope["salt"])
        nonce = base64.b64decode(envelope["nonce"])
        ciphertext = base64.b64decode(envelope["ciphertext"])
        plaintext = AESGCM(self._derive_key(salt)).decrypt(nonce, ciphertext, aad)
        value = json.loads(plaintext.decode())
        if not isinstance(value, dict):
            raise ValueError("encrypted record must decode to an object")
        return value


__all__ = ["FDRVault", "KdfParameters"]
