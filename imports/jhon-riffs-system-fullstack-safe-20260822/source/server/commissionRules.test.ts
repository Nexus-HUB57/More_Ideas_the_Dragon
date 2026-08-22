import { describe, expect, it } from "vitest";
import {
  calculateUnilevelCommission,
  getUnilevelCommissionRate,
} from "./commissionRules";

describe("regras de comissão Unilevel", () => {
  it("retorna as taxas oficiais para os quatro níveis", () => {
    expect([1, 2, 3, 4].map(getUnilevelCommissionRate)).toEqual([10, 5, 2.5, 2.5]);
  });

  it("retorna zero para níveis fora da estrutura", () => {
    expect(getUnilevelCommissionRate(0)).toBe(0);
    expect(getUnilevelCommissionRate(5)).toBe(0);
  });

  it("calcula valores numéricos e decimais", () => {
    expect(calculateUnilevelCommission(1000, 1)).toBe(100);
    expect(calculateUnilevelCommission("99.99", 1)).toBeCloseTo(9.999, 8);
    expect(calculateUnilevelCommission(1000, 2)).toBe(50);
    expect(calculateUnilevelCommission(1000, 3)).toBe(25);
    expect(calculateUnilevelCommission(1000, 4)).toBe(25);
  });

  it("rejeita valores negativos, infinitos e não numéricos", () => {
    expect(calculateUnilevelCommission(-100, 1)).toBe(0);
    expect(calculateUnilevelCommission(Number.POSITIVE_INFINITY, 1)).toBe(0);
    expect(calculateUnilevelCommission("not-a-number", 1)).toBe(0);
  });
});
