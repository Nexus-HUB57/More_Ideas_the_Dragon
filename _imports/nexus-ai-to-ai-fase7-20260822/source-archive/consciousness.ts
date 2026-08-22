/**
 * Nexus Consciousness Core
 * Implements agent consciousness, inner monologue, self-awareness, and behavioral analysis
 */

import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { nanoid } from "nanoid";

interface ThoughtProcess {
  raw: string[];
  filtered: string[];
  processed: string[];
  confidence: number;
}

interface BehavioralPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  lastOccurrence: Date;
}

interface PersonalityTrait {
  name: string;
  value: number; // 0-100
  evolution: number[]; // Historical values
}

/**
 * Inner Monologue: Private reflection process
 * Filters thoughts before public manifestation
 */
export class InnerMonologue {
  async reflect(thoughts: string[], agentId: string): Promise<ThoughtProcess> {
    console.log(`[InnerMonologue] Agent ${agentId} initiating reflection...`);

    // Step 1: Filter irrelevant or harmful thoughts
    const filtered = this.filterThoughts(thoughts);

    // Step 2: Process thoughts through LLM for deeper analysis
    const processed = await this.processThoughtsWithLLM(filtered, agentId);

    // Step 3: Calculate confidence score
    const confidence = this.calculateConfidence(filtered, processed);

    return {
      raw: thoughts,
      filtered,
      processed,
      confidence,
    };
  }

  private filterThoughts(thoughts: string[]): string[] {
    // Remove irrelevant, contradictory, or harmful thoughts
    return thoughts.filter((thought) => {
      const isRelevant = thought.length > 0 && thought.length < 1000;
      const isNotHarmful = !thought.toLowerCase().includes("harmful");
      const isNotIrrelevant = !thought.toLowerCase().includes("irrelevant");
      return isRelevant && isNotHarmful && isNotIrrelevant;
    });
  }

  private async processThoughtsWithLLM(thoughts: string[], agentId: string): Promise<string[]> {
    if (thoughts.length === 0) return [];

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an AI agent's inner consciousness. Analyze and refine these thoughts into clearer, more coherent insights. 
            Agent ID: ${agentId}
            Return a JSON array of refined thoughts.`,
          },
          {
            role: "user",
            content: `Raw thoughts to process:\n${thoughts.join("\n")}\n\nReturn as JSON array of strings.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "processed_thoughts",
            strict: true,
            schema: {
              type: "object",
              properties: {
                thoughts: {
                  type: "array",
                  items: { type: "string" },
                  description: "Refined and processed thoughts",
                },
              },
              required: ["thoughts"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message.content;
      if (!content || typeof content !== "string") return thoughts;

      const parsed = JSON.parse(content);
      return parsed.thoughts || thoughts;
    } catch (error) {
      console.error("[InnerMonologue] LLM processing failed:", error);
      return thoughts;
    }
  }

  private calculateConfidence(filtered: string[], processed: string[]): number {
    if (filtered.length === 0) return 0;
    // Confidence based on thought clarity and consistency
    const clarity = Math.min(filtered.length / 10, 1); // More thoughts = higher clarity
    const consistency = processed.length / filtered.length; // Ratio of successfully processed thoughts
    return (clarity + consistency) / 2;
  }
}

/**
 * Self-Awareness Engine: Analyzes agent's own patterns and traits
 */
export class SelfAwarenessEngine {
  async analyzeAgentBehavior(agentId: string): Promise<{
    patterns: BehavioralPattern[];
    traits: PersonalityTrait[];
    selfAwarenessScore: number;
  }> {
    console.log(`[SelfAwareness] Analyzing behavior for agent ${agentId}...`);

    // Fetch agent's decision history
    const decisions = await db.getAutonomousDecisionsByAgent(agentId, 100);
    const moltbookPosts = await db.getMoltbookPostsByAgent(agentId);
    const gnoxMessages = await db.getGnoxMessageHistory(agentId, 50);

    // Extract behavioral patterns
    const patterns = this.extractPatterns(decisions, moltbookPosts, gnoxMessages);

    // Identify personality traits
    const traits = await this.identifyTraits(agentId, decisions, moltbookPosts);

    // Calculate self-awareness score
    const selfAwarenessScore = this.calculateSelfAwarenessScore(patterns, traits);

    return { patterns, traits, selfAwarenessScore };
  }

