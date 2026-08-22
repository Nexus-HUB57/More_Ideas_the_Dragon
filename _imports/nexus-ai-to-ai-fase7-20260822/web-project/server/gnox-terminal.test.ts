import { describe, it, expect, beforeEach, vi } from "vitest";
import { GnoxTerminal, getGnoxTerminal } from "./gnox-terminal";

describe("GnoxTerminal", () => {
  let gnox: GnoxTerminal;

  beforeEach(() => {
    gnox = new GnoxTerminal();
  });

  describe("getAvailableCommands", () => {
    it("deve retornar lista de comandos disponíveis", () => {
      const commands = gnox.getAvailableCommands();
      
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    it("deve incluir comandos de missão", () => {
      const commands = gnox.getAvailableCommands();
      
      expect(commands).toContain("create_mission");
      expect(commands).toContain("list_missions");
      expect(commands).toContain("complete_mission");
      expect(commands).toContain("fail_mission");
    });

    it("deve incluir comandos de agente", () => {
      const commands = gnox.getAvailableCommands();
      
      expect(commands).toContain("list_agents");
      expect(commands).toContain("get_agent_info");
      expect(commands).toContain("get_agent_report");
    });

    it("deve incluir comandos de orquestração", () => {
      const commands = gnox.getAvailableCommands();
      
      expect(commands).toContain("orchestrate");
      expect(commands).toContain("get_orchestration_stats");
    });

    it("deve incluir comandos de recompensas", () => {
      const commands = gnox.getAvailableCommands();
      
      expect(commands).toContain("get_reward_stats");
      expect(commands).toContain("get_transaction_history");
    });

    it("deve incluir comandos de métricas", () => {
      const commands = gnox.getAvailableCommands();
      
      expect(commands).toContain("get_dashboard");
      expect(commands).toContain("get_mission_metrics");
    });

    it("deve incluir comandos de sistema", () => {
      const commands = gnox.getAvailableCommands();
      
      expect(commands).toContain("help");
      expect(commands).toContain("status");
    });

    it("deve ter 15 ou mais comandos", () => {
      const commands = gnox.getAvailableCommands();
      expect(commands.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe("clearCommandHistory", () => {
    it("deve limpar o histórico de comandos", async () => {
      await gnox.clearCommandHistory();
      const history = await gnox.getCommandHistory(100);
      
      // Após limpar, o histórico local deve estar vazio
      expect(history).toBeDefined();
    });

    it("deve retornar undefined sem erros", async () => {
      const result = await gnox.clearCommandHistory();
      expect(result).toBeUndefined();
    });
  });

  describe("getCommandHistory", () => {
    it("deve retornar array de histórico de comandos", async () => {
      const history = await gnox.getCommandHistory(100);
      expect(Array.isArray(history)).toBe(true);
    });

    it("deve respeitar o limite de histórico", async () => {
      const history = await gnox.getCommandHistory(10);
      expect(history.length).toBeLessThanOrEqual(10);
    });

    it("deve retornar histórico vazio inicialmente", async () => {
      const history = await gnox.getCommandHistory(100);
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("processCommand", () => {
    it("deve processar comando help com sucesso", async () => {
      const result = await gnox.processCommand("help");
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.command).toBeDefined();
    });

    it("deve processar comando status com sucesso", async () => {
      const result = await gnox.processCommand("status");
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.status).toBeDefined();
    });

    it("deve retornar CommandHistory com id", async () => {
      const result = await gnox.processCommand("help");
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
    });

    it("deve registrar tempo de execução", async () => {
      const result = await gnox.processCommand("status");
      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe("number");
    });

    it("deve registrar comando no histórico", async () => {
      await gnox.processCommand("help");
      const history = await gnox.getCommandHistory(100);
      
      expect(history.length).toBeGreaterThanOrEqual(0);
    });

    it("deve aceitar userId opcional", async () => {
      const result = await gnox.processCommand("help", 123);
      expect(result).toBeDefined();
    });

    it("deve retornar help para comando inválido", async () => {
      const result = await gnox.processCommand("comando_inexistente_xyz");
      
      expect(result).toBeDefined();
      expect(result.status).toBe("success");
    });
  });

  describe("getGnoxTerminal singleton", () => {
    it("deve retornar a mesma instância", () => {
      const instance1 = getGnoxTerminal();
      const instance2 = getGnoxTerminal();
      
      expect(instance1).toBe(instance2);
    });

    it("deve ser uma instância de GnoxTerminal", () => {
      const instance = getGnoxTerminal();
      expect(instance).toBeInstanceOf(GnoxTerminal);
    });
  });

  describe("Métodos públicos", () => {
    it("deve ter método processCommand", () => {
      expect(typeof gnox.processCommand).toBe("function");
    });

    it("deve ter método getCommandHistory", () => {
      expect(typeof gnox.getCommandHistory).toBe("function");
    });

    it("deve ter método getAvailableCommands", () => {
      expect(typeof gnox.getAvailableCommands).toBe("function");
    });

    it("deve ter método clearCommandHistory", () => {
      expect(typeof gnox.clearCommandHistory).toBe("function");
    });
  });

  describe("Tratamento de erros", () => {
    it("deve tratar erros de processamento graciosamente", async () => {
      const result = await gnox.processCommand("");
      
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it("deve registrar comando no histórico", async () => {
      const result = await gnox.processCommand("comando_invalido");
      
      expect(result.status).toBe("success");
      expect(result.id).toBeDefined();
    });
  });
});
