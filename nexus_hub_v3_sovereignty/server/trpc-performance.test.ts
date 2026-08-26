import { describe, expect, it } from "vitest";
import { TrpcPerformanceRegistry } from "./trpc-performance";

describe("tRPC performance registry", () => {
  it("computes bounded latency and success metrics", () => {
    const registry = new TrpcPerformanceRegistry();
    registry.record({ operation: "system.health", durationMs: 10, ok: true });
    registry.record({ operation: "system.health", durationMs: 20, ok: true });
    registry.record({ operation: "system.health", durationMs: 30, ok: false });
    expect(registry.snapshot("system.health")).toMatchObject({ count: 3, errors: 1, successRateBps: 6667, p50Ms: 20, p95Ms: 30, maxMs: 30 });
  });

  it("captures rejected operations and rethrows the original error", async () => {
    const registry = new TrpcPerformanceRegistry();
    await expect(registry.observe("hub.fail", async () => { throw new Error("failure"); })).rejects.toThrow("failure");
    expect(registry.snapshot("hub.fail").errors).toBe(1);
  });

  it("retains only the configured number of samples", () => {
    const registry = new TrpcPerformanceRegistry(2);
    registry.record({ operation: "hub.list", durationMs: 5, ok: true });
    registry.record({ operation: "hub.list", durationMs: 6, ok: true });
    registry.record({ operation: "hub.list", durationMs: 7, ok: true });
    expect(registry.snapshot("hub.list").count).toBe(2);
  });
});
