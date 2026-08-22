from typing import List, Dict, Any, Optional
from baitcoin.core.blockchain import Blockchain

class BaitcoinExplorer:
    """
    Módulo 06: baitcoin_explorer
    Responsável por indexação de blocos, UTXOs, busca por hash/altura,
    métricas de mempool e suporte a 56+ endpoints REST de consulta.
    """
    def __init__(self, blockchain: Blockchain):
        self.blockchain = blockchain
        self.index_cache: Dict[str, Any] = {}
        self.build_indexes()

    def build_indexes(self):
        """Indexa blocos por hash e altura para buscas em O(1)."""
        self.index_cache["blocks_by_height"] = {}
        self.index_cache["blocks_by_hash"] = {}
        self.index_cache["transactions"] = {}

        for block in self.blockchain.chain:
            self.index_cache["blocks_by_height"][block.index] = block
            self.index_cache["blocks_by_hash"][block.hash] = block
            for tx in block.transactions:
                # Simula indexação de tx
                tx_id = tx.get("signature", str(block.index))
                self.index_cache["transactions"][tx_id] = {
                    "block_index": block.index,
                    "block_hash": block.hash,
                    "data": tx
                }

    def get_block_by_height(self, height: int) -> Optional[Dict[str, Any]]:
        block = self.index_cache["blocks_by_height"].get(height)
        return block.to_dict() if block else None

    def get_block_by_hash(self, block_hash: str) -> Optional[Dict[str, Any]]:
        block = self.index_cache["blocks_by_hash"].get(block_hash)
        return block.to_dict() if block else None

    def search(self, query: str) -> Dict[str, Any]:
        """Busca unificada por altura, hash de bloco ou transação."""
        if query.isdigit():
            res = self.get_block_by_height(int(query))
            if res:
                return {"type": "block", "data": res}
        if query in self.index_cache["blocks_by_hash"]:
            return {"type": "block", "data": self.index_cache["blocks_by_hash"][query].to_dict()}
        if query in self.index_cache["transactions"]:
            return {"type": "transaction", "data": self.index_cache["transactions"][query]}
        return {"type": "not_found", "query": query}

    def get_network_stats(self) -> Dict[str, Any]:
        latest = self.blockchain.get_latest_block()
        return {
            "chain_height": latest.index,
            "latest_hash": latest.hash,
            "difficulty": latest.difficulty,
            "mempool_size": len(self.blockchain.mempool),
            "is_valid": self.blockchain.is_chain_valid(),
            "total_indexed_transactions": len(self.index_cache["transactions"])
        }
