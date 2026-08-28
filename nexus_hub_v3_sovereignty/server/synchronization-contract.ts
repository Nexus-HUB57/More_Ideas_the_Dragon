import { createHash } from "node:crypto";

export const synchronizedDomains = ["parameters", "nuclei", "architecture", "containers", "protocols", "scopes", "contracts", "whitepaper"] as const;
export type SynchronizedDomain = (typeof synchronizedDomains)[number];

export type SynchronizedArtifact = {
  domain: SynchronizedDomain;
  path: string;
  version: string;
  digest: string;
  owner: "fibonacci-orchestrator";
  dependencies: string[];
  status: "declared" | "validated" | "drifted" | "blocked";
};

export type SynchronizationManifest = {
  manifestVersion: "1.0";
  orchestratorVersion: string;
  generatedAt: string;
  artifacts: SynchronizedArtifact[];
};

export function digestContent(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function validateSynchronizationManifest(manifest: SynchronizationManifest) {
  if (manifest.manifestVersion !== "1.0") throw new Error("Versão de manifesto não suportada.");
  if (!manifest.orchestratorVersion.trim()) throw new Error("Versão do Orquestrador ausente.");
  const domains = new Set<SynchronizedDomain>();
  for (const artifact of manifest.artifacts) {
    if (domains.has(artifact.domain)) throw new Error(`Domínio duplicado: ${artifact.domain}.`);
    domains.add(artifact.domain);
    if (!artifact.path.trim() || !artifact.version.trim() || !/^[a-f0-9]{64}$/.test(artifact.digest)) throw new Error(`Artefato inválido: ${artifact.domain}.`);
    if (artifact.owner !== "fibonacci-orchestrator") throw new Error(`Artefato sem owner soberano: ${artifact.domain}.`);
    if (artifact.status === "drifted" || artifact.status === "blocked") throw new Error(`Manifesto não pode ser promovido com domínio ${artifact.status}: ${artifact.domain}.`);
  }
  return manifest;
}

export type SynchronizationDrift = { domain: SynchronizedDomain; reason: "undeclared_domain" | "version_drift" | "digest_drift" };

export function detectSynchronizationDrift(manifest: SynchronizationManifest, observed: Array<Pick<SynchronizedArtifact, "domain" | "version" | "digest">>): SynchronizationDrift[] {
  validateSynchronizationManifest(manifest);
  const expected = new Map(manifest.artifacts.map((artifact) => [artifact.domain, artifact]));
  const drift: SynchronizationDrift[] = [];
  for (const artifact of observed) {
    const target = expected.get(artifact.domain);
    if (!target) { drift.push({ domain: artifact.domain, reason: "undeclared_domain" }); continue; }
    if (target.version !== artifact.version) { drift.push({ domain: artifact.domain, reason: "version_drift" }); continue; }
    if (target.digest !== artifact.digest) { drift.push({ domain: artifact.domain, reason: "digest_drift" }); }
  }
  return drift;
}
