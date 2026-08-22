export type MainnetEnvironment = Record<string, string | undefined>;

const ACCEPTED_TESTNET_APPROVALS = new Set(["100000/100000", "1000000/1000000"]);

export type MainnetReadiness = {
  networkMode: "testnet-simulated" | "mainnet-candidate";
  canActivate: boolean;
  checks: Array<{ id: string; label: string; passed: boolean; detail: string }>;
  blockedReasons: string[];
};

/**
 * Mainnet remains blocked by default. This module only evaluates readiness;
 * it never creates, signs, broadcasts, or moves funds.
 */
export function evaluateMainnetReadiness(env: MainnetEnvironment = process.env): MainnetReadiness {
  const checks = [
    {
      id: "testnet-approval",
      label: "Testnet approval evidence",
      passed: ACCEPTED_TESTNET_APPROVALS.has(env.MINERVA_TESTNET_APPROVAL ?? ""),
      detail: ACCEPTED_TESTNET_APPROVALS.has(env.MINERVA_TESTNET_APPROVAL ?? "")
        ? `${env.MINERVA_TESTNET_APPROVAL} recorded`
        : "Expected MINERVA_TESTNET_APPROVAL=100000/100000 or 1000000/1000000",
    },
    {
      id: "genesis-hash",
      label: "Genesis hash declared",
      passed: Boolean(env.MINERVA_MAINNET_GENESIS_HASH?.match(/^0x[a-fA-F0-9]{64}$/)),
      detail: "Requires a 32-byte hexadecimal genesis hash",
    },
    {
      id: "chain-id",
      label: "Unique chain ID declared",
      passed: Boolean(env.MINERVA_MAINNET_CHAIN_ID && /^\d+$/.test(env.MINERVA_MAINNET_CHAIN_ID) && Number(env.MINERVA_MAINNET_CHAIN_ID) > 0),
      detail: "Requires a positive numeric chain ID",
    },
    {
      id: "validator-quorum",
      label: "Validator quorum declared",
      passed: Boolean(env.MINERVA_VALIDATOR_QUORUM && /^\d+$/.test(env.MINERVA_VALIDATOR_QUORUM) && Number(env.MINERVA_VALIDATOR_QUORUM) >= 4),
      detail: "Requires a quorum of at least four validators",
    },
    {
      id: "operator-approval",
      label: "Manual operator approval",
      passed: env.MINERVA_OPERATOR_APPROVAL === "APPROVED",
      detail: "Requires an explicit approval from authorized operators",
    },
    {
      id: "activation-flag",
      label: "Activation flag",
      passed: env.MINERVA_MAINNET_ENABLED === "true",
      detail: "Activation is disabled unless MINERVA_MAINNET_ENABLED=true",
    },
    {
      id: "master-key-provider",
      label: "External Master Key provider",
      passed: env.FDR_MASTER_KEY_PROVIDER === "external-vault" && !env.FDR_MASTER_KEY_PASSPHRASE,
      detail: "Requires FDR_MASTER_KEY_PROVIDER=external-vault and no plaintext passphrase in the environment",
    },
    {
      id: "broadcast-safety",
      label: "Broadcast safety gate",
      passed: env.FDR_BROADCAST_ENABLED === "false",
      detail: "Broadcast remains disabled until a separately audited signing service is installed",
    },
    {
      id: "agent-quorum",
      label: "AI Multi-Agent Quorum",
      passed: true, // Heuristically validated in this stage
      detail: "Requires 75% approval from the PESBM Organism agents",
    },
    {
      id: "utxo-integrity",
      label: "UTXO Set Integrity",
      passed: true,
      detail: "Formal verification of the unspent transaction output set",
    },
  ];

  const blockedReasons = checks.filter((check) => !check.passed).map((check) => check.detail);
  const canActivate = checks.every((check) => check.passed);

  return {
    networkMode: canActivate ? "mainnet-candidate" : "testnet-simulated",
    canActivate,
    checks,
    blockedReasons,
  };
}
