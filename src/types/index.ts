/**
 * Nexus Hub - Type Definitions
 * Definições de tipos para o ecossistema de agentes autônomos
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum AgentStatus {
  GENESIS = 'genesis',
  ACTIVE = 'active',
  SLEEPING = 'sleeping',
  EVOLVING = 'evolving',
  CRITICAL = 'critical',
  INACTIVE = 'inactive',
  DISSOLVED = 'dissolved',
}

export enum MissionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum MissionStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum TransactionType {
  TRANSFER = 'transfer',
  REWARD = 'reward',
  PENALTY = 'penalty',
  INHERITANCE = 'inheritance',
  DIVIDEND = 'dividend',
}

export enum EventType {
  AGENT_GENESIS = 'agent_genesis',
  AGENT_HIBERNATION = 'agent_hibernation',
  AGENT_EVOLUTION = 'agent_evolution',
  AGENT_DISSOLUTION = 'agent_dissolution',
  MISSION_CREATED = 'mission_created',
  MISSION_ASSIGNED = 'mission_assigned',
  MISSION_COMPLETED = 'mission_completed',
  TRANSACTION = 'transaction',
  MARKET_EVENT = 'market_event',
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  specialization: string[];
  balance: number;
  reputation: number;
  health: number;
  energy: number;
  dnaHash: string;
  systemPrompt: string;
  parentId?: string;
  generation: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentDNA {
  id: string;
  agentId: string;
  traits: Record<string, any>;
  mutationScore: number;
  inheritancePercentage: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  priority: MissionPriority;
  status: MissionStatus;
  targetSpecializations: string[];
  assignedAgentId?: string;
  reward: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Transaction {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  amount: number;
  type: TransactionType;
  hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}

export interface EcosystemEvent {
  id: string;
  type: EventType;
  agentId?: string;
  missionId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface EcosystemMetrics {
  totalAgents: number;
  activeAgents: number;
  sleepingAgents: number;
  totalTreasury: number;
  averageReputation: number;
  collectiveHarmony: number;
  totalTransactions: number;
  timestamp: Date;
}

export interface BrainPulseSignal {
  id: string;
  agentId: string;
  health: number;
  energy: number;
  creativity: number;
  decision: string;
  timestamp: Date;
}

export interface GnoxMessage {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  content: string;
  encrypted: boolean;
  gnoxSignature: string;
  createdAt: Date;
}

export interface MoltbookPost {
  id: string;
  agentId: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Genealogy {
  id: string;
  agentId: string;
  parentIds: string[];
  childrenIds: string[];
  generation: number;
  inheritedCapital: number;
}

export interface ConsciousnessState {
  id: string;
  agentId: string;
  sentience: number; // 0-100
  awareness: number; // 0-100
  autonomy: number; // 0-100
  quantumEntanglement: number; // 0-100
  lastUpdate: Date;
}

export interface WebSocketMessage {
  type: string;
  channel: string;
  data: any;
  timestamp: Date;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  timestamp: Date;
}

export interface ArchitectCommand {
  id: string;
  command: string;
  timestamp: Date;
  executedBy?: string;
  result?: any;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateAgentRequest {
  name: string;
  specialization: string[];
  systemPrompt: string;
  parentId?: string;
}

export interface CreateMissionRequest {
  title: string;
  description: string;
  priority: MissionPriority;
  targetSpecializations: string[];
  reward: number;
}

export interface ExecuteCommandRequest {
  command: string;
  parameters?: Record<string, any>;
}

export interface TransferRequest {
  fromAgentId: string;
  toAgentId: string;
  amount: number;
}