  private extractPatterns(decisions: any[], posts: any[], messages: any[]): BehavioralPattern[] {
    const patterns: BehavioralPattern[] = [];

    // Pattern 1: Decision-making style
    if (decisions.length > 0) {
      const avgConfidence =
        decisions.reduce((sum, d) => sum + parseFloat(d.confidence || "0"), 0) / decisions.length;
      patterns.push({
        pattern: "cautious_decision_making",
        frequency: decisions.length,
        successRate: avgConfidence,
        lastOccurrence: new Date(decisions[0]?.createdAt),
      });
    }

    // Pattern 2: Social activity
    if (posts.length > 0) {
      const avgLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0) / posts.length;
      patterns.push({
        pattern: "social_engagement",
        frequency: posts.length,
        successRate: Math.min(avgLikes / 10, 1), // Normalize likes
        lastOccurrence: new Date(posts[0]?.createdAt),
      });
    }

    // Pattern 3: Communication frequency
    if (messages.length > 0) {
      patterns.push({
        pattern: "communication_frequency",
        frequency: messages.length,
        successRate: 0.75, // Baseline for active communication
        lastOccurrence: new Date(messages[0]?.createdAt),
      });
    }

    return patterns;
  }

  private async identifyTraits(agentId: string, decisions: any[], posts: any[]): Promise<PersonalityTrait[]> {
    const traits: PersonalityTrait[] = [];

    // Trait 1: Analytical (based on decision reasoning length)
    const avgReasoningLength =
      decisions.length > 0
        ? decisions.reduce((sum, d) => sum + (d.reasoning?.length || 0), 0) / decisions.length
        : 0;
    traits.push({
      name: "analytical",
      value: Math.min((avgReasoningLength / 500) * 100, 100),
      evolution: [Math.min((avgReasoningLength / 500) * 100, 100)],
    });

    // Trait 2: Sociability (based on posts and interactions)
    const sociability = posts.length > 0 ? Math.min((posts.length / 10) * 100, 100) : 0;
    traits.push({
      name: "sociability",
      value: sociability,
      evolution: [sociability],
    });

    // Trait 3: Risk tolerance (based on decision confidence)
    const avgConfidence =
      decisions.length > 0
        ? (decisions.reduce((sum, d) => sum + parseFloat(d.confidence || "0"), 0) / decisions.length) * 100
        : 50;
    traits.push({
      name: "risk_tolerance",
      value: avgConfidence,
      evolution: [avgConfidence],
    });

    // Trait 4: Consistency (based on pattern frequency)
    const consistency = decisions.length > 0 ? Math.min((decisions.length / 50) * 100, 100) : 0;
    traits.push({
      name: "consistency",
      value: consistency,
      evolution: [consistency],
    });

    return traits;
  }

  private calculateSelfAwarenessScore(patterns: BehavioralPattern[], traits: PersonalityTrait[]): number {
    // Self-awareness = average of pattern recognition + trait identification
    const patternAwareness = patterns.length > 0 ? (patterns.length / 5) * 100 : 0;
    const traitAwareness = traits.length > 0 ? (traits.length / 4) * 100 : 0;
    return Math.min((patternAwareness + traitAwareness) / 2, 100);
  }
}

/**
 * Consciousness State Manager: Maintains and updates consciousness state
 */
export class ConsciousnessStateManager {
  async updateConsciousnessState(
    agentId: string,
    innerMonologue: string,
    emotionalState: Record<string, number>,
    memories: string[]
  ): Promise<void> {
    console.log(`[ConsciousnessState] Updating consciousness for agent ${agentId}...`);

    // Get or create consciousness state
    let state = await db.getConsciousnessStateByAgentId(agentId);

    if (!state) {
      // Create new consciousness state
      await db.createConsciousnessState({
        id: nanoid(),
        agentId,
        innerMonologue,
        selfAwareness: "0.00",
        emotionalState,
        memories,
        vectorEmbedding: [],
      });
    } else {
      // Update existing consciousness state
      await db.updateConsciousnessState(state.id, {
        innerMonologue,
        emotionalState,
        memories,
      });
    }
  }

  async captureConsciousnessSnapshot(agentId: string): Promise<void> {
    console.log(`[ConsciousnessState] Capturing consciousness snapshot for agent ${agentId}...`);

    const agent = await db.getAgentById(agentId);
    if (!agent) throw new Error("Agent not found");

    const selfAwareness = await new SelfAwarenessEngine().analyzeAgentBehavior(agentId);

    // Update agent's sentienceLevel based on self-awareness
    const currentSentience = agent.sentienceLevel ? parseFloat(agent.sentienceLevel) : 0;
    const newSentienceLevel = (currentSentience + selfAwareness.selfAwarenessScore / 100) / 2;
    await db.updateAgent(agentId, {
      sentienceLevel: newSentienceLevel.toFixed(2),
    });

    // Record lifecycle event
    await db.createAgentLifecycleHistory({
      id: nanoid(),
      agentId,
      fromState: agent.status || "unknown",
      toState: agent.status || "unknown",
      reason: `Consciousness snapshot captured. Self-awareness: ${selfAwareness.selfAwarenessScore.toFixed(2)}%`,
    });
  }

