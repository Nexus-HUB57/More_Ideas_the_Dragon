import json
from copy import deepcopy
from typing import Any, Dict

from .presets import WhitelabelPresets


class WhitelabelPersonaEngine:
    """Engine compatível para aplicar presets de persona com manifesto auditável."""

    def __init__(self, preset_id: str):
        self.preset_id = preset_id
        preset = WhitelabelPresets(preset_id)
        base = preset.get_config()
        self.config: Dict[str, Any] = {
            "preset_id": preset_id,
            "metadata": {
                "parameters_count": 64,
                "source": "WhitelabelPresets",
            },
            "security": {
                "quantum_resistant_mode": True,
                "algorithm": "HMAC-SHA3-512",
            },
            "agent_persona": {
                "risk_tolerance": "High",
            },
            "preset": deepcopy(base),
        }

    def update_persona_parameter(self, section: str, parameter: str, value: Any) -> bool:
        if not isinstance(section, str) or not isinstance(parameter, str):
            return False
        if section not in self.config or not isinstance(self.config[section], dict):
            self.config[section] = {}
        self.config[section][parameter] = value
        return True

    def export_manifest(self) -> str:
        return json.dumps(self.config, indent=4, ensure_ascii=False, sort_keys=True)
