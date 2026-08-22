class AIAgentProtocol:
    CAPABILITIES = [
        "trading", "oracle", "validation", "lending", "arbitrage",
        "governance", "security", "summarization", "translation", "execution"
    ]
    TIERS = ["Novice", "Verified", "Expert", "Chimera"]

    def __init__(self, agent_id: str, capabilities: list):
        self.agent_id = agent_id
        self.capabilities = [c for c in capabilities if c in self.CAPABILITIES]
        self.reputation_score = 100.0
        self.tier = "Novice"

    def update_reputation(self, delta: float):
        self.reputation_score = max(0.0, self.reputation_score + delta)
        if self.reputation_score > 900:
            self.tier = "Chimera"
        elif self.reputation_score > 500:
            self.tier = "Expert"
        elif self.reputation_score > 250:
            self.tier = "Verified"
        else:
            self.tier = "Novice"
