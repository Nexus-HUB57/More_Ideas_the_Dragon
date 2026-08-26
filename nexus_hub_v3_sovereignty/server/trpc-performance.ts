export type LatencySample = { operation: string; durationMs: number; ok: boolean; at: string };

export type LatencySnapshot = {
  operation: string;
  count: number;
  errors: number;
  successRateBps: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
};

export class TrpcPerformanceRegistry {
  private readonly samples = new Map<string, LatencySample[]>();
  constructor(private readonly maxSamplesPerOperation = 1_000) {}

  record(sample: Omit<LatencySample, "at">) {
    if (!Number.isFinite(sample.durationMs) || sample.durationMs < 0) throw new Error("Duração de latência inválida.");
    const items = this.samples.get(sample.operation) ?? [];
    items.push({ ...sample, at: new Date().toISOString() });
    if (items.length > this.maxSamplesPerOperation) items.splice(0, items.length - this.maxSamplesPerOperation);
    this.samples.set(sample.operation, items);
  }

  observe<T>(operation: string, task: () => Promise<T>) {
    const started = performance.now();
    return task().then((value) => {
      this.record({ operation, durationMs: performance.now() - started, ok: true });
      return value;
    }).catch((error) => {
      this.record({ operation, durationMs: performance.now() - started, ok: false });
      throw error;
    });
  }

  snapshot(operation: string): LatencySnapshot {
    const samples = this.samples.get(operation) ?? [];
    const durations = samples.map((sample) => sample.durationMs).sort((a, b) => a - b);
    const percentile = (p: number) => durations[Math.min(durations.length - 1, Math.floor(durations.length * p))] ?? 0;
    const errors = samples.filter((sample) => !sample.ok).length;
    return {
      operation,
      count: samples.length,
      errors,
      successRateBps: samples.length ? Math.round(((samples.length - errors) / samples.length) * 10_000) : 0,
      p50Ms: Number(percentile(0.5).toFixed(2)),
      p95Ms: Number(percentile(0.95).toFixed(2)),
      maxMs: Number((durations[durations.length - 1] ?? 0).toFixed(2)),
    };
  }

  listSnapshots() {
    const operations: string[] = [];
    this.samples.forEach((_samples, operation) => operations.push(operation));
    return operations.sort().map((operation) => this.snapshot(operation));
  }
}

export const trpcPerformance = new TrpcPerformanceRegistry();
