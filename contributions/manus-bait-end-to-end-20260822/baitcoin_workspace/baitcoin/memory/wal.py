import json
import os
import hashlib

class MemoryWAL:
    NAMESPACES = [
        "blocks", "utxo", "stakes", "loans", "agents",
        "market", "oracles", "bridges", "vaults", "config"
    ]

    def __init__(self, base_dir: str = "/home/ubuntu/baitcoin_workspace/memory"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)
        self.wal_file = os.path.join(self.base_dir, "wal.log")

    def write_log(self, namespace: str, action: str, data: dict):
        if namespace not in self.NAMESPACES:
            raise ValueError(f"Invalid namespace: {namespace}")
        entry = {
            "namespace": namespace,
            "action": action,
            "data": data,
            "checksum": hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
        }
        with open(self.wal_file, "a") as f:
            f.write(json.dumps(entry) + "\n")
