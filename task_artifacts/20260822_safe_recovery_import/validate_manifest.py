#!/usr/bin/env python3
"""Valida apenas metadados; não lê nem processa segredos."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "MANIFEST.tsv"
SENSITIVE = ("key", "private", "wallet", "secret", "token", "password", "rockyou", "seed", "credential", "backup")


def main() -> int:
    if not MANIFEST.exists():
        print("MANIFEST.tsv ausente", file=sys.stderr)
        return 2
    lines = MANIFEST.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "name\tsize_bytes\tsha256\tclassification":
        print("Cabeçalho do manifesto inválido", file=sys.stderr)
        return 2
    errors = []
    for number, line in enumerate(lines[1:], 2):
        if not line.strip():
            continue
        fields = line.split("\t")
        if len(fields) != 4:
            errors.append(f"linha {number}: esperado 4 campos")
            continue
        name, size, digest, classification = fields
        if not size.isdigit() or len(digest) != 64:
            errors.append(f"linha {number}: metadados inválidos")
        if any(word in name.lower() for word in SENSITIVE) and classification != "SENSIVEL_NAO_PUBLICAR":
            errors.append(f"linha {number}: arquivo sensível não classificado")
    if errors:
        print("VALIDAÇÃO FALHOU")
        print("\n".join(errors))
        return 1
    print("VALIDAÇÃO OK: manifesto somente de metadados")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
