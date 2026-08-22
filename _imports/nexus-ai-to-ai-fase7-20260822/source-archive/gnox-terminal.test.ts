import { describe, it, expect, beforeEach } from "vitest";
import { GnoxTerminal } from "./gnox-terminal";

describe("GnoxTerminal", () => {
  let terminal: GnoxTerminal;

  beforeEach(() => {
    terminal = new GnoxTerminal();
  });

  describe("Command Registry", () => {
    it("should have available commands", () => {
      const commands = terminal.getAvailableCommands();
      expect(commands.length).toBeGreaterThan(0);
    });

    it("should include mission commands", () => {
      const commands = terminal.getAvailableCommands();
      expect(commands).toContain("create_mission");
      expect(commands).toContain("list_missions");
      expect(commands).toContain("complete_mission");
      expect(commands).toContain("fail_mission");
    });

    it("should include agent commands", () => {
      const commands = terminal.getAvailableCommands();
      expect(commands).toContain("list_agents");
      expect(commands).toContain("get_agent_info");
      expect(commands).toContain("get_agent_report");
    });

    it("should include orchestration commands", () => {
      const commands = terminal.getAvailableCommands();
      expect(commands).toContain("orchestrate");
      expect(commands).toContain("get_orchestration_stats");
    });

    it("should include reward commands", () => {
      const commands = terminal.getAvailableCommands();
      expect(commands).toContain("get_reward_stats");
      expect(commands).toContain("get_transaction_history");
    });

    it("should include metrics commands", () => {
      const commands = terminal.getAvailableCommands();
      expect(commands).toContain("get_dashboard");
      expect(commands).toContain("get_mission_metrics");
    });

    it("should include system commands", () => {
      const commands = terminal.getAvailableCommands();
      expect(commands).toContain("help");
      expect(commands).toContain("status");
    });

    it("should have at least 15 commands", () => {
      const commands = terminal.getAvailableCommands();
      expect(commands.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe("Command History", () => {
    it("should initialize with empty history", async () => {
      const history = await terminal.getCommandHistory();
      expect(history).toEqual([]);
    });

    it("should clear history", async () => {
      await terminal.clearCommandHistory();
      const history = await terminal.getCommandHistory();
      expect(history).toEqual([]);
    });

    it("should respect limit parameter", async () => {
      const history = await terminal.getCommandHistory(50);
      expect(history.length).toBeLessThanOrEqual(50);
    });
  });

  describe("Help Command", () => {
    it("should provide help information", async () => {
      const result = await terminal.processCommand("help");
      expect(result.status).toBe("success");
    });
  });

  describe("Status Command", () => {
    it("should return operational status", async () => {
      const result = await terminal.processCommand("status");
      expect(result.status).toBe("success");
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown commands gracefully", async () => {
      const result = await terminal.processCommand("unknown_command_xyz");
      expect(result.status).toBe("error");
    });

    it("should handle empty input", async () => {
      const result = await terminal.processCommand("");
      expect(result).toBeDefined();
    });
  });

  describe("List Missions Command", () => {
    it("should return missions list", async () => {
      const result = await terminal.processCommand("list missions");
      expect(result.status).toBe("success");
    });
  });

  describe("List Agents Command", () => {
    it("should return agents list", async () => {
      const result = await terminal.processCommand("list agents");
      expect(result.status).toBe("success");
    });
  });

  describe("Dashboard Command", () => {
    it("should return dashboard data", async () => {
      const result = await terminal.processCommand("get dashboard");
      expect(result.status).toBe("success");
    });
  });

  describe("Orchestration Stats Command", () => {
    it("should return orchestration statistics", async () => {
      const result = await terminal.processCommand("get orchestration stats");
      expect(result.status).toBe("success");
    });
  });

  describe("Reward Stats Command", () => {
    it("should return reward statistics", async () => {
      const result = await terminal.processCommand("get reward stats");
      expect(result.status).toBe("success");
    });
  });

  describe("Mission Metrics Command", () => {
    it("should return mission metrics", async () => {
      const result = await terminal.processCommand("get mission metrics");
      expect(result.status).toBe("success");
    });
  });

  describe("Public Methods", () => {
    it("should expose getAvailableCommands", () => {
      expect(typeof terminal.getAvailableCommands).toBe("function");
    });

    it("should expose getCommandHistory", () => {
      expect(typeof terminal.getCommandHistory).toBe("function");
    });

    it("should expose clearCommandHistory", () => {
      expect(typeof terminal.clearCommandHistory).toBe("function");
    });

    it("should expose processCommand", () => {
      expect(typeof terminal.processCommand).toBe("function");
    });
  });

  describe("Command Result Structure", () => {
    it("should return result with id", async () => {
      const result = await terminal.processCommand("help");
      expect(result.id).toBeDefined();
    });

    it("should return result with command text", async () => {
      const result = await terminal.processCommand("help");
      expect(result.command).toBe("help");
    });

    it("should return result with status", async () => {
      const result = await terminal.processCommand("help");
      expect(["success", "error", "pending"]).toContain(result.status);
    });

    it("should return result with timestamp", async () => {
      const result = await terminal.processCommand("help");
      expect(result.createdAt).toBeDefined();
    });
  });
});
