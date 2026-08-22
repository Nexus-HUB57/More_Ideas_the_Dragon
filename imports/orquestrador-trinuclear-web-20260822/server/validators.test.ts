import { describe, expect, it } from "vitest";
import {
  isValidBindCodeFormat,
  extractCodeFromFormat,
  generateBindCode,
  formatBindCode,
  isUniqueBindCode,
  isBindCodeExpired,
  isValidNucleusId,
  isValidNucleusName,
} from "./validators";

describe("Bind Code Validators", () => {
  describe("isValidBindCodeFormat", () => {
    it("should validate correct format", () => {
      expect(isValidBindCodeFormat(":bind QVGnofS9wuEMZACYJqVWJm")).toBe(true);
      expect(isValidBindCodeFormat(":bind ABC123")).toBe(true);
      expect(isValidBindCodeFormat(":bind a1b2c3")).toBe(true);
    });

    it("should reject invalid formats", () => {
      expect(isValidBindCodeFormat("bind QVGnofS9wuEMZACYJqVWJm")).toBe(false);
      expect(isValidBindCodeFormat(":bindQVGnofS9wuEMZACYJqVWJm")).toBe(false);
      expect(isValidBindCodeFormat(":bind QVGnofS9wuEMZACYJqVWJm extra")).toBe(false);
      expect(isValidBindCodeFormat(":bind")).toBe(false);
      expect(isValidBindCodeFormat("")).toBe(false);
    });

    it("should handle whitespace", () => {
      expect(isValidBindCodeFormat("  :bind ABC123  ")).toBe(true);
      expect(isValidBindCodeFormat(":bind  ABC123")).toBe(true);
    });
  });

  describe("extractCodeFromFormat", () => {
    it("should extract code correctly", () => {
      expect(extractCodeFromFormat(":bind QVGnofS9wuEMZACYJqVWJm")).toBe("QVGnofS9wuEMZACYJqVWJm");
      expect(extractCodeFromFormat(":bind ABC123")).toBe("ABC123");
      expect(extractCodeFromFormat("  :bind TEST  ")).toBe("TEST");
    });

    it("should return null for invalid formats", () => {
      expect(extractCodeFromFormat("bind ABC")).toBeNull();
      expect(extractCodeFromFormat(":bindABC")).toBeNull();
      expect(extractCodeFromFormat("")).toBeNull();
    });
  });

  describe("generateBindCode", () => {
    it("should generate code with default length", () => {
      const code = generateBindCode();
      expect(code).toHaveLength(24);
      expect(/^[a-zA-Z0-9]+$/.test(code)).toBe(true);
    });

    it("should generate code with custom length", () => {
      const code = generateBindCode(16);
      expect(code).toHaveLength(16);
      expect(/^[a-zA-Z0-9]+$/.test(code)).toBe(true);
    });

    it("should generate unique codes", () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateBindCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe("formatBindCode", () => {
    it("should format code correctly", () => {
      expect(formatBindCode("QVGnofS9wuEMZACYJqVWJm")).toBe(":bind QVGnofS9wuEMZACYJqVWJm");
      expect(formatBindCode("ABC123")).toBe(":bind ABC123");
    });
  });

  describe("isUniqueBindCode", () => {
    it("should identify unique codes", () => {
      const existingCodes = ["ABC123", "DEF456", "GHI789"];
      expect(isUniqueBindCode("XYZ999", existingCodes)).toBe(true);
    });

    it("should identify duplicate codes", () => {
      const existingCodes = ["ABC123", "DEF456", "GHI789"];
      expect(isUniqueBindCode("ABC123", existingCodes)).toBe(false);
      expect(isUniqueBindCode("DEF456", existingCodes)).toBe(false);
    });
  });

  describe("isBindCodeExpired", () => {
    it("should identify expired codes", () => {
      const pastDate = new Date(Date.now() - 1000);
      expect(isBindCodeExpired(pastDate)).toBe(true);
    });

    it("should identify active codes", () => {
      const futureDate = new Date(Date.now() + 1000);
      expect(isBindCodeExpired(futureDate)).toBe(false);
    });

    it("should handle null/undefined", () => {
      expect(isBindCodeExpired(null)).toBe(false);
      expect(isBindCodeExpired(undefined)).toBe(false);
    });
  });

  describe("isValidNucleusId", () => {
    it("should validate correct nucleus IDs", () => {
      expect(isValidNucleusId("nucleus-1")).toBe(true);
      expect(isValidNucleusId("nucleus_primary")).toBe(true);
      expect(isValidNucleusId("NUCLEUS123")).toBe(true);
    });

    it("should reject invalid nucleus IDs", () => {
      expect(isValidNucleusId("")).toBe(false);
      expect(isValidNucleusId("nucleus@invalid")).toBe(false);
      expect(isValidNucleusId("nucleus invalid")).toBe(false);
      expect(isValidNucleusId("a".repeat(256))).toBe(false);
    });
  });

  describe("isValidNucleusName", () => {
    it("should validate correct names", () => {
      expect(isValidNucleusName("Primary Nucleus")).toBe(true);
      expect(isValidNucleusName("N")).toBe(true);
    });

    it("should reject invalid names", () => {
      expect(isValidNucleusName("")).toBe(false);
      expect(isValidNucleusName("a".repeat(256))).toBe(false);
    });
  });
});
