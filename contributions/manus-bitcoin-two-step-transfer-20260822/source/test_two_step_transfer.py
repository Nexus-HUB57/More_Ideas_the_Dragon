from bitcoin_tx import (
    LegacyInput,
    address_from_pubkey,
    build_signed_legacy_p2pkh,
    compressed_pubkey_from_scalar,
    p2pkh_script_pubkey,
    p2wpkh_script_pubkey,
    validate_legacy_p2pkh_signature,
)


def test_known_scalar_one_p2pkh_address() -> None:
    # Public, deterministic test vector; it is not a wallet secret used by this task.
    assert address_from_pubkey(compressed_pubkey_from_scalar(1)) == "1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH"


def test_final_address_is_native_p2wpkh() -> None:
    script = p2wpkh_script_pubkey("bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8")
    assert script[:2] == b"\x00\x14"
    assert len(script) == 22


def test_signed_legacy_transaction_has_no_segwit_marker_or_witness() -> None:
    scalar = 1
    source = address_from_pubkey(compressed_pubkey_from_scalar(scalar))
    destination = "1E4FSo55XCjSDhpXBsRkB5o9f4fkVxGtcL"
    txin = LegacyInput(
        prev_txid="11" * 32,
        vout=0,
        script_pubkey=p2pkh_script_pubkey(source),
        value=100_000,
    )
    outputs = [(10_000, p2pkh_script_pubkey(destination)), (88_000, p2pkh_script_pubkey(source))]
    result = build_signed_legacy_p2pkh([txin], outputs, scalar)
    assert result.raw[:4] == b"\x01\x00\x00\x00"
    assert result.raw[4:6] != b"\x00\x01"
    assert result.fee_sats == 2_000
    validate_legacy_p2pkh_signature(result, [txin], outputs, scalar)


def test_legacy_transaction_fails_if_outputs_exceed_inputs() -> None:
    scalar = 1
    source = address_from_pubkey(compressed_pubkey_from_scalar(scalar))
    txin = LegacyInput(
        prev_txid="22" * 32,
        vout=1,
        script_pubkey=p2pkh_script_pubkey(source),
        value=1_000,
    )
    try:
        build_signed_legacy_p2pkh([txin], [(1_001, p2pkh_script_pubkey(source))], scalar)
    except ValueError as exc:
        assert "outputs exceed inputs" in str(exc)
    else:
        raise AssertionError("expected insufficient-input failure")
