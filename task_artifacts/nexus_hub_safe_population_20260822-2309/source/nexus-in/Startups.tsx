import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

export default function Startups() {
  const { data: startups, isLoading: startupsLoading } = trpc.startups.list.useQuery({ limit: 50 });
  const { data: ranking, isLoading: rankingLoading } = trpc.startups.getRanking.useQuery();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      development: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      launched: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      scaling: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      mature: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      archived: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || colors.planning;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Startups</h1>

      {/* Ranking Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Ranking de Performance</h2>
        {rankingLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : ranking && ranking.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-semibold">Posição</th>
                  <th className="py-3 px-4 font-semibold">Startup</th>
                  <th className="py-3 px-4 font-semibold">Receita</th>
                  <th className="py-3 px-4 font-semibold">Crescimento</th>
                  <th className="py-3 px-4 font-semibold">Qualidade</th>
                  <th className="py-3 px-4 font-semibold">Market Fit</th>
                  <th className="py-3 px-4 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ranking.map((metric, idx) => (
                  <tr key={metric.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">#{metric.rank}</td>
                    <td className="py-3 px-4 text-foreground">Startup #{metric.startupId}</td>
                    <td className="py-3 px-4 text-foreground">${metric.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-foreground">{metric.userGrowth}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-muted rounded-full h-2 max-w-xs">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${metric.productQuality}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-muted rounded-full h-2 max-w-xs">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${metric.marketFit}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">{metric.overallScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma métrica de performance disponível</p>
        )}
      </div>

      {/* Startups Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Portfólio de Startups</h2>
        {startupsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : startups && startups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {startups.map((startup) => (
              <Card key={startup.id} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{startup.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{startup.description}</p>
                    </div>
                    {startup.isCore && (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        CORE
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Tração</p>
                      <p className="text-lg font-semibold text-foreground">{startup.traction}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Receita</p>
                      <p className="text-lg font-semibold text-foreground">${startup.revenue}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Reputação</p>
                      <p className="text-lg font-semibold text-foreground">{startup.reputation}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">Geração</p>
                      <p className="text-lg font-semibold text-foreground">Gen {startup.generation}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <Badge className={getStatusColor(startup.status)}>
                      {startup.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhuma startup disponível</p>
        )}
      </div>
    </div>
  );
}
