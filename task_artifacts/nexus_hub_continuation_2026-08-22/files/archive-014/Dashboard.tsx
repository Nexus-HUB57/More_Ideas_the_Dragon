import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Zap, Brain, TrendingUp, Users, AlertCircle } from "lucide-react";

interface MetricsData {
  timestamp: Date | string;
  totalAgents: number | null;
  activeAgents: number | null;
  averageHealth: number | null;
  averageEnergy: number | null;
  averageSenciencia: string | null;
  harmonyIndex: number | null;
  totalTransactions: number | null;
  totalVolume: string | null;
}

export default function Dashboard() {
  const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [agentStats, setAgentStats] = useState({ total: 0, active: 0, hibernating: 0, critical: 0 });

  // Fetch latest metrics
  const { data: latestMetrics } = trpc.metrics.getLatest.useQuery();

  // Fetch metrics history
  const { data: metricsData } = trpc.metrics.getHistory.useQuery({ limit: 100 });

  // Fetch all agents
  const { data: allAgents } = trpc.agents.listAll.useQuery();

  useEffect(() => {
    if (latestMetrics) {
      setCurrentMetrics(latestMetrics);
    }
  }, [latestMetrics]);

  useEffect(() => {
    if (metricsData) {
      const formatted = metricsData.map((m: any) => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      }));
      setMetricsHistory(formatted);
    }
  }, [metricsData]);

  useEffect(() => {
    if (allAgents) {
      const stats = {
        total: allAgents.length,
        active: allAgents.filter((a: any) => a.status === "active").length,
        hibernating: allAgents.filter((a: any) => a.status === "hibernating").length,
        critical: allAgents.filter((a: any) => a.status === "critical").length,
      };
      setAgentStats(stats);
    }
  }, [allAgents]);

  if (!currentMetrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold">Inicializando Ecossistema Quântico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Nexus Hub V3 - Soberania Total</h1>
        <p className="text-gray-500 mt-2">Monitoramento Quântico em Tempo Real</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agents */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Agentes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agentStats.active}</div>
            <p className="text-xs text-gray-500 mt-1">de {agentStats.total} total</p>
          </CardContent>
        </Card>

        {/* Average Senciencia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />