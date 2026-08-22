export const UNILEVEL_COMMISSION_RATES = {
  1: 10,
  2: 5,
  3: 2.5,
  4: 2.5,
} as const;

export function getUnilevelCommissionRate(level: number): number {
  return UNILEVEL_COMMISSION_RATES[level as keyof typeof UNILEVEL_COMMISSION_RATES] ?? 0;
}

export function calculateUnilevelCommission(amount: string | number, level: number): number {
  const normalizedAmount = typeof amount === "number" ? amount : Number.parseFloat(amount);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) return 0;
  return (normalizedAmount * getUnilevelCommissionRate(level)) / 100;
}
