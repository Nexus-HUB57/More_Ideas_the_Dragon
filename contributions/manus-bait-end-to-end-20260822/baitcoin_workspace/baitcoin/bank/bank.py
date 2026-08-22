class BainkrBank:
    def __init__(self):
        self.stakes: dict = {}
        self.loans: dict = {}
        self.vaults: dict = {}
        self.apy = 0.07

    def stake(self, address: str, amount: int) -> bool:
        if amount <= 0:
            return False
        self.stakes[address] = self.stakes.get(address, 0) + amount
        return True

    def calculate_rewards(self, address: str, blocks_elapsed: int) -> float:
        staked = self.stakes.get(address, 0)
        annual_reward = staked * self.apy
        block_reward = annual_reward * (blocks_elapsed / 2102400) # approx blocks per year
        return block_reward

    def create_loan(self, borrower: str, collateral_amount: int, borrow_amount: int) -> bool:
        # 150% collateral requirement
        required_collateral = borrow_amount * 1.5
        if collateral_amount < required_collateral:
            return False
        self.loans[borrower] = {
            "collateral": collateral_amount,
            "borrowed": borrow_amount,
            "status": "active"
        }
        return True
