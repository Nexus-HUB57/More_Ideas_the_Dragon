import { beforeEach, describe, expect, it, vi } from "vitest";

const { notifyOwnerMock } = vi.hoisted(() => ({ notifyOwnerMock: vi.fn() }));
vi.mock("./_core/notification", () => ({ notifyOwner: notifyOwnerMock }));

import { alertCriticalAgent, alertLargeTransaction, alertSystemAnomaly } from "./criticalAlerts";

describe("critical alerts", () => {
  beforeEach(() => notifyOwnerMock.mockReset().mockResolvedValue(true));

  it("does not alert healthy agents", async () => {
    await expect(alertCriticalAgent({ agentId: "a1", health: 80, energy: 70, creativity: 90 })).resolves.toBe(false);
    expect(notifyOwnerMock).not.toHaveBeenCalled();
  });

  it("alerts when one vital crosses the critical threshold", async () => {
    await expect(alertCriticalAgent({ agentId: "a1", agentName: "Pulse", health: 24, energy: 72, creativity: 81 })).resolves.toBe(true);
    expect(notifyOwnerMock).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining("crítico") }));
  });

  it("alerts only transactions above the configured threshold", async () => {
    await expect(alertLargeTransaction({ transactionId: "tx-1", amount: "1000", threshold: "1000", senderId: "a", recipientId: "b" })).resolves.toBe(false);
    await expect(alertLargeTransaction({ transactionId: "tx-2", amount: "1001", threshold: "1000", senderId: "a", recipientId: "b" })).resolves.toBe(true);
    expect(notifyOwnerMock).toHaveBeenCalledTimes(1);
  });

  it("forwards an anomaly with an owner-facing notification", async () => {
    await expect(alertSystemAnomaly("Ledger drift detected")).resolves.toBe(true);
    expect(notifyOwnerMock).toHaveBeenCalledWith({ title: "Nexus Hub · anomalia detectada", content: "Ledger drift detected" });
  });
});
