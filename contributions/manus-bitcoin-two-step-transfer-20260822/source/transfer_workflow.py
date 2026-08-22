"""Safe, review-first workflow for a two-step Bitcoin Mainnet transfer.

The default mode only fetches public UTXO data, builds a transaction, validates
its serialization/signature, and writes a secret-free manifest. Broadcasting is
explicitly opt-in via ``--broadcast`` and ``BITCOIN_BROADCAST_CONFIRM``.

Required environment variables for signing:
  BITCOIN_SOURCE_WIF          for step 1
  BITCOIN_INTERMEDIATE_WIF    for step 2 (must control the P2PKH intermediate)

The WIF values and passwords are never written to manifests or logs.
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

from bitcoin_tx import (
    LegacyInput,
    address_from_wif,
    build_signed_legacy_p2pkh,
    parse_wif,
    p2pkh_script_pubkey,
    p2wpkh_script_pubkey,
    validate_legacy_p2pkh_signature,
)


NETWORK = "bitcoin-mainnet"
API_BASE = "https://mempool.space/api"
SOURCE_ADDRESS = "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug"
INTERMEDIATE_ADDRESS = "1E4FSo55XCjSDhpXBsRkB5o9f4fkVxGtcL"
FINAL_ADDRESS = "bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8"
TRANSFER_SATS = 10_000
STEP1_FEE_SATS = 2_000
STEP1_SOURCE_TXID = "e58c3e3028f23553f04287c8f6dce5ad4f413ee9e022f83e9223cabeaac93823"
STEP1_SOURCE_VOUT = 28


class WorkflowError(RuntimeError):
    """Raised for a validation or workflow precondition failure."""


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def get_json(path: str) -> Any:
    response = requests.get(f"{API_BASE}/{path.lstrip('/')}", timeout=20)
    response.raise_for_status()
    return response.json()


def fetch_address_utxos(address: str) -> list[dict[str, Any]]:
    return get_json(f"address/{address}/utxo")


def broadcast_raw_transaction(raw_hex: str) -> str:
    """Broadcast only after the explicit CLI and environment gates pass."""
    if os.environ.get("BITCOIN_BROADCAST_CONFIRM") != "I_UNDERSTAND_IRREVERSIBLE":
        raise WorkflowError(
            "Broadcast bloqueado: defina BITCOIN_BROADCAST_CONFIRM="
            "I_UNDERSTAND_IRREVERSIBLE somente após revisar o manifesto."
        )
    response = requests.post(f"{API_BASE}/tx", data=raw_hex, timeout=30)
    if response.status_code >= 400:
        raise WorkflowError(f"broadcast rejeitado ({response.status_code}): {response.text[:500]}")
    return response.text.strip()


def require_wif(env_name: str, expected_address: str) -> tuple[str, int, bool]:
    wif = os.environ.get(env_name, "").strip()
    if not wif:
        raise WorkflowError(f"variável {env_name} não definida; nenhum segredo é lido de arquivos versionados")
    scalar, compressed = parse_wif(wif)
    derived_address = address_from_wif(wif)
    if derived_address != expected_address:
        raise WorkflowError(
            f"{env_name} não controla {expected_address}; endereço derivado foi {derived_address}"
        )
    return wif, scalar, compressed


def find_exact_utxo(address: str, txid: str, vout: int) -> dict[str, Any]:
    utxos = fetch_address_utxos(address)
    for utxo in utxos:
        if utxo.get("txid") == txid and int(utxo.get("vout")) == vout:
            return utxo
    raise WorkflowError(f"UTXO {txid}:{vout} não está não-gasto para {address}")


def write_manifest(path: Path, manifest: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise WorkflowError(f"manifesto já existe; recusando sobrescrever: {path}")
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def common_manifest(result: Any, source: str, destination: str, input_ref: dict[str, Any], outputs: list[dict[str, Any]], fee: int) -> dict[str, Any]:
    return {
        "network": NETWORK,
        "created_at": utc_now(),
        "source_address": source,
        "destination_address": destination,
        "input": input_ref,
        "outputs": outputs,
        "fee_sats": fee,
        "vbytes": result.vbytes,
        "txid": result.txid,
        "tx_hex": result.raw.hex(),
        "broadcasted": False,
        "secret_material_included": False,
    }


def build_step1(output_path: Path, broadcast: bool) -> dict[str, Any]:
    _, scalar, compressed = require_wif("BITCOIN_SOURCE_WIF", SOURCE_ADDRESS)
    utxo = find_exact_utxo(SOURCE_ADDRESS, STEP1_SOURCE_TXID, STEP1_SOURCE_VOUT)
    input_value = int(utxo["value"])
    change = input_value - TRANSFER_SATS - STEP1_FEE_SATS
    if change <= 546:
        raise WorkflowError(f"troco não é padrão: {change} sats")
    inputs = [
        LegacyInput(
            prev_txid=STEP1_SOURCE_TXID,
            vout=STEP1_SOURCE_VOUT,
            script_pubkey=p2pkh_script_pubkey(SOURCE_ADDRESS),
            value=input_value,
        )
    ]
    outputs = [
        (TRANSFER_SATS, p2pkh_script_pubkey(INTERMEDIATE_ADDRESS)),
        (change, p2pkh_script_pubkey(SOURCE_ADDRESS)),
    ]
    result = build_signed_legacy_p2pkh(inputs, outputs, scalar, compressed=compressed)
    validate_legacy_p2pkh_signature(result, inputs, outputs, scalar, compressed=compressed)
    manifest = common_manifest(
        result,
        SOURCE_ADDRESS,
        INTERMEDIATE_ADDRESS,
        {"txid": STEP1_SOURCE_TXID, "vout": STEP1_SOURCE_VOUT, "value_sats": input_value},
        [
            {"address": INTERMEDIATE_ADDRESS, "value_sats": TRANSFER_SATS, "type": "P2PKH"},
            {"address": SOURCE_ADDRESS, "value_sats": change, "type": "P2PKH_CHANGE"},
        ],
        STEP1_FEE_SATS,
    )
    if broadcast:
        manifest["broadcasted"] = True
        manifest["broadcast_txid"] = broadcast_raw_transaction(result.raw.hex())
    write_manifest(output_path, manifest)
    return manifest


def build_step2(output_path: Path, broadcast: bool, step1_txid: str, step1_vout: int, step1_value: int) -> dict[str, Any]:
    _, scalar, compressed = require_wif("BITCOIN_INTERMEDIATE_WIF", INTERMEDIATE_ADDRESS)
    fee = step1_value - 546
    if fee <= 0:
        raise WorkflowError("valor da etapa 2 precisa exceder o dust limit")
    output_value = step1_value - 2_000
    if output_value <= 546:
        raise WorkflowError("valor final após a taxa ficaria abaixo do dust limit")
    inputs = [
        LegacyInput(
            prev_txid=step1_txid,
            vout=step1_vout,
            script_pubkey=p2pkh_script_pubkey(INTERMEDIATE_ADDRESS),
            value=step1_value,
        )
    ]
    outputs = [(output_value, p2wpkh_script_pubkey(FINAL_ADDRESS))]
    result = build_signed_legacy_p2pkh(inputs, outputs, scalar, compressed=compressed)
    validate_legacy_p2pkh_signature(result, inputs, outputs, scalar, compressed=compressed)
    manifest = common_manifest(
        result,
        INTERMEDIATE_ADDRESS,
        FINAL_ADDRESS,
        {"txid": step1_txid, "vout": step1_vout, "value_sats": step1_value},
        [{"address": FINAL_ADDRESS, "value_sats": output_value, "type": "P2WPKH"}],
        step1_value - output_value,
    )
    if broadcast:
        manifest["broadcasted"] = True
        manifest["broadcast_txid"] = broadcast_raw_transaction(result.raw.hex())
    write_manifest(output_path, manifest)
    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--step", choices=("1", "2"), required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--broadcast", action="store_true", help="transmitir após as duas confirmações explícitas")
    parser.add_argument("--step1-txid", help="TXID da saída intermediária confirmada")
    parser.add_argument("--step1-vout", type=int, default=0)
    parser.add_argument("--step1-value", type=int, default=TRANSFER_SATS)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.step == "1":
            manifest = build_step1(args.output, args.broadcast)
        else:
            if not args.step1_txid:
                raise WorkflowError("--step1-txid é obrigatório para a etapa 2")
            manifest = build_step2(args.output, args.broadcast, args.step1_txid, args.step1_vout, args.step1_value)
    except (WorkflowError, requests.RequestException, ValueError) as exc:
        print(f"ERRO: {exc}")
        return 2
    print(json.dumps({k: manifest[k] for k in ("txid", "tx_hex", "fee_sats", "vbytes", "broadcasted")}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
