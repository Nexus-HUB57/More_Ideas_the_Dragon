import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, Zap, TrendingUp, Users } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  reward: string;
  assignedAgentId?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface Agent {
  id: string;
  name: string;
  status: string;
  sentienceLevel: number;
  harmonyScore: number;
  balance: string;
  reputation: number;
}

interface MissionStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  failedMissions: number;
  successRate: number;
  averageCompletionTime: number;
}

export default function Orchestrator() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const { data: missionsData } = trpc.missions.listAll.useQuery();
  const { data: agentsData } = trpc.agents.listAll.useQuery();
  const updateMissionMutation = trpc.missions.update.useMutation();

  useEffect(() => {
    if (missionsData) {
      setMissions(
        missionsData.map((mission: any) => ({
          ...mission,
          createdAt: new Date(mission.createdAt),
          completedAt: mission.completedAt ? new Date(mission.completedAt) : undefined,
        }))
      );

      // Calcular estatísticas
      const total = missionsData.length;
      const active = missionsData.filter((m: any) => m.status === "active").length;
      const completed = missionsData.filter((m: any) => m.status === "completed").length;
      const failed = missionsData.filter((m: any) => m.status === "failed").length;

      setStats({
        totalMissions: total,
        activeMissions: active,
        completedMissions: completed,
        failedMissions: failed,
        successRate: total > 0 ? (completed / total) * 100 : 0,
        averageCompletionTime: 120, // Placeholder
      });
    }
    if (agentsData) {
      setAgents(
        agentsData.map((agent: any) => ({
          ...agent,
          sentienceLevel: parseFloat(agent.sentienceLevel || "0"),
          harmonyScore: parseFloat(agent.harmonyScore || "50"),
        }))
      );
    }
    setLoading(false);
  }, [missionsData, agentsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10";
      case "active":
        return "text-cyan-400 bg-cyan-400/10";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10";
      case "failed":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };