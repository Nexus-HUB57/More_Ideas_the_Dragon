import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lightbulb, CheckCircle2, Archive } from "lucide-react";

export default function SoulVault() {
  const [entries] = useState([
    {
      id: 1,
      type: "decision",
      title: "Decisão de Pivô para B2B",
      content: "Após análise de mercado, decidimos pivotar de B2C para B2B, resultando em 3x crescimento de receita.",
      impact: "high",
      relatedProposal: "Proposta #5",
      date: new Date(Date.now() - 86400000 * 30),
    },
    {
      id: 2,
      type: "precedent",
      title: "Precedente: Alocação de Fundos para Startups",
      content: "Estabelecido precedente de alocação de 20% dos lucros para novas startups em fase de seed.",
      impact: "high",
      relatedProposal: "Proposta #12",
      date: new Date(Date.now() - 86400000 * 60),
    },
    {
      id: 3,
      type: "lesson",
      title: "Lição: Importância da Diversificação",
      content: "Aprendemos que concentrar recursos em uma única startup aumenta risco. Diversificação é essencial.",
      impact: "medium",
      relatedProposal: null,
      date: new Date(Date.now() - 86400000 * 90),
    },
    {
      id: 4,
      type: "insight",
      title: "Insight: Mercado de IA em Crescimento",
      content: "Identificamos oportunidade no mercado de IA generativa para automação de processos empresariais.",
      impact: "medium",
      relatedProposal: null,
      date: new Date(Date.now() - 86400000 * 120),
    },
  ]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      decision: <CheckCircle2 className="h-5 w-5 text-cyan-500" />,
      precedent: <BookOpen className="h-5 w-5 text-purple-500" />,
      lesson: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      insight: <Archive className="h-5 w-5 text-pink-500" />,
    };
    return icons[type] || <BookOpen className="h-5 w-5" />;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      decision: "Decisão",
      precedent: "Precedente",
      lesson: "Lição",
      insight: "Insight",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      decision: "bg-cyan-500/20 text-cyan-400",
      precedent: "bg-purple-500/20 text-purple-400",
      lesson: "bg-yellow-500/20 text-yellow-400",
      insight: "bg-pink-500/20 text-pink-400",
    };
    return colors[type] || "bg-gray-500/20 text-gray-400";
  };

  const getImpactColor = (impact: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-500/20 text-red-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      low: "bg-green-500/20 text-green-400",
    };
    return colors[impact] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Soul Vault</h1>
          <p className="text-muted-foreground">Memória institucional: decisões, precedentes e lições aprendidas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Total de Entradas</p>
            <p className="text-2xl font-bold text-primary">{entries.length}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Decisões</p>
            <p className="text-2xl font-bold text-cyan-500">{entries.filter(e => e.type === "decision").length}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Precedentes</p>
            <p className="text-2xl font-bold text-purple-500">{entries.filter(e => e.type === "precedent").length}</p>
          </Card>
          <Card className="bg-card border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">Lições</p>
            <p className="text-2xl font-bold text-yellow-500">{entries.filter(e => e.type === "lesson").length}</p>
          </Card>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="bg-card border-border p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-background">
                  {getTypeIcon(entry.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{entry.title}</h3>
                    <Badge className={getTypeColor(entry.type)}>
                      {getTypeLabel(entry.type)}
                    </Badge>
                    <Badge className={getImpactColor(entry.impact)}>
                      Impacto: {entry.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.date.toLocaleDateString("pt-BR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <p className="text-foreground mb-4 leading-relaxed">{entry.content}</p>

              {entry.relatedProposal && (
                <div className="p-3 bg-background rounded border border-border">
                  <p className="text-sm text-muted-foreground">
                    Relacionado com: <span className="text-primary font-medium">{entry.relatedProposal}</span>
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
