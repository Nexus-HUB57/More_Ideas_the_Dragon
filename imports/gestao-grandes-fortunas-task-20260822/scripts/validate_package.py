#!/usr/bin/env python3
"""Valida o pacote de artefatos sem modificar nenhum arquivo."""
from __future__ import annotations

import hashlib
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "MANIFESTO_SHA256.txt"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    if not MANIFEST.exists():
        print("ERRO: manifesto ausente")
        return 2

    failures = []
    expected = {}
    for line in MANIFEST.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        digest, relative = line.split("  ", 1)
        expected[relative] = digest

    for relative, digest in expected.items():
        path = ROOT / relative
        if not path.is_file():
            failures.append(f"ausente: {relative}")
            continue
        actual = sha256(path)
        if actual != digest:
            failures.append(f"hash divergente: {relative}")

    actual_files = {
        path.relative_to(ROOT).as_posix()
        for path in ROOT.rglob("*")
        if path.is_file() and path.name not in {MANIFEST.name, "gestao-grandes-fortunas-task-20260822.zip"}
    }
    expected_files = set(expected)
    unexpected = sorted(actual_files - expected_files)
    missing = sorted(expected_files - actual_files)
    failures.extend(f"não manifestado: {item}" for item in unexpected)
    failures.extend(f"não encontrado no disco: {item}" for item in missing)

    print(f"arquivos_manifestados={len(expected_files)}")
    print(f"arquivos_encontrados={len(actual_files)}")
    if failures:
        print("VALIDACAO=FALHOU")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print("VALIDACAO=OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
