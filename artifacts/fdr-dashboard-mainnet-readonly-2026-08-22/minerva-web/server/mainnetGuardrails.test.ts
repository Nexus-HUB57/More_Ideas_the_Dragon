import { describe, expect, it } from "vitest";
import { evaluateMainnetReadiness } from "./mainnetGuardrails";

describe("mainnet guardrails", () => {
  it("blocks activation by default", () => {
    const result = evaluateMainnetReadiness({});

    expect(result.canActivate).toBe(false);
    expect(result.networkMode).toBe("testnet-simulated");
    expect(result.blockedReasons.length).toBeGreaterThan(0);
  });

  it("requires every explicit production criterion", () => {
    const ready = evaluateMainnetReadiness({
      MINERVA_TESTNET_APPROVAL: "100000/100000",
      MINERVA_MAINNET_GENESIS_HASH: `0x${"a".repeat(64)}`,
      MINERVA_MAINNET_CHAIN_ID: "5757",
      MINERVA_VALIDATOR_QUORUM: "4",
      MINERVA_OPERATOR_APPROVAL: "APPROVED",
      MINERVA_MAINNET_ENABLED: "true",
      FDR_MASTER_KEY_PROVIDER: "external-vault",
      FDR_BROADCAST_ENABLED: "false",
    });

    expect(ready.canActivate).toBe(true);
    expect(ready.networkMode).toBe("mainnet-candidate");
    expect(ready.blockedReasons).toEqual([]);
  });

  it("accepts the reported 1000000/1000000 approval format", () => {
    const result = evaluateMainnetReadiness({
      MINERVA_TESTNET_APPROVAL: "1000000/1000000",
      MINERVA_MAINNET_GENESIS_HASH: `0x${"b".repeat(64)}`,
      MINERVA_MAINNET_CHAIN_ID: "5757",
      MINERVA_VALIDATOR_QUORUM: "4",
      MINERVA_OPERATOR_APPROVAL: "APPROVED",
      MINERVA_MAINNET_ENABLED: "true",
      FDR_MASTER_KEY_PROVIDER: "external-vault",
      FDR_BROADCAST_ENABLED: "false",
    });

    expect(result.canActivate).toBe(true);
    expect(result.checks.find((check) => check.id === "testnet-approval")?.passed).toBe(true);
  });

  it("blocks when the Master Key is not delegated to an external vault", () => {
    const result = evaluateMainnetReadiness({
      MINERVA_TESTNET_APPROVAL: "100000/100000",
      MINERVA_MAINNET_GENESIS_HASH: `0x${"a".repeat(64)}`,
      MINERVA_MAINNET_CHAIN_ID: "5757",
      MINERVA_VALIDATOR_QUORUM: "4",
      MINERVA_OPERATOR_APPROVAL: "APPROVED",
      MINERVA_MAINNET_ENABLED: "true",
      FDR_BROADCAST_ENABLED: "false",
    });

    expect(result.canActivate).toBe(false);
    expect(result.checks.find((check) => check.id === "master-key-provider")?.passed).toBe(false);
  });

  it("rejects a malformed genesis hash", () => {
    const result = evaluateMainnetReadiness({ MINERVA_MAINNET_GENESIS_HASH: "0xnot-a-hash" });

    expect(result.canActivate).toBe(false);
    expect(result.checks.find((check) => check.id === "genesis-hash")?.passed).toBe(false);
  });
});
