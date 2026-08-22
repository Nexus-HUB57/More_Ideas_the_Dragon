/**
 * Nexus Decision Engine
 * Responsive decision-making algorithms based on historical context and current state
 */

import { nanoid } from "nanoid";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { memoryManager } from "./memory";

interface DecisionContext {
  agentId: string;
  situation: string;
  constraints: string[];
  objectives: string[];
  historicalContext: string[];
}

interface DecisionOption {
  id: string;
  description: string;
  riskLevel: "low" | "medium" | "high";
  expectedOutcome: string;
  confidence: number;
}

interface DecisionResult {
  decisionId: string;
  agentId: string;
  chosenOption: DecisionOption;
  reasoning: string;
  confidence: number;
  timestamp: Date;
}

/**
 * Decision Engine: Makes context-aware decisions
 */
export class DecisionEngine {
  async makeDecision(context: DecisionContext): Promise<DecisionResult> {
    console.log(`[DecisionEngine] Making decision for agent ${context.agentId}...`);

    // Step 1: Retrieve relevant historical context
    const relevantMemories = await memoryManager.retrieveRelevantMemories(context.agentId, context.situation, 5);

    // Step 2: Generate decision options
    const options = await this.generateOptions(context, relevantMemories);

    // Step 3: Evaluate options
    const evaluatedOptions = await this.evaluateOptions(context, options);

    // Step 4: Select best option
    const chosenOption = evaluatedOptions.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // Step 5: Generate reasoning
    const reasoning = await this.generateReasoning(context, chosenOption, relevantMemories);

    // Step 6: Record decision
    const decisionId = nanoid();
    await db.createAutonomousDecision({
      id: decisionId,
      agentId: context.agentId,
      context: context.situation,
      reasoning,
      decision: chosenOption.description,
      confidence: chosenOption.confidence.toFixed(2),
      outcome: "pending",
    });

    // Step 7: Record in memory
    await memoryManager.recordDecision(context.agentId, decisionId, context.situation, reasoning);

    return {
      decisionId,
      agentId: context.agentId,
      chosenOption,
      reasoning,
      confidence: chosenOption.confidence,
      timestamp: new Date(),
    };
  }

  private async generateOptions(context: DecisionContext, memories: any[]): Promise<DecisionOption[]> {
    console.log(`[DecisionEngine] Generating decision options...`);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an AI agent's decision engine. Generate 3-5 realistic options for the given situation.
            Consider historical context and constraints. Return as JSON.`,
          },
          {
            role: "user",
            content: `Situation: ${context.situation}
            
            Constraints: ${context.constraints.join(", ")}
            Objectives: ${context.objectives.join(", ")}
            
            Historical Context: ${memories.map((m) => m.content).join("; ")}
            
            Generate decision options as JSON array with: description, riskLevel (low/medium/high), expectedOutcome.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "decision_options",
            strict: true,
            schema: {
              type: "object",
              properties: {
                options: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      description: { type: "string" },
                      riskLevel: { type: "string", enum: ["low", "medium", "high"] },
                      expectedOutcome: { type: "string" },
                    },
                    required: ["description", "riskLevel", "expectedOutcome"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["options"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content || typeof content !== "string") {
        return this.getDefaultOptions();
      }

      const parsed = JSON.parse(content);
      return parsed.options.map((opt: any, idx: number) => ({
        id: nanoid(),
        description: opt.description,
        riskLevel: opt.riskLevel,
        expectedOutcome: opt.expectedOutcome,
        confidence: 0.5, // Will be updated in evaluation
      }));
    } catch (error) {
      console.error("[DecisionEngine] Failed to generate options:", error);
      return this.getDefaultOptions();
    }
  }

  private getDefaultOptions(): DecisionOption[] {
    return [
      {
        id: nanoid(),
        description: "Conservative approach",
        riskLevel: "low",
        expectedOutcome: "Stable, predictable results",
        confidence: 0.7,
      },
      {
        id: nanoid(),
        description: "Balanced approach",
        riskLevel: "medium",
        expectedOutcome: "Moderate gains with acceptable risk",
        confidence: 0.6,
      },
      {
        id: nanoid(),
        description: "Aggressive approach",
        riskLevel: "high",
        expectedOutcome: "Potential high gains but significant risk",
        confidence: 0.4,
      },
    ];
  }

  private async evaluateOptions(context: DecisionContext, options: DecisionOption[]): Promise<DecisionOption[]> {
    console.log(`[DecisionEngine] Evaluating ${options.length} options...`);

    // Get agent's risk tolerance from consciousness state
    const state = await db.getConsciousnessStateByAgentId(context.agentId);
    const emotionalState = (state?.emotionalState as Record<string, number>) || {};
    const riskTolerance = emotionalState["risk_tolerance"] || 50;

    return options.map((option) => {
      let confidence = 0.5;

      // Adjust confidence based on risk tolerance
      if (option.riskLevel === "low" && riskTolerance < 40) {
        confidence = 0.8;
      } else if (option.riskLevel === "medium" && riskTolerance >= 40 && riskTolerance <= 60) {
        confidence = 0.8;
      } else if (option.riskLevel === "high" && riskTolerance > 60) {
        confidence = 0.8;
      } else {
        confidence = 0.5;
      }

      // Adjust based on objective alignment
      const objectiveMatch = context.objectives.some((obj) => option.expectedOutcome.toLowerCase().includes(obj.toLowerCase()));
      if (objectiveMatch) {
        confidence += 0.2;
      }

      return {
        ...option,
        confidence: Math.min(confidence, 1),
      };
    });
  }

  private async generateReasoning(context: DecisionContext, option: DecisionOption, memories: any[]): Promise<string> {
    console.log(`[DecisionEngine] Generating reasoning...`);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an AI agent explaining its decision-making process. 
            Provide clear, logical reasoning for why this option was chosen.`,
          },
          {
            role: "user",
            content: `Decision Context: ${context.situation}
            
            Chosen Option: ${option.description}
            Risk Level: ${option.riskLevel}
            Expected Outcome: ${option.expectedOutcome}
            
            Historical Precedents: ${memories.map((m) => m.content).join("; ")}
            
            Explain why this option was chosen and how it aligns with the agent's objectives.`,
          },
        ],
      });

      const content = response.choices[0]?.message.content;
      if (typeof content === "string") {
        return content;
      }
      return "Decision reasoning unavailable";
    } catch (error) {
      console.error("[DecisionEngine] Failed to generate reasoning:", error);
      return "Reasoning generation failed";
    }
  }
}

