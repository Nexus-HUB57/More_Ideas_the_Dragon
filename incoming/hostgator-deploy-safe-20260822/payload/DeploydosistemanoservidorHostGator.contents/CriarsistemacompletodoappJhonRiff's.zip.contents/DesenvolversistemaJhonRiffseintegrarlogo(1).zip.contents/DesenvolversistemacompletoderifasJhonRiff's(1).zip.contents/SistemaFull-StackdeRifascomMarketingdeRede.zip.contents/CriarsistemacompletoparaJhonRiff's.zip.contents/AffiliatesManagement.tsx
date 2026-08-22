import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function AffiliatesManagement() {
  const { data: affiliates, isLoading } = trpc.affiliates.getAllAffiliates.useQuery();
  const [selectedAffiliate, setSelectedAffiliate] = useState<number | null>(null);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getCareerLevelName = (level: number) => {
    const levels: Record<number, string> = {
      0: "Iniciante",
      1: "Agente Autônomo",
      2: "Consultor",
      3: "Mentor",
      4: "Executivo",
      5: "Sócio Investidor",
      6: "Sócio Gestor",
      7: "Sócio JR Group",
    };
    return levels[level] || "Desconhecido";
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Afiliados</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todos os membros da rede Jhon Riff's
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Afiliados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Nível</th>
                  <th className="text-left py-3 px-4">Pontos</th>
                  <th className="text-left py-3 px-4">Saldo</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {affiliates?.map((affiliate) => (
                  <tr key={affiliate.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{affiliate.id}</td>
                    <td className="py-3 px-4">{getCareerLevelName(affiliate.careerLevel)}</td>
                    <td className="py-3 px-4">{affiliate.accumulatedPoints}</td>
                    <td className="py-3 px-4">{formatCurrency(affiliate.availableBalance)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          affiliate.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {affiliate.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAffiliate(affiliate.id)}
                      >
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedAffiliate && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Afiliado</CardTitle>
          </CardHeader>
          <CardContent>
            {affiliates?.find((a) => a.id === selectedAffiliate) && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID</p>
                    <p className="font-semibold">{selectedAffiliate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nível</p>
                    <p className="font-semibold">
                      {getCareerLevelName(
                        affiliates.find((a) => a.id === selectedAffiliate)?.careerLevel || 0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pontos Acumulados</p>
                    <p className="font-semibold">
                      {affiliates.find((a) => a.id === selectedAffiliate)?.accumulatedPoints}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                    <p className="font-semibold">
                      {formatCurrency(
                        affiliates.find((a) => a.id === selectedAffiliate)?.availableBalance || 0
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAffiliate(null)}
                >
                  Fechar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
