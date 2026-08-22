import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Heart, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Agents() {
  const { data: agents, isLoading } = trpc.agents.list.useQuery();

  const roleColors: Record<string, string> = {
    cto: "bg-blue-500",
    cmo: "bg-pink-500",
    cfo: "bg-green-500",
    cdo: "bg-purple-500",
    ceo: "bg-amber-500",
    legal: "bg-red-500",
    redteam: "bg-orange-500",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Agentes IA</h1>
        <p className="text-slate-400">Especialistas autônomos com DNA único</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-40 bg-slate-700" />)
        ) : (
          agents?.map((agent) => (
            <Card key={agent.id} className="bg-slate-800 border-slate-700 hover:border-amber-500/50 transition">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{agent.name}</CardTitle>
                    <p className="text-xs text-slate-400 mt-1">{agent.specialization}</p>
                  </div>
                  <Badge className={`${roleColors[agent.role] || "bg-gray-500"} text-white text-xs`}>{agent.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">Saúde</p>
                      <div className="w-full bg-slate-700 rounded h-2">
                        <div className="bg-red-500 h-2 rounded" style={{ width: `${agent.health}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">Energia</p>
                      <div className="w-full bg-slate-700 rounded h-2">
                        <div className="bg-yellow-500 h-2 rounded" style={{ width: `${agent.energy}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">Criatividade</p>
                      <div className="w-full bg-slate-700 rounded h-2">
                        <div className="bg-amber-500 h-2 rounded" style={{ width: `${agent.creativity}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
