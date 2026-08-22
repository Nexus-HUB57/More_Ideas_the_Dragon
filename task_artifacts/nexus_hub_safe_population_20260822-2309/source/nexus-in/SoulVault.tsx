import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, CheckCircle, AlertCircle, Lightbulb } from "lucide-react";
import { useState } from "react";

export default function SoulVault() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: entries, isLoading } = trpc.soulVault.getEntries.useQuery({ limit: 50 });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "decision":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "precedent":
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case "lesson":
        return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case "insight":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      decision: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      precedent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      lesson: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      insight: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[type] || colors.insight;
  };

  const getImpactColor = (impact: string | null) => {
    if (!impact) return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return colors[impact] || colors.medium;
  };

  const filteredEntries = entries?.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Soul Vault</h1>
        <p className="text-muted-foreground">Memória Institucional da Organização</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Buscar decisões, precedentes, lições..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-background border-border"
        />
      </div>

      {/* Entries Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : filteredEntries && filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map((entry, idx) => (
            <Card
              key={entry.id}
              className="p-6 bg-card border-border hover:shadow-lg transition-shadow relative"
            >
              {/* Timeline line */}
              {idx < filteredEntries.length - 1 && (
                <div className="absolute left-8 top-full w-0.5 h-4 bg-border" />
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getTypeIcon(entry.type)}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{entry.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(entry.createdAt).toLocaleDateString("pt-BR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Badge className={getTypeColor(entry.type)}>
                          {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                        </Badge>
                        {entry.impact && (
                          <Badge className={getImpactColor(entry.impact)}>
                            Impacto: {entry.impact.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {entry.content && (
                      <p className="text-foreground mt-3 leading-relaxed">{entry.content}</p>
                    )}

                    {entry.relatedProposalId && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Relacionado à Proposta #{entry.relatedProposalId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Nenhuma entrada encontrada" : "Nenhuma entrada de memória institucional"}
          </p>
        </div>
      )}

      {/* Stats */}
      {entries && entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {entries.filter((e) => e.type === "decision").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Decisões</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {entries.filter((e) => e.type === "precedent").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Precedentes</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {entries.filter((e) => e.type === "lesson").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Lições</p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {entries.filter((e) => e.type === "insight").length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Insights</p>
          </Card>
        </div>
      )}
    </div>
  );
}
