import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Startups() {
  const { data: startups, isLoading } = trpc.startups.list.useQuery();

  const statusColors: Record<string, string> = {
    planning: "bg-slate-500",
    development: "bg-blue-500",
    launched: "bg-green-500",
    scaling: "bg-amber-500",
    mature: "bg-purple-500",
    archived: "bg-gray-500",
  };

  const sortedStartups = [...(startups || [])].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Startups</h1>
        <p className="text-slate-400">Portfólio completo com métricas de performance</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32 bg-slate-700" />)
        ) : (
          sortedStartups.map((startup) => (
            <Card key={startup.id} className="bg-slate-800 border-slate-700 hover:border-amber-500/50 transition">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{startup.name}</h3>
                    <p className="text-sm text-slate-400">{startup.description}</p>
                  </div>
                  <Badge className={`${statusColors[startup.status] || "bg-gray-500"} text-white`}>{startup.status}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs text-slate-400">Receita</p>
                      <p className="text-lg font-semibold text-white">${(startup.revenue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs text-slate-400">Tração</p>
                      <p className="text-lg font-semibold text-white">{startup.traction}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-xs text-slate-400">Reputação</p>
                      <p className="text-lg font-semibold text-white">{startup.reputation}</p>
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
