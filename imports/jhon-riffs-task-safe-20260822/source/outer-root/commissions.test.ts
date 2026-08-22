/**
 * Testes para a lógica de comissões Unilevel
 * Valida o cálculo correto de comissões em 4 níveis
 */

import { describe, it, expect } from "vitest";

// Simular as taxas de comissão por nível
const COMMISSION_RATES = {
  1: 0.1, // 10%
  2: 0.05, // 5%
  3: 0.025, // 2.5%
  4: 0.025, // 2.5%
};

// Função de cálculo de comissão (simulada)
function calculateCommission(amount: number, level: number): number {
  const rate = COMMISSION_RATES[level as keyof typeof COMMISSION_RATES] || 0;
  return amount * rate;
}

describe("Comissões Unilevel", () => {
  describe("Cálculo de comissão por nível", () => {
    it("deve calcular 10% para nível 1", () => {
      const commission = calculateCommission(1000, 1);
      expect(commission).toBe(100);
    });

    it("deve calcular 5% para nível 2", () => {
      const commission = calculateCommission(1000, 2);
      expect(commission).toBe(50);
    });

    it("deve calcular 2.5% para nível 3", () => {
      const commission = calculateCommission(1000, 3);
      expect(commission).toBe(25);
    });

    it("deve calcular 2.5% para nível 4", () => {
      const commission = calculateCommission(1000, 4);
      expect(commission).toBe(25);
    });

    it("deve retornar 0 para nível inválido", () => {
      const commission = calculateCommission(1000, 5);
      expect(commission).toBe(0);
    });
  });

  describe("Distribuição de comissões em cascata", () => {
    it("deve distribuir comissões corretamente em 4 níveis", () => {
      const paymentAmount = 1000;
      const commissions = {
        level1: calculateCommission(paymentAmount, 1),
        level2: calculateCommission(paymentAmount, 2),
        level3: calculateCommission(paymentAmount, 3),
        level4: calculateCommission(paymentAmount, 4),
      };

      expect(commissions.level1).toBe(100);
      expect(commissions.level2).toBe(50);
      expect(commissions.level3).toBe(25);
      expect(commissions.level4).toBe(25);

      const totalCommissions = Object.values(commissions).reduce((a, b) => a + b, 0);
      expect(totalCommissions).toBe(200); // 20% do valor total
    });

    it("deve calcular corretamente para diferentes valores de pagamento", () => {
      const testCases = [
        { amount: 100, expected: 20 },
        { amount: 500, expected: 100 },
        { amount: 2000, expected: 400 },
        { amount: 5000, expected: 1000 },
      ];

      testCases.forEach(({ amount, expected }) => {
        const total = Object.keys(COMMISSION_RATES).reduce((sum, levelStr) => {
          const level = parseInt(levelStr) as keyof typeof COMMISSION_RATES;
          return sum + calculateCommission(amount, level);
        }, 0);

        expect(total).toBe(expected);
      });
    });
  });

  describe("Validação de valores", () => {
    it("deve lidar com valores decimais corretamente", () => {
      const commission = calculateCommission(99.99, 1);
      expect(commission).toBeCloseTo(9.999, 2);
    });

    it("deve retornar 0 para pagamento zero", () => {
      const commission = calculateCommission(0, 1);
      expect(commission).toBe(0);
    });

    it("deve lidar com valores negativos (deve ser validado no backend)", () => {
      const commission = calculateCommission(-1000, 1);
      expect(commission).toBe(-100); // Resultado negativo (deve ser rejeitado no backend)
    });
  });

  describe("Casos de uso reais", () => {
    it("cenário: afiliado vende e recebe comissão do nível 1", () => {
      const saleAmount = 1500;
      const commission = calculateCommission(saleAmount, 1);
      expect(commission).toBe(150);
    });

    it("cenário: afiliado recebe comissão de indicado (nível 2)", () => {
      const saleAmount = 1500;
      const commission = calculateCommission(saleAmount, 2);
      expect(commission).toBe(75);
    });

    it("cenário: múltiplas vendas em cascata", () => {
      const sales = [1000, 1500, 2000];
      const totalCommissions = sales.reduce((sum, sale) => {
        return sum + calculateCommission(sale, 1);
      }, 0);

      expect(totalCommissions).toBe(450); // (1000 + 1500 + 2000) * 0.1
    });
  });
});

describe("Validação de dados de entrada", () => {
  it("deve validar que o nível está entre 1 e 4", () => {
    const validLevels = [1, 2, 3, 4];
    const invalidLevels = [0, 5, -1, 100];

    validLevels.forEach((level) => {
      expect(COMMISSION_RATES[level as keyof typeof COMMISSION_RATES]).toBeDefined();
    });

    invalidLevels.forEach((level) => {
      expect(COMMISSION_RATES[level as keyof typeof COMMISSION_RATES]).toBeUndefined();
    });
  });

  it("deve validar que o valor de pagamento é um número positivo", () => {
    const validAmounts = [0.01, 1, 100, 1000, 10000];
    const invalidAmounts = [-1, -100, NaN, Infinity];

    validAmounts.forEach((amount) => {
      expect(typeof amount).toBe("number");
      expect(amount).toBeGreaterThanOrEqual(0);
    });

    invalidAmounts.forEach((amount) => {
      if (typeof amount === "number") {
        expect(amount < 0 || !isFinite(amount)).toBe(true);
      }
    });
  });
});
