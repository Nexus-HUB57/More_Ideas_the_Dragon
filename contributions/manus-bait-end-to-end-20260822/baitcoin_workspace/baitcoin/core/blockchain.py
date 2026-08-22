import hashlib
import time
import json
from typing import List, Dict, Any, Optional

def sha256d(data: bytes) -> bytes:
    return hashlib.sha256(hashlib.sha256(data).digest()).digest()

class Block:
    def __init__(self, index: int, previous_hash: str, transactions: List[Dict[str, Any]], difficulty: int = 3):
        self.index = index
        self.timestamp = time.time()
        self.previous_hash = previous_hash
        self.transactions = transactions
        self.difficulty = difficulty
        self.nonce = 0
        self.merkle_root = self.compute_merkle_root()
        self.hash = self.mine_block()

    def compute_merkle_root(self) -> str:
        if not self.transactions:
            return hashlib.sha256(b"empty").hexdigest()
        tx_hashes = [hashlib.sha256(json.dumps(tx, sort_keys=True).encode()).digest() for tx in self.transactions]
        while len(tx_hashes) > 1:
            if len(tx_hashes) % 2 != 0:
                tx_hashes.append(tx_hashes[-1])
            next_level = []
            for i in range(0, len(tx_hashes), 2):
                combined = tx_hashes[i] + tx_hashes[i+1]
                next_level.append(hashlib.sha256(combined).digest())
            tx_hashes = next_level
        return tx_hashes[0].hex()

    def header_bytes(self) -> bytes:
        header_str = f"{self.index}{self.previous_hash}{self.merkle_root}{self.timestamp}{self.difficulty}{self.nonce}"
        return header_str.encode()

    def mine_block(self) -> str:
        target = "0" * self.difficulty
        while True:
            h = sha256d(self.header_bytes()).hex()
            if h.startswith(target):
                return h
            self.nonce += 1

    def to_dict(self) -> Dict[str, Any]:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
            "transactions": self.transactions,
            "merkle_root": self.merkle_root,
            "difficulty": self.difficulty,
            "nonce": self.nonce,
            "hash": self.hash
        }

class Blockchain:
    def __init__(self):
        self.chain: List[Block] = []
        self.mempool: List[Dict[str, Any]] = []
        self.difficulty = 3
        self.create_genesis_block()

    def create_genesis_block(self):
        genesis_tx = {"sender": "SYSTEM", "recipient": "genesis_vault", "amount": 21000000.0, "signature": "genesis"}
        genesis_block = Block(0, "0" * 64, [genesis_tx], difficulty=self.difficulty)
        self.chain.append(genesis_block)

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_block(self, transactions: List[Dict[str, Any]]) -> Block:
        latest = self.get_latest_block()
        new_block = Block(index=latest.index + 1, previous_hash=latest.hash, transactions=transactions, difficulty=self.difficulty)
        self.chain.append(new_block)
        return new_block

    def is_chain_valid(self) -> bool:
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            if current.previous_hash != previous.hash:
                return False
            if not current.hash.startswith("0" * current.difficulty):
                return False
            if current.hash != sha256d(current.header_bytes()).hex():
                return False
        return True
