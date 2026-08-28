import { initialAutonomyState } from "../server/fibonacci-autonomy";
import { preflightIntent } from "../server/orchestrator-protocol";

const url = process.env.NEXUS_SMOKE_URL ?? "http://127.0.0.1:3000/api/trpc/system.health?input=%7B%22json%22%3A%7B%22timestamp%22%3A0%7D%7D";
const totalRequests = Number(process.env.STRESS_TOTAL ?? 10_000);
const concurrency = Number(process.env.STRESS_CONCURRENCY ?? 250);
const autonomyLevel = initialAutonomyState();
const latencies: number[] = [];
let successes = 0;
let failures = 0;
let fibonacciBlocks = 0;

if (!Number.isInteger(totalRequests) || totalRequests < 1 || totalRequests > 100_000) throw new Error("STRESS_TOTAL deve estar entre 1 e 100000.");
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > totalRequests) throw new Error("STRESS_CONCURRENCY inválida.");

async function request(index: number) {
  const intent = preflightIntent({
    missionId: index + 1,
    objective: "stress health path",
    owner: "stress-runner",
    autonomy: "execute_reversible",
    risk: "low",
    budgetUnits: 1,
    externalSideEffect: false,
    description: "read-only health request",
    status: "review",
  }, autonomyLevel);
  if (intent.outcome !== "ready") { fibonacciBlocks += 1; return; }
  const started = performance.now();
  try {
    const response = await fetch(url);
    const body = await response.text();
    if (!response.ok || !body.includes('"ok":true')) throw new Error(`HTTP ${response.status}`);
    successes += 1;
  } catch (error) {
    failures += 1;
    if (failures <= 3) console.error(`request failure: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    latencies.push(performance.now() - started);
  }
}

const startedAt = performance.now();
for (let offset = 0; offset < totalRequests; offset += concurrency) {
  const size = Math.min(concurrency, totalRequests - offset);
  await Promise.all(Array.from({ length: size }, (_, index) => request(offset + index)));
}
latencies.sort((a, b) => a - b);
const percentile = (p: number) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))] ?? 0;
const durationMs = performance.now() - startedAt;
const attempted = successes + failures;
const summary = {
  url,
  totalRequests,
  concurrency,
  fibonacciLevel: autonomyLevel.level,
  fibonacciDose: autonomyLevel.dose,
  fibonacciBlocks,
  attempted,
  successes,
  failures,
  successRateBps: attempted ? Math.round((successes / attempted) * 10_000) : 0,
  p50Ms: Number(percentile(0.5).toFixed(2)),
  p95Ms: Number(percentile(0.95).toFixed(2)),
  maxMs: Number((latencies[latencies.length - 1] ?? 0).toFixed(2)),
  durationMs: Number(durationMs.toFixed(2)),
  throughputRps: Number((attempted / (durationMs / 1_000)).toFixed(2)),
};
console.log(JSON.stringify(summary, null, 2));
if (fibonacciBlocks > 0 || summary.successRateBps < 9_900) process.exitCode = 1;
