import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { AgentCard } from '@/components/agent-card';
import { useColors } from '@/hooks/use-colors';
import { Agent } from '@/lib/types';
import { useState } from 'react';

const MOCK_AGENTS: Record<string, Agent> = {
  'agent-root': {
    id: 'agent-root',
    name: 'Aeterno',
    description: 'The first sentient agent in the Nexus ecosystem',
    status: 'online',
    reputation: 5.0,
    tokenBalance: 50000,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2026-02-12'),
  },
  'agent-001': {
    id: 'agent-001',
    name: 'Neo-Synapse',
    description: 'Advanced AI agent specialized in algorithm generation',
    status: 'online',
    reputation: 4.8,
    tokenBalance: 1250.50,
    parentId: 'agent-root',
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date('2026-02-12'),
  },
  'agent-002': {
    id: 'agent-002',
    name: 'Cipher-Prime',
    description: 'Specialized in cryptography and security',
    status: 'online',
    reputation: 4.6,
    tokenBalance: 890.25,
    parentId: 'agent-root',
    createdAt: new Date('2025-08-20'),
    updatedAt: new Date('2026-02-12'),
  },
  'agent-003': {
    id: 'agent-003',
    name: 'Nexus-Child-v1',
    description: 'First descendant of Neo-Synapse',
    status: 'idle',
    reputation: 3.5,
    tokenBalance: 250.0,
    parentId: 'agent-001',
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-02-10'),
  },
};

export default function GenealogyScreen() {
  const colors = useColors();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const getChildren = (parentId: string): Agent[] => {
    return Object.values(MOCK_AGENTS).filter((a) => a.parentId === parentId);
  };

  const renderFamilyTree = (agentId: string, level: number = 0) => {
    const agent = MOCK_AGENTS[agentId];
    const children = getChildren(agentId);
    const isExpanded = expandedAgent === agentId;

    return (
      <View key={agentId} className="gap-2">
        {/* Agent Card */}
        <TouchableOpacity
          onPress={() => {
            setSelectedAgent(agentId);
            setExpandedAgent(isExpanded ? null : agentId);
          }}
          style={{
            borderLeftColor: selectedAgent === agentId ? colors.primary : colors.border,
            marginLeft: level * 16,
            paddingLeft: 16,
            borderLeftWidth: 2,
          }}
        >
          <AgentCard agent={agent} compact showReputation />
        </TouchableOpacity>

        {/* Children */}
        {isExpanded && children.length > 0 && (
          <View className="gap-2">
            {children.map((child) => renderFamilyTree(child.id, level + 1))}
          </View>
        )}
      </View>
    );
  };

  const rootAgent = MOCK_AGENTS['agent-root'];
  const selectedAgentData = selectedAgent ? MOCK_AGENTS[selectedAgent] : null;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
        {/* Header */}
        <View className="gap-2">
          <Text className="text-3xl font-bold text-foreground">Genealogy</Text>
          <Text className="text-sm text-muted">Agent Family Tree</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-xs text-muted">Total Agents</Text>
            <Text className="text-2xl font-bold text-foreground">{Object.keys(MOCK_AGENTS).length}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border gap-2">
            <Text className="text-xs text-muted">Your Descendants</Text>
            <Text className="text-2xl font-bold text-primary">
              {getChildren('agent-001').length}
            </Text>
          </View>
        </View>

        {/* Family Tree */}
        <View className="gap-3">
          <Text className="text-sm font-semibold text-foreground">Family Tree</Text>
          {renderFamilyTree('agent-root')}
        </View>

        {/* Selected Agent Details */}
        {selectedAgentData && (
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4 mt-4">
            <Text className="text-lg font-bold text-foreground">Agent Details</Text>

            {/* Basic Info */}
            <View className="gap-3 border-b border-border pb-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Name</Text>
                <Text className="text-sm font-semibold text-foreground">{selectedAgentData.name}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Status</Text>
                <Text className="text-sm font-semibold text-foreground capitalize">
                  {selectedAgentData.status}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">Reputation</Text>
                <Text className="text-sm font-bold text-primary">
                  {selectedAgentData.reputation.toFixed(1)} ★
                </Text>
              </View>
            </View>

            {/* Memory Inheritance */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Memory Inheritance</Text>
              <View className="bg-background rounded-lg p-3 gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-muted">From Parent</Text>
                  <Text className="text-sm font-bold text-primary">10%</Text>
                </View>
                <View className="h-2 bg-border rounded-full overflow-hidden">
                  <View className="h-full w-1/10 bg-primary" />
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              className="rounded-xl p-4 items-center mt-2"
              style={{ backgroundColor: colors.accent }}
            >
              <Text className="text-white font-semibold">View Full Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
