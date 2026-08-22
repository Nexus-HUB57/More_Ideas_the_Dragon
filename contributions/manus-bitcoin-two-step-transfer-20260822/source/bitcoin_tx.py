"""Primitive Bitcoin Mainnet transaction utilities.

This module deliberately keeps private material out of source code and output
manifests. It implements the narrow subset needed for the two-step transfer:
legacy P2PKH inputs, P2PKH outputs, and native P2WPKH outputs.

No network calls or broadcasts happen in this module.
"""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import new as hashlib_new, sha256
from typing import Iterable, Sequence

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec, utils


SECP256K1_ORDER = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"


def sha256d(data: bytes) -> bytes:
    return sha256(sha256(data).digest()).digest()


def hash160(data: bytes) -> bytes:
    return hashlib_new("ripemd160", sha256(data).digest()).digest()


def ser_varint(value: int) -> bytes:
    if value < 0:
        raise ValueError("varint cannot be negative")
    if value < 0xFD:
        return bytes([value])
    if value <= 0xFFFF:
        return b"\xfd" + value.to_bytes(2, "little")
    if value <= 0xFFFFFFFF:
        return b"\xfe" + value.to_bytes(4, "little")
    return b"\xff" + value.to_bytes(8, "little")


def push_data(data: bytes) -> bytes:
    """Encode a canonical direct push for a normal P2PKH scriptSig item."""
    size = len(data)
    if size < 0x4C:
        return bytes([size]) + data
    if size <= 0xFF:
        return b"\x4c" + bytes([size]) + data
    if size <= 0xFFFF:
        return b"\x4d" + size.to_bytes(2, "little") + data
    raise ValueError("data push too large")


