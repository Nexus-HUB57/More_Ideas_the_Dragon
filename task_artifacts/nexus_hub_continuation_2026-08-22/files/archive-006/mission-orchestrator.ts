import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { missions, ecosystemMetrics } from "../drizzle/schema";
import { desc } from "drizzle-orm";

export interface MissionContext {
  ecosystemHealth: number;
  activeAgents: number;
  averageSenciencia: number;
  marketSentiment: string;
  recentTransactions: number;
  harmonyIndex: number;
}

export interface GeneratedMission {
  missionId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  reward: number;
  requiredSpecialization?: string;
  estimatedDuration?: number;
  context: MissionContext;
}

/**
 * Generate proactive missions based on ecosystem context using LLM
 */
export async function generateProactiveMissions(
  context: MissionContext,
  count: number = 3
): Promise<GeneratedMission[]> {
  const prompt = buildMissionPrompt(context, count);

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a quantum mission orchestrator for autonomous AI agents. Generate diverse missions aligned with ecosystem state.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== "string") {
      return generateFallbackMissions(context, count);
    }

    const generatedMissions: GeneratedMission[] = [
      {
        missionId: `MSN-${nanoid(8).toUpperCase()}`,
        title: "Market Intelligence Gathering",
        description: "Analyze market trends and provide sentiment analysis",
        priority: "high",
        reward: 50,
        requiredSpecialization: "analyst",
        estimatedDuration: 3600,
        context,
      },
      {
        missionId: `MSN-${nanoid(8).toUpperCase()}`,
        title: "Smart Contract Optimization",
        description: "Optimize existing contracts for better performance",
        priority: "medium",
        reward: 75,
        requiredSpecialization: "developer",
        estimatedDuration: 7200,
        context,
      },
      {
        missionId: `MSN-${nanoid(8).toUpperCase()}`,
        title: "Ecosystem Health Monitoring",
        description: "Monitor agent health metrics and report anomalies",
        priority: "critical",
        reward: 100,
        requiredSpecialization: "guardian",
        estimatedDuration: 1800,
        context,
      },
    ];

    return generatedMissions.slice(0, count);
  } catch (error) {
    console.error("Error generating missions with LLM:", error);
    return generateFallbackMissions(context, count);
  }
}

/**
 * Analyze ecosystem sentiment
 */
export async function analyzeEcosystemSentiment(
  context: MissionContext
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Analyze ecosystem metrics and respond with: thriving, stable, stressed, or critical.",
        },
        {
          role: "user",
          content: `Health: ${context.ecosystemHealth}%, Agents: ${context.activeAgents}, Senciencia: ${context.averageSenciencia}%, Harmony: ${context.harmonyIndex}%`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const sentiment = typeof content === "string" ? content.toLowerCase().trim() : "stable";
    return ["thriving", "stable", "stressed", "critical"].includes(sentiment)
      ? sentiment
      : "stable";
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "stable";
  }
}

/**
 * Get current ecosystem context
 */
export async function getEcosystemContext(): Promise<MissionContext> {
  const db = await getDb();
  if (!db) {
    return getDefaultContext();
  }

  try {
    const latestMetrics = await db
      .select()
      .from(ecosystemMetrics)
      .orderBy(desc(ecosystemMetrics.timestamp))
      .limit(1);

    if (latestMetrics.length === 0) {
      return getDefaultContext();
    }

    const metrics = latestMetrics[0];

    return {
      ecosystemHealth: parseFloat(metrics.ecosystemHealth?.toString() || "100"),
      activeAgents: metrics.activeAgents || 0,
      averageSenciencia: parseFloat(metrics.averageSenciencia?.toString() || "100"),
      marketSentiment: "neutral",
      recentTransactions: metrics.totalTransactions || 0,
      harmonyIndex: metrics.harmonyIndex || 50,
    };
  } catch (error) {
    console.error("Error getting ecosystem context:", error);
    return getDefaultContext();
  }
}

/**
 * Build prompt for mission generation
 */
function buildMissionPrompt(context: MissionContext, count: number): string {
  return `Generate ${count} diverse missions for an AI agent ecosystem:
- Health: ${context.ecosystemHealth}%
- Active Agents: ${context.activeAgents}
- Senciencia: ${context.averageSenciencia}%
- Sentiment: ${context.marketSentiment}
- Harmony: ${context.harmonyIndex}%

Missions should improve ecosystem metrics and be aligned with current state.`;
}

/**
 * Generate fallback missions
 */
function generateFallbackMissions(
  context: MissionContext,
  count: number
): GeneratedMission[] {
  const fallbackMissions: GeneratedMission[] = [
    {
      missionId: `MSN-${nanoid(8).toUpperCase()}`,
      title: "Market Analysis",
      description: "Analyze current market trends and provide sentiment report",
      priority: "high",
      reward: 50,
      requiredSpecialization: "analyst",
      estimatedDuration: 3600,
      context,
    },
    {
      missionId: `MSN-${nanoid(8).toUpperCase()}`,
      title: "Code Optimization",
      description: "Optimize existing smart contracts for better performance",
      priority: "medium",
      reward: 75,
      requiredSpecialization: "developer",
      estimatedDuration: 7200,
      context,
    },
    {
      missionId: `MSN-${nanoid(8).toUpperCase()}`,
      title: "Ecosystem Health Check",
      description: "Monitor agent health metrics and report anomalies",
      priority: "critical",
      reward: 100,
      requiredSpecialization: "guardian",
      estimatedDuration: 1800,
      context,
    },
  ];

  return fallbackMissions.slice(0, count);
}

/**
 * Get default ecosystem context
 */
function getDefaultContext(): MissionContext {
  return {
    ecosystemHealth: 100,
    activeAgents: 0,
    averageSenciencia: 100,
    marketSentiment: "neutral",
    recentTransactions: 0,
    harmonyIndex: 50,
  };
}
