import { describe, expect, it } from "vitest";
import { detectSynchronizationDrift, digestContent, validateSynchronizationManifest, type SynchronizationManifest } from "./synchronization-contract";

const digest = digestContent("nexus");
const manifest: SynchronizationManifest = {
  manifestVersion: "1.0",
  orchestratorVersion: "1.0.0",
  generatedAt: "2026-08-28T00:00:00.000Z",
  artifacts: [
    { domain: "contracts", path: "server/orchestrator-contracts.ts", version: "1.0.0", digest, owner: "fibonacci-orchestrator", dependencies: [], status: "validated" },
  ],
};

describe("synchronization contract", () => {
  it("validates a sovereign artifact manifest", () => {
    expect(validateSynchronizationManifest(manifest)).toEqual(manifest);
  });

  it("rejects duplicate or non-promotable domains", () => {
    expect(() => validateSynchronizationManifest({ ...manifest, artifacts: [manifest.artifacts[0], manifest.artifacts[0]] })).toThrow("Domínio duplicado");
    expect(() => validateSynchronizationManifest({ ...manifest, artifacts: [{ ...manifest.artifacts[0], status: "drifted" }] })).toThrow("drifted");
  });

  it("detects version and digest drift", () => {
    expect(detectSynchronizationDrift(manifest, [{ domain: "contracts", version: "2.0.0", digest }])).toEqual([{ domain: "contracts", reason: "version_drift" }]);
    expect(detectSynchronizationDrift(manifest, [{ domain: "contracts", version: "1.0.0", digest: digestContent("other") }])).toEqual([{ domain: "contracts", reason: "digest_drift" }]);
    expect(detectSynchronizationDrift(manifest, [{ domain: "nuclei", version: "1.0.0", digest }])).toEqual([{ domain: "nuclei", reason: "undeclared_domain" }]);
  });
});