def base58check_decode(address: str) -> tuple[int, bytes]:
    if not address:
        raise ValueError("empty Base58Check string")
    number = 0
    for char in address:
        if char not in BASE58_ALPHABET:
            raise ValueError(f"invalid Base58 character: {char!r}")
        number = number * 58 + BASE58_ALPHABET.index(char)
    raw = number.to_bytes((number.bit_length() + 7) // 8, "big") if number else b""
    leading_zeroes = len(address) - len(address.lstrip("1"))
    raw = b"\x00" * leading_zeroes + raw
    if len(raw) < 5:
        raise ValueError("Base58Check payload is too short")
    payload, checksum = raw[:-4], raw[-4:]
    if sha256d(payload)[:4] != checksum:
        raise ValueError("Base58Check checksum mismatch")
    return payload[0], payload[1:]


def p2pkh_script_pubkey(address: str) -> bytes:
    version, payload = base58check_decode(address)
    if version != 0 or len(payload) != 20:
        raise ValueError(f"not a Mainnet P2PKH address: {address}")
    return b"\x76\xa9\x14" + payload + b"\x88\xac"


def bech32_polymod(values: Iterable[int]) -> int:
    generator = (0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3)
    checksum = 1
    for value in values:
        top = checksum >> 25
        checksum = ((checksum & 0x1FFFFFF) << 5) ^ value
        for bit, generator_value in enumerate(generator):
            if (top >> bit) & 1:
                checksum ^= generator_value
    return checksum


def bech32_hrp_expand(hrp: str) -> list[int]:
    return [ord(char) >> 5 for char in hrp] + [0] + [ord(char) & 31 for char in hrp]


def bech32_decode(address: str) -> tuple[str, list[int]]:
    if address.lower() != address and address.upper() != address:
        raise ValueError("mixed-case Bech32 address")
    address = address.lower()
    if not (14 <= len(address) <= 90):
        raise ValueError("invalid Bech32 length")
    separator = address.rfind("1")
    if separator < 1 or separator + 7 > len(address):
        raise ValueError("invalid Bech32 separator")
    hrp = address[:separator]
    charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
    try:
        data = [charset.index(char) for char in address[separator + 1 :]]
    except ValueError as exc:
        raise ValueError("invalid Bech32 character") from exc
    if bech32_polymod(bech32_hrp_expand(hrp) + data) != 1:
        raise ValueError("Bech32 checksum mismatch")
    return hrp, data[:-6]


def convertbits(data: Sequence[int], from_bits: int, to_bits: int, pad: bool) -> list[int]:
    accumulator = 0
    bits = 0
    result: list[int] = []
    max_value = (1 << to_bits) - 1
    max_accumulator = (1 << (from_bits + to_bits - 1)) - 1
    for value in data:
        if value < 0 or value >> from_bits:
            raise ValueError("invalid convertbits value")
        accumulator = ((accumulator << from_bits) | value) & max_accumulator
        bits += from_bits
        while bits >= to_bits:
            bits -= to_bits
            result.append((accumulator >> bits) & max_value)
    if pad:
        if bits:
            result.append((accumulator << (to_bits - bits)) & max_value)
    elif bits >= from_bits or ((accumulator << (to_bits - bits)) & max_value):
        raise ValueError("non-zero Bech32 padding")
    return result


def p2wpkh_script_pubkey(address: str) -> bytes:
    hrp, data = bech32_decode(address)
    if hrp != "bc" or not data or data[0] != 0:
        raise ValueError(f"not a Mainnet native SegWit v0 address: {address}")
    program = bytes(convertbits(data[1:], 5, 8, False))
    if len(program) != 20:
        raise ValueError("P2WPKH witness program must be 20 bytes")
    return b"\x00\x14" + program


def address_from_pubkey(pubkey: bytes) -> str:
    payload = b"\x00" + hash160(pubkey)
    number = int.from_bytes(payload + sha256d(payload)[:4], "big")
    encoded = ""
    while number:
        number, remainder = divmod(number, 58)
        encoded = BASE58_ALPHABET[remainder] + encoded
    leading_zeroes = len(payload + sha256d(payload)[:4]) - len((payload + sha256d(payload)[:4]).lstrip(b"\x00"))
    return "1" * leading_zeroes + (encoded or "1")


def parse_wif(wif: str) -> tuple[int, bool]:
    version, payload = base58check_decode(wif)
    if version != 0x80 or len(payload) not in (32, 33):
        raise ValueError("expected a Mainnet WIF")
    compressed = len(payload) == 33
    if compressed:
        if payload[-1] != 1:
            raise ValueError("invalid compressed WIF marker")
        payload = payload[:-1]
    scalar = int.from_bytes(payload, "big")
    if not 1 <= scalar < SECP256K1_ORDER:
        raise ValueError("private key scalar out of range")
    return scalar, compressed


def pubkey_from_scalar(scalar: int, compressed: bool = True) -> bytes:
    private_key = ec.derive_private_key(scalar, ec.SECP256K1())
    numbers = private_key.public_key().public_numbers()
    x_bytes = numbers.x.to_bytes(32, "big")
    y_bytes = numbers.y.to_bytes(32, "big")
    if compressed:
        prefix = b"\x02" if numbers.y % 2 == 0 else b"\x03"
        return prefix + x_bytes
    return b"\x04" + x_bytes + y_bytes


def compressed_pubkey_from_scalar(scalar: int) -> bytes:
    return pubkey_from_scalar(scalar, compressed=True)


def address_from_wif(wif: str) -> str:
    scalar, compressed = parse_wif(wif)
    return address_from_pubkey(pubkey_from_scalar(scalar, compressed=compressed))


def txid_from_raw(raw_tx: bytes) -> str:
    return sha256d(raw_tx)[::-1].hex()


def _serialize_outputs(outputs: Sequence[tuple[int, bytes]]) -> bytes:
    result = bytearray(ser_varint(len(outputs)))
    for value, script_pubkey in outputs:
        if value < 0 or value > 21_000_000 * 100_000_000:
            raise ValueError("output value out of range")
        result.extend(value.to_bytes(8, "little"))
        result.extend(ser_varint(len(script_pubkey)))
        result.extend(script_pubkey)
    return bytes(result)


def _serialize_inputs(inputs: Sequence["LegacyInput"], script_override_index: int | None, script_override: bytes) -> bytes:
    result = bytearray(ser_varint(len(inputs)))
    for index, txin in enumerate(inputs):
        result.extend(bytes.fromhex(txin.prev_txid)[::-1])
        result.extend(txin.vout.to_bytes(4, "little"))
        script = script_override if index == script_override_index else txin.script_sig
        result.extend(ser_varint(len(script)))
        result.extend(script)
        result.extend(txin.sequence.to_bytes(4, "little"))
    return bytes(result)


@dataclass(frozen=True)
class LegacyInput:
    prev_txid: str
    vout: int
    script_pubkey: bytes
    value: int
    sequence: int = 0xFFFFFFFF
    script_sig: bytes = b""


@dataclass(frozen=True)
class TxResult:
    raw: bytes
    txid: str
    fee_sats: int
    vbytes: int


def _legacy_sighash(inputs: Sequence[LegacyInput], outputs: Sequence[tuple[int, bytes]], index: int) -> bytes:
    body = b"\x01\x00\x00\x00"
    body += _serialize_inputs(inputs, index, inputs[index].script_pubkey)
    body += _serialize_outputs(outputs)
    body += b"\x01\x00\x00\x00"  # SIGHASH_ALL
    return sha256d(body)


def _sign_digest(scalar: int, digest: bytes) -> bytes:
    key = ec.derive_private_key(scalar, ec.SECP256K1())
    der = key.sign(digest, ec.ECDSA(utils.Prehashed(hashes.SHA256())))
    r, s = utils.decode_dss_signature(der)
    if s > SECP256K1_ORDER // 2:
        s = SECP256K1_ORDER - s
    return utils.encode_dss_signature(r, s)


def build_signed_legacy_p2pkh(
    inputs: Sequence[LegacyInput],
    outputs: Sequence[tuple[int, bytes]],
    scalar: int,
    compressed: bool = True,
) -> TxResult:
    if not inputs:
        raise ValueError("transaction must contain at least one input")
    if not outputs:
        raise ValueError("transaction must contain at least one output")
    pubkey = pubkey_from_scalar(scalar, compressed=compressed)
    signed_inputs: list[LegacyInput] = []
    for index, txin in enumerate(inputs):
        digest = _legacy_sighash(inputs, outputs, index)
        signature = _sign_digest(scalar, digest) + b"\x01"
        script_sig = push_data(signature) + push_data(pubkey)
        signed_inputs.append(
            LegacyInput(
                prev_txid=txin.prev_txid,
                vout=txin.vout,
                script_pubkey=txin.script_pubkey,
                value=txin.value,
                sequence=txin.sequence,
                script_sig=script_sig,
            )
        )
    raw = b"\x01\x00\x00\x00" + _serialize_inputs(signed_inputs, None, b"") + _serialize_outputs(outputs)
    input_total = sum(item.value for item in inputs)
    output_total = sum(value for value, _ in outputs)
    fee = input_total - output_total
    if fee < 0:
        raise ValueError("outputs exceed inputs")
    return TxResult(raw=raw, txid=txid_from_raw(raw), fee_sats=fee, vbytes=len(raw))


def validate_legacy_p2pkh_signature(
    result: TxResult,
    inputs: Sequence[LegacyInput],
    outputs: Sequence[tuple[int, bytes]],
    scalar: int,
    compressed: bool = True,
) -> None:
    """Validate the locally generated signature using the public key and sighash."""
    # The full Script interpreter is intentionally out of scope. This check
    # confirms the signature cryptographically and guards against witness
    # marker/flag contamination in the serialized transaction.
    if result.raw[0:4] != b"\x01\x00\x00\x00":
        raise ValueError("unexpected transaction version")
    if result.raw[4:6] == b"\x00\x01":
        raise ValueError("legacy transaction must not contain a SegWit marker")
    expected_digest = _legacy_sighash(inputs, outputs, 0)
    # Parse the first scriptSig's canonical pushes without a general script VM.
    offset = 4 + 1 + 32 + 4
    script_len = result.raw[offset]
    offset += 1
    script = result.raw[offset : offset + script_len]
    if not script:
        raise ValueError("empty scriptSig")
    sig_len = script[0]
    sig_end = 1 + sig_len
    if sig_len < 2 or sig_end > len(script):
        raise ValueError("invalid signature push in scriptSig")
    signature_with_sighash = script[1:sig_end]
    if signature_with_sighash[-1] != 1:
        raise ValueError("expected SIGHASH_ALL marker")
    signature = signature_with_sighash[:-1]
    pubkey_len_offset = sig_end
    if pubkey_len_offset >= len(script):
        raise ValueError("missing public-key push in scriptSig")
    pubkey_len = script[pubkey_len_offset]
    pubkey_end = pubkey_len_offset + 1 + pubkey_len
    pubkey = script[pubkey_len_offset + 1 : pubkey_end]
    if pubkey_end != len(script):
        raise ValueError("unexpected trailing scriptSig bytes")
    if pubkey != pubkey_from_scalar(scalar, compressed=compressed):
        raise ValueError("scriptSig public key mismatch")
    ec.EllipticCurvePublicKey.from_encoded_point(ec.SECP256K1(), pubkey).verify(
        signature, expected_digest, ec.ECDSA(utils.Prehashed(hashes.SHA256()))
    )
