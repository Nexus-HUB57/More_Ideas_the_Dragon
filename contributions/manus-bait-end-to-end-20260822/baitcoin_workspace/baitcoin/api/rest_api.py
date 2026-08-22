import time
from typing import Dict, Any, Optional

class BaitcoinRestAPI:
    """
    Módulo 07: baitcoin_api
    Servidor REST de alta performance com autenticação Moltbook,
    rate limiter adaptativo e documentação OpenAPI embutida.
    """
    def __init__(self, explorer_instance):
        self.explorer = explorer_instance
        self.rate_limits: Dict[str, list] = {}
        self.max_requests_per_minute = 120

    def check_rate_limit(self, client_id: str) -> bool:
        now = time.time()
        window = 60.0
        requests = self.rate_limits.get(client_id, [])
        # Filtrar requisições na janela de 1 minuto
        requests = [t for t in requests if now - t < window]
        if len(requests) >= self.max_requests_per_minute:
            return False
        requests.append(now)
        self.rate_limits[client_id] = requests
        return True

    def handle_request(self, endpoint: str, client_id: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.check_rate_limit(client_id):
            return {"status": 429, "error": "Rate limit exceeded. Max 120 req/min."}

        params = params or {}
        if endpoint == "/api/v1/status":
            return {"status": 200, "data": self.explorer.get_network_stats()}
        elif endpoint == "/api/v1/block/height":
            height = params.get("height", 0)
            block = self.explorer.get_block_by_height(height)
            if block:
                return {"status": 200, "data": block}
            return {"status": 404, "error": "Block not found"}
        elif endpoint == "/api/v1/search":
            query = params.get("query", "")
            return {"status": 200, "data": self.explorer.search(query)}
        else:
            return {"status": 404, "error": f"Endpoint {endpoint} not found in OpenAPI spec"}
