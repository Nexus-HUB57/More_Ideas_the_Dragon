import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Award } from "lucide-react";

export interface TopPerformer {
  agentId: string;
  name: string;
  totalReward: string;
  successRate?: number;
  missionsCompleted?: number;
  averageQuality?: number;
  reputation?: number;
}

interface TopPerformersPanelProps {
  performers: TopPerformer[];
  metric?: "rewards" | "success" | "quality";
}

export function TopPerformersPanel({ performers, metric = "rewards" }: TopPerformersPanelProps) {
  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case 1:
        return "text-gray-300 bg-gray-300/10 border-gray-300/30";
      case 2:
        return "text-orange-400 bg-orange-400/10 border-orange-400/30";
      default:
        return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
    }
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${position + 1}`;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case "success":
        return "Success Rate";
      case "quality":
        return "Quality Score";
      default:
        return "Total Rewards";
    }
  };

  const getMetricValue = (performer: TopPerformer) => {
    switch (metric) {
      case "success":
        return `${performer.successRate?.toFixed(1) || 0}%`;
      case "quality":
        return `${performer.averageQuality?.toFixed(1) || 0}%`;
      default:
        return `₿${parseFloat(performer.totalReward).toFixed(2)}`;
    }
  };

  return (
    <Card className="bg-slate-900/50 border-purple-500/30 backdrop-blur-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-purple-400" />
        <h3 className="text-lg font-bold text-purple-400">Top Performers</h3>
        <Badge variant="outline" className="ml-auto border-purple-400/30 text-purple-400/70">
          {getMetricLabel()}
        </Badge>
      </div>

      <div className="space-y-3">
        {performers.map((performer, index) => (
          <div
            key={performer.agentId}
            className={`${getMedalColor(index)} border rounded-lg p-4 transition-all hover:border-opacity-75`}
          >
            <div className="flex items-start gap-4">
              {/* Medal/Position */}
              <div className="flex-shrink-0 text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-lg bg-slate-800/50">
                {getMedalIcon(index)}
              </div>

              {/* Agent Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-sm truncate">{performer.name}</h4>
                  {index === 0 && (
                    <Award className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs opacity-70 mb-2">ID: {performer.agentId}</p>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="opacity-70">Metric</p>
                    <p className="font-bold">{getMetricValue(performer)}</p>
                  </div>
                  {performer.missionsCompleted !== undefined && (
                    <div>
                      <p className="opacity-70">Missions</p>
                      <p className="font-bold">{performer.missionsCompleted}</p>
                    </div>
                  )}
                  {performer.reputation !== undefined && (
                    <div>
                      <p className="opacity-70">Reputation</p>
                      <p className="font-bold">{performer.reputation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex-shrink-0">
                <TrendingUp className="w-5 h-5 opacity-50" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full bg-slate-800/50 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-pink-500 h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (parseFloat(performer.totalReward) / parseFloat(performers[0].totalReward)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-purple-500/20 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-purple-400/70 text-xs mb-1">Total Rewards</p>
          <p className="text-lg font-bold text-purple-400">
            ₿{performers.reduce((sum, p) => sum + parseFloat(p.totalReward), 0).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-purple-400/70 text-xs mb-1">Avg Reward</p>
          <p className="text-lg font-bold text-purple-400">
            ₿{(performers.reduce((sum, p) => sum + parseFloat(p.totalReward), 0) / performers.length).toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-purple-400/70 text-xs mb-1">Top Reward</p>
          <p className="text-lg font-bold text-purple-400">
            ₿{parseFloat(performers[0]?.totalReward || "0").toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
}