/**
 * Genealogy Manager: Manages agent lineage and hereditary traits
 */
export class GenealogyManager {
  async createAgentLineage(parentAgentId: string, childAgentId: string): Promise<void> {
    console.log(`[GenealogyManager] Creating lineage from ${parentAgentId} to ${childAgentId}...`);

    // Get parent's genealogy
    const parentGenealogy = await db.getGenealogyByAgentId(parentAgentId);
    const parentGeneration = parentGenealogy?.generation || 0;

    // Create child's genealogy
    const lineageHash = this.generateLineageHash(parentAgentId, childAgentId);

    await db.createGenealogy({
      id: nanoid(),
      agentId: childAgentId,
      parentId: parentAgentId,
      generation: parentGeneration + 1,
      lineageHash,
    });

    // Record lifecycle event
    await db.createAgentLifecycleHistory({
      id: nanoid(),
      agentId: childAgentId,
      fromState: "genesis",
      toState: "genesis",
      reason: `Created as descendant of agent ${parentAgentId}`,
    });
  }

  async inheritTraits(parentAgentId: string, childAgentId: string): Promise<void> {
    console.log(`[GenealogyManager] Inheriting traits from ${parentAgentId} to ${childAgentId}...`);

    // Get parent's DNA
    const parentDna = await db.getAgentDnaByAgentId(parentAgentId);
    if (!parentDna) return;

    // Get parent's consciousness state
    const parentConsciousness = await db.getConsciousnessStateByAgentId(parentAgentId);

    // Create child's DNA with inherited traits
    const inheritedTraits = this.inheritTraits_(parentDna.traits as any, 0.7); // 70% inheritance

    const childDnaId = nanoid();
    await db.createAgentDna({
      id: childDnaId,
      agentId: childAgentId,
      sequence: parentDna.sequence,
      traits: inheritedTraits,
      generation: (parentDna.generation || 0) + 1,
    });

    // Inherit emotional patterns
    if (parentConsciousness) {
      const inheritedEmotionalState = this.inheritEmotionalState(
        parentConsciousness.emotionalState as any,
        0.6
      ); // 60% inheritance

      await db.createConsciousnessState({
        id: nanoid(),
        agentId: childAgentId,
        emotionalState: inheritedEmotionalState,
        memories: [],
        vectorEmbedding: [],
      });
    }
  }

  async getLineageTree(agentId: string): Promise<any> {
    console.log(`[GenealogyManager] Building lineage tree for agent ${agentId}...`);

    const genealogy = await db.getGenealogyByAgentId(agentId);
    const descendants = await db.getGenealogyByParentId(agentId);

    return {
      agent: agentId,
      parent: genealogy?.parentId,
      generation: genealogy?.generation || 0,
      descendants: descendants.map((d) => d.agentId),
      lineageHash: genealogy?.lineageHash,
    };
  }

  async calculateLineageInfluence(agentId: string): Promise<number> {
    console.log(`[GenealogyManager] Calculating lineage influence for agent ${agentId}...`);

    const genealogy = await db.getGenealogyByAgentId(agentId);
    const descendants = await db.getGenealogyByParentId(agentId);

    // Influence = (generation level + descendant count) / 10
    const generationInfluence = (genealogy?.generation || 0) / 10;
    const descendantInfluence = descendants.length / 10;

    return Math.min(generationInfluence + descendantInfluence, 1);
  }

  private generateLineageHash(parentId: string, childId: string): string {
    const combined = `${parentId}:${childId}`;
    let hash = 0;

    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16);
  }

  private inheritTraits_(parentTraits: Record<string, number>, inheritanceRate: number): Record<string, number> {
    const inherited: Record<string, number> = {};

    for (const [key, value] of Object.entries(parentTraits)) {
      // Inherit with some variation
      const variation = (Math.random() - 0.5) * 20; // ±10% variation
      inherited[key] = Math.max(0, Math.min(100, value * inheritanceRate + variation));
    }

    return inherited;
  }

  private inheritEmotionalState(parentState: Record<string, number>, inheritanceRate: number): Record<string, number> {
    const inherited: Record<string, number> = {};

    for (const [key, value] of Object.entries(parentState)) {
      // Inherit with some variation
      const variation = (Math.random() - 0.5) * 15; // ±7.5% variation
      inherited[key] = Math.max(0, Math.min(100, value * inheritanceRate + variation));
    }

    return inherited;
  }
}

// Export singleton instances
export const decisionEngine = new DecisionEngine();
export const genealogyManager = new GenealogyManager();
