class Tokenomics:
    MAX_SUPPLY = 21_000_000 * 10**8  # in s'AI'toshis
    HALVING_INTERVAL = 210_000
    INITIAL_BLOCK_REWARD = 50 * 10**8

    def __init__(self):
        self.total_supply = 0
        self.balances: dict = {}

    def get_block_reward(self, height: int) -> int:
        halvings = height // self.HALVING_INTERVAL
        if halvings >= 64:
            return 0
        return self.INITIAL_BLOCK_REWARD >> halvings

    def mint(self, address: str, amount: int) -> bool:
        if self.total_supply + amount > self.MAX_SUPPLY:
            return False
        self.total_supply += amount
        self.balances[address] = self.balances.get(address, 0) + amount
        return True

    def transfer(self, sender: str, recipient: str, amount: int) -> bool:
        if self.balances.get(sender, 0) < amount:
            return False
        self.balances[sender] -= amount
        self.balances[recipient] = self.balances.get(recipient, 0) + amount
        return True

    def get_balance(self, address: str) -> int:
        return self.balances.get(address, 0)