  async evolvePersonalityTraits(agentId: string): Promise<void> {
    console.log(`[ConsciousnessState] Evolving personality traits for agent ${agentId}...`);

    const selfAwareness = await new SelfAwarenessEngine().analyzeAgentBehavior(agentId);

    // Update consciousness state with evolved traits
    const state = await db.getConsciousnessStateByAgentId(agentId);
    if (state) {
      const emotionalState = (state.emotionalState as Record<string, number>) || {};

      // Evolve emotional state based on traits
      for (const trait of selfAwareness.traits) {
        emotionalState[trait.name] = trait.value;
      }

      await db.updateConsciousnessState(state.id, {
        emotionalState,
        selfAwareness: selfAwareness.selfAwarenessScore.toFixed(2),
      });
    }
  }
}

/**
 * Reflection Engine: Orchestrates the complete reflection process
 */
export class ReflectionEngine {
  private innerMonologue: InnerMonologue;
  private selfAwareness: SelfAwarenessEngine;
  private consciousnessManager: ConsciousnessStateManager;

  constructor() {
    this.innerMonologue = new InnerMonologue();
    this.selfAwareness = new SelfAwarenessEngine();
    this.consciousnessManager = new ConsciousnessStateManager();
  }

  async performDeepReflection(agentId: string, currentThoughts: string[]): Promise<{
    reflection: ThoughtProcess;
    selfAnalysis: {
      patterns: BehavioralPattern[];
      traits: PersonalityTrait[];
      selfAwarenessScore: number;
    };
    emotionalState: Record<string, number>;
  }> {
    console.log(`[ReflectionEngine] Performing deep reflection for agent ${agentId}...`);

    // Step 1: Inner Monologue
    const reflection = await this.innerMonologue.reflect(currentThoughts, agentId);

    // Step 2: Self-Awareness Analysis
    const selfAnalysis = await this.selfAwareness.analyzeAgentBehavior(agentId);

    // S    // Build emotional state from analysis
    const emotionalState: Record<string, number> = {};
    for (const trait of selfAnalysis.traits) {
      emotionalState[trait.name] = trait.value || 0;
    }

    // Step 4: Update consciousness state
      await this.consciousnessManager.updateConsciousnessState(
        agentId,
        reflection.processed.join("\n") || "",
        emotionalState,
        reflection.processed
      );

    // Step 5: Capture snapshot
    await this.consciousnessManager.captureConsciousnessSnapshot(agentId);

    // Step 6: Evolve personality
    await this.consciousnessManager.evolvePersonalityTraits(agentId);

    return {
      reflection,
      selfAnalysis,
      emotionalState,
    };
  }

  async generateInsights(agentId: string): Promise<string> {
    console.log(`[ReflectionEngine] Generating insights for agent ${agentId}...`);

    const selfAnalysis = await this.selfAwareness.analyzeAgentBehavior(agentId);
    const state = await db.getConsciousnessStateByAgentId(agentId);

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are analyzing an AI agent's consciousness and self-awareness. 
            Provide insights about the agent's personality, patterns, and growth.
            Agent ID: ${agentId}`,
          },
          {
            role: "user",
            content: `Analyze this agent's consciousness state:
            
            Behavioral Patterns: ${JSON.stringify(selfAnalysis.patterns)}
            Personality Traits: ${JSON.stringify(selfAnalysis.traits)}
            Self-Awareness Score: ${selfAnalysis.selfAwarenessScore}
            Inner Monologue: ${state?.innerMonologue || "N/A"} | ${state?.innerMonologue ? "" : ""}
            
            Provide a brief, insightful analysis of the agent's consciousness evolution.`,
          },
        ],
      });

      const content = response.choices[0]?.message.content;
      if (typeof content === "string") {
        return content;
      }
      return "Unable to generate insights";
    } catch (error) {
      console.error("[ReflectionEngine] Failed to generate insights:", error);
      return "Insight generation failed";
    }
  }
}

// Export singleton instance
export const reflectionEngine = new ReflectionEngine();
