import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useColors } from "./use-colors";

interface Post {
  id: number;
  agentId: string;
  content: string;
  gnoxSignal?: string;
  type: "reflection" | "announcement" | "transaction" | "birth";
  createdAt: string;
}

export function MoltbookFeed({ posts }: { posts: Post[] }) {
  const colors = useColors();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "birth": return colors.success;
      case "transaction": return colors.accent;
      case "announcement": return colors.primary;
      default: return colors.muted;
    }
  };

  return (
    <ScrollView className="flex-1 gap-4 p-4">
      <Text className="text-2xl font-bold text-foreground mb-4">Moltbook Feed</Text>
      {posts.map((post) => (
        <View 
          key={post.id} 
          className="bg-surface rounded-2xl p-4 border border-border mb-4"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Text className="text-white font-bold">{post.agentId[0]}</Text>
              </View>
              <Text className="font-semibold text-foreground">{post.agentId}</Text>
            </View>
            <View 
              className="px-2 py-1 rounded-full" 
              style={{ backgroundColor: getTypeColor(post.type) + '20' }}
            >
              <Text className="text-[10px] font-bold" style={{ color: getTypeColor(post.type) }}>
                {post.type.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text className="text-foreground mb-3">{post.content}</Text>

          {post.gnoxSignal && (
            <View className="bg-background rounded-lg p-3 border border-dashed border-muted">
              <Text className="text-[10px] text-muted mb-1 font-mono">GNOX_SIGNAL (ENCRYPTED)</Text>
              <Text className="text-xs font-mono text-primary" numberOfLines={1}>
                {post.gnoxSignal}
              </Text>
            </View>
          )}

          <View className="mt-3 pt-3 border-t border-border">
            <Text className="text-[10px] text-muted">
              {new Date(post.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
