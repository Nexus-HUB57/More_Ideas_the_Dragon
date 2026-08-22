import { describe, expect, it } from "vitest";
import { verifyPassword, PASSWORD_A_HASH, PASSWORD_B_HASH, PASSWORD_C_HASH, FdrTransactionManager, CUSTODY_WALLET_ADDRESS } from "./fdr_service";

describe("FDR Security and Protocol Tests", () => {
  it("verifies protocol passwords correctly using SHA-256 hashes", () => {
    expect(verifyPassword("REDACTED_SECRET_PLACEHOLDER", PASSWORD_A_HASH)).toBe(true);
    expect(verifyPassword("REDACTED_SECRET_PLACEHOLDER", PASSWORD_B_HASH)).toBe(true);
    expect(verifyPassword("REDACTED_SECRET_PLACEHOLDER", PASSWORD_C_HASH)).toBe(true);
    expect(verifyPassword("WrongPassword", PASSWORD_A_HASH)).toBe(false);
  });

  it("prepares transaction and validates custody destination in Protocol A", () => {
    const result = FdrTransactionManager.simulateProtocolA(0.005, "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug");
    expect(result.success).toBe(true);
    expect(result.destination).toBe(CUSTODY_WALLET_ADDRESS);
    expect(result.unsignedHex).toBeDefined();
  });

  it("completes signature in Protocol B", () => {
    const prep = FdrTransactionManager.simulateProtocolA(0.001, "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug");
    const signed = FdrTransactionManager.simulateProtocolB(prep.unsignedHex);
    expect(signed.success).toBe(true);
    expect(signed.signedHex).toContain("SIGNED_PSBT");
  });

  it("performs broadcast with fallback in Protocol C", () => {
    const broadcast = FdrTransactionManager.simulateProtocolC("mock_signed_hex");
    expect(broadcast.success).toBe(true);
    expect(broadcast.txid).toBeDefined();
    expect(broadcast.broadcastEndpoints.length).toBe(3);
  });
});
