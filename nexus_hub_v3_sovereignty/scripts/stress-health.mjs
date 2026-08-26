const url = process.env.NEXUS_SMOKE_URL ?? "http://127.0.0.1:3000/api/trpc/system.health?input=%7B%22json%22%3A%7B%22timestamp%22%3A0%7D%7D";
const concurrency = Number(process.env.STRESS_CONCURRENCY ?? 25);
const rounds = Number(process.env.STRESS_ROUNDS ?? 20);
const latencies = [];
let successes = 0;
let failures = 0;

async function request() {
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

for (let round = 0; round < rounds; round += 1) {
  await Promise.all(Array.from({ length: concurrency }, () => request()));
}

latencies.sort((a, b) => a - b);
const percentile = (p) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))] ?? 0;
const total = successes + failures;
const summary = {
  url,
  concurrency,
  rounds,
  total,
  successes,
  failures,
  successRateBps: total ? Math.round((successes / total) * 10_000) : 0,
  p50Ms: Number(percentile(0.5).toFixed(2)),
  p95Ms: Number(percentile(0.95).toFixed(2)),
  maxMs: Number((latencies[latencies.length - 1] ?? 0).toFixed(2)),
};
console.log(JSON.stringify(summary, null, 2));
if (summary.successRateBps < 9_900) process.exitCode = 1;
