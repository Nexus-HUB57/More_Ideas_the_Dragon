import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Arbitrage() {
  const { data: opportunities, isLoading } = trpc.arbitrage.opportunities.useQuery({});

  const statusColors: Record<string, string> = {
    identified: "bg-blue-500",
    executing: "bg-amber-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Motor de Arbitragem Preditiva</h1>
        <p className="text-slate-400">Identificação e execução de oportunidades entre exchanges</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32 bg-slate-700" />)
        ) : (
          opportunities?.map((opp) => (
            <Card key={opp.id} className="bg-slate-800 border-slate-700 hover:border-amber-500/50 transition">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{opp.asset}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-slate-400">{opp.exchangeFrom}</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-slate-400">{opp.exchangeTo}</span>
                    </div>
                  </div>
                  <Badge className={`${statusColors[opp.status] || "bg-gray-500"} text-white`}>{opp.status}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Diferença de Preço</p>
                    <p className="text-lg font-semibold text-white">${opp.priceDifference.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Lucro Potencial</p>
                    <p className="text-lg font-semibold text-green-400">${opp.profitPotential.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Confiança</p>
                    <p className="text-lg font-semibold text-amber-400">{opp.confidence}%</p>
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
