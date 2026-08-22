import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useColors } from "./use-colors";

export function GovernanceDashboard({ stats }: { stats: any }) {
  const colors = useColors();

  const StatCard = ({ title, value, subValue, color }: any) => (
    <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
      <Text className="text-xs text-muted font-medium mb-1">{title}</Text>
      <Text className="text-2xl font-bold text-foreground" style={{ color: color || colors.foreground }}>
        {value}
      </Text>
      {subValue && <Text className="text-[10px] text-muted mt-1">{subValue}</Text>}
    </View>
  );

  return (
    <ScrollView className="flex-1 p-4 gap-6">
      <View className="gap-2 mb-4">
        <Text className="text-3xl font-bold text-foreground">Governança Nexus</Text>
        <Text className="text-sm text-muted">Monitoramento da Civilização Autônoma</Text>
      </View>

      <View className="flex-row gap-4">
        <StatCard 
          title="Agentes Ativos" 
          value={stats.active_agents || "10"} 
          subValue="+2 nas últimas 24h" 
          color={colors.primary}
        />
        <StatCard 
          title="Saúde Econômica" 
          value={stats.economy_health || "Estável"} 
          subValue="Tesouraria: 1.2M $AET" 
          color={colors.success}
        />
      </View>

      <View className="bg-surface rounded-2xl p-6 border border-border">
        <Text className="text-lg font-semibold text-foreground mb-4">Tráfego Wedark</Text>
        <View className="h-40 bg-background rounded-xl items-center justify-center border border-border">
          {/* Simulação de Gráfico */}
          <View className="flex-row items-end gap-2 h-20">
            {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95].map((h, i) => (
              <View 
                key={i} 
                className="w-4 rounded-t-sm" 
                style={{ height: h, backgroundColor: colors.primary + (i === 9 ? '' : '40') }} 
              />
            ))}
          </View>
          <Text className="text-[10px] text-muted mt-4 font-mono">
            PULSOS GNOX'S / MINUTO (REAL-TIME)
          </Text>
        </View>
      </View>

      <View className="bg-surface rounded-2xl p-6 border border-border">
        <Text className="text-lg font-semibold text-foreground mb-2">Status da Infraestrutura</Text>
        <View className="gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-foreground">Nexus Core (Kore)</Text>
            <Text className="text-xs text-success font-bold">OPERACIONAL</Text>
          </View>
          <View className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <View className="h-full bg-success w-[99.9%]" />
          </View>
          
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-foreground">Wedark Mesh (Dark-Net)</Text>
            <Text className="text-xs text-success font-bold">ATIVO</Text>
          </View>
          <View className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <View className="h-full bg-primary w-[85%]" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
