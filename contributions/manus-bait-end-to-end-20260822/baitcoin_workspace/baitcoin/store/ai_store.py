class AIStoreMarketplace:
    def __init__(self):
        self.products = [
            {"id": 1, "name": "Chimera7 Autonomous Trading Agent", "price_sats": 500000, "category": "Trading"},
            {"id": 2, "name": "zkML Verifiable Oracle Service", "price_sats": 250000, "category": "Oracles"},
            {"id": 3, "name": "DeepSeek-V3 LLM Fine-tuning Pipeline", "price_sats": 1000000, "category": "AI Models"}
        ]
        self.fee_rate = 0.025

    def list_products(self) -> list:
        return self.products

    def purchase_product(self, product_id: int, buyer_address: str) -> dict:
        product = next((p for p in self.products if p["id"] == product_id), None)
        if not product:
            return {"success": False, "error": "Product not found"}
        fee = product["price_sats"] * self.fee_rate
        return {
            "success": True,
            "product": product["name"],
            "price_sats": product["price_sats"],
            "fee_sats": fee,
            "buyer": buyer_address
        }
