import { describe, expect, it } from "vitest";
import { generateWifPair, isValidPrivateKeyHex, toWif } from "./wifConverter";

describe("wifConverter", () => {
  const privateKeyOne = "0000000000000000000000000000000000000000000000000000000000000001";

  it("gera o vetor conhecido WIF comprimido para a chave privada 1", () => {
    expect(toWif(privateKeyOne, true, "mainnet")).toBe(
      "KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn"
    );
  });

  it("gera o vetor conhecido WIF não comprimido para a chave privada 1", () => {
    expect(toWif(privateKeyOne, false, "mainnet")).toBe(
      "5HpHagT65TZzG1PH3CSu63k8DbpvD8s5ip4nEB3kEsreAnchuDf"
    );
  });

  it("gera o par comprimido e não comprimido", () => {
    expect(generateWifPair(privateKeyOne, "mainnet")).toEqual({
      compressed: "KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn",
      uncompressed: "5HpHagT65TZzG1PH3CSu63k8DbpvD8s5ip4nEB3kEsreAnchuDf",
    });
  });

  it("usa o prefixo de Testnet", () => {
    expect(toWif(privateKeyOne, true, "testnet")).toMatch(/^[c9]/);
  });

  it("valida exatamente 32 bytes hexadecimais", () => {
    expect(isValidPrivateKeyHex(privateKeyOne)).toBe(true);
    expect(isValidPrivateKeyHex("0".repeat(63) + "1")).toBe(true);
    expect(isValidPrivateKeyHex("z".repeat(64))).toBe(false);
    expect(isValidPrivateKeyHex("0".repeat(62))).toBe(false);
  });
});
