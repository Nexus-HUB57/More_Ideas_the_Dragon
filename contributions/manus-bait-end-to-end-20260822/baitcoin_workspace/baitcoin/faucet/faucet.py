import time

class Faucet:
    AMOUNT = 10.0
    COOLDOWN = 86400  # 24 hours

    def __init__(self):
        self.last_requests: dict = {}

    def request_funds(self, address: str) -> dict:
        now = time.time()
        last_time = self.last_requests.get(address, 0)
        if now - last_time < self.COOLDOWN:
            return {"success": False, "error": "Cooldown active (24h)"}
        self.last_requests[address] = now
        return {"success": True, "amount": self.AMOUNT, "address": address}
