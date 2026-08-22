class WhitelabelPresets:
    PRESETS_COUNT = 70
    CONFIG_PARAMS_COUNT = 60

    def __init__(self, preset_name: str):
        self.preset_name = preset_name
        self.config = {
            "theme": "dark-chimera",
            "primary_color": "#ff4500",
            "currency": "BAIT",
            "ai_models_enabled": ["gpt-4o", "claude-3-5-sonnet", "llama-3"],
            "fee_rate": 0.025
        }

    def get_config(self) -> dict:
        return self.config
