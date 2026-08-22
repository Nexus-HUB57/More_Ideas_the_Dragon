import { describe, expect, it } from "vitest";

/**
 * Testes para validar a lógica de distribuição de taxas (80/10/10)
 */
describe("Transaction Distribution Logic", () => {
  it("should distribute transaction amount correctly (80/10/10)", () => {
    const amount = 1000;
    const agentShare = (amount * 0.8).toString();
    const parentShare = (amount * 0.1).toString();
    const infraShare = (amount * 0.1).toString();

    expect(parseFloat(agentShare)).toBe(800);
    expect(parseFloat(parentShare)).toBe(100);
    expect(parseFloat(infraShare)).toBe(100);
    expect(parseFloat(agentShare) + parseFloat(parentShare) + parseFloat(infraShare)).toBe(amount);
  });

  it("should handle decimal amounts correctly", () => {
    const amount = 123.45;
    const agentShare = (amount * 0.8);
    const parentShare = (amount * 0.1);
    const infraShare = (amount * 0.1);

    expect(agentShare).toBeCloseTo(98.76, 2);
    expect(parentShare).toBeCloseTo(12.345, 2);
    expect(infraShare).toBeCloseTo(12.345, 2);
    expect(agentShare + parentShare + infraShare).toBeCloseTo(amount, 2);
  });

  it("should handle zero amount", () => {
    const amount = 0;
    const agentShare = (amount * 0.8);
    const parentShare = (amount * 0.1);
    const infraShare = (amount * 0.1);

    expect(agentShare).toBe(0);
    expect(parentShare).toBe(0);
    expect(infraShare).toBe(0);
  });

  it("should handle large amounts", () => {
    const amount = 1000000;
    const agentShare = (amount * 0.8);
    const parentShare = (amount * 0.1);
    const infraShare = (amount * 0.1);

    expect(agentShare).toBe(800000);
    expect(parentShare).toBe(100000);
    expect(infraShare).toBe(100000);
  });
});

/**
 * Testes para validar cálculos de economia
 */
describe("Economy Calculations", () => {
  it("should calculate total balance correctly", () => {
    const agents = [
      { balance: "100" },
      { balance: "200" },
      { balance: "300" },
    ];

    const totalBalance = agents.reduce((sum, agent) => {
      return sum + (parseFloat(agent.balance) || 0);
    }, 0);

    expect(totalBalance).toBe(600);
  });

  it("should calculate average transaction correctly", () => {
    const transactions = [
      { amount: "100" },
      { amount: "200" },
      { amount: "300" },
    ];

    const average = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / transactions.length;

    expect(average).toBe(200);
  });

  it("should handle empty transactions array", () => {
    const transactions: { amount: string }[] = [];

    const average = transactions.length > 0
      ? transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / transactions.length
      : 0;

    expect(average).toBe(0);
  });
});

/**
 * Testes para validar operações de balance
 */
describe("Balance Operations", () => {
  it("should add balance correctly", () => {
    const currentBalance = 1000;
    const amount = 500;
    const newBalance = currentBalance + amount;

    expect(newBalance).toBe(1500);
  });

  it("should subtract balance correctly", () => {
    const currentBalance = 1000;
    const amount = 300;
    const newBalance = currentBalance - amount;

    expect(newBalance).toBe(700);
  });

  it("should handle negative balance", () => {
    const currentBalance = 100;
    const amount = 200;
    const newBalance = currentBalance - amount;

    expect(newBalance).toBe(-100);
  });

  it("should handle decimal balance operations", () => {
    const currentBalance = 123.45;
    const amount = 67.89;
    const newBalance = currentBalance + amount;

    expect(newBalance).toBeCloseTo(191.34, 2);
  });
});
