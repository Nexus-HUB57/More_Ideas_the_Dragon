import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lightbulb, CheckCircle, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SoulVault() {
  const { data: entries, isLoading } = trpc.soulVault.entries.useQuery({});

  const typeIcons: Record<string, React.ReactNode> = {
    decision: <CheckCircle className="w-4 h-4 text-blue-400" />,
    precedent: <BookOpen className="w-4 h-4 text-purple-400" />,
    lesson: <Lightbulb className="w-4 h-4 text-amber-400" />,
    insight: <AlertCircle className="w-4 h-4 text-green-400" />,
  };

  const typeLabels: Record<string, string> = {
    decision: "Decisão",
    precedent: "Precedente",
    lesson: "Lição",
    insight: "Insight",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Soul Vault</h1>
        <p className="text-slate-400">Memória institucional - Decisões, precedentes e lições aprendidas</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-24 bg-slate-700" />)
        ) : (
          entries?.map((entry) => (
            <Card key={entry.id} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    {typeIcons[entry.type]}
                    <div>
                      <h3 className="font-semibold text-white">{entry.title}</h3>
                      <Badge className="mt-1 text-xs">{typeLabels[entry.type]}</Badge>
                    </div>
                  </div>
                </div>
                {entry.content && <p className="text-slate-300 text-sm mb-3">{entry.content}</p>}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
                  {entry.impact && <span className="text-amber-400">Impacto: {entry.impact}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
