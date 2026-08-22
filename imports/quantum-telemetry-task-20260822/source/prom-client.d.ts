declare module 'prom-client' {
  export class Registry {
    collectDefaultMetrics(options?: any): void;
    metrics(): Promise<string>;
  }
  export class Counter {
    constructor(config: any);
    inc(value?: number): void;
  }
  export class Gauge {
    constructor(config: any);
    set(value: number): void;
    inc(value?: number): void;
    dec(value?: number): void;
  }
  export class Histogram {
    constructor(config: any);
    observe(value: number): void;
  }
  export function collectDefaultMetrics(options?: any): void;
}
