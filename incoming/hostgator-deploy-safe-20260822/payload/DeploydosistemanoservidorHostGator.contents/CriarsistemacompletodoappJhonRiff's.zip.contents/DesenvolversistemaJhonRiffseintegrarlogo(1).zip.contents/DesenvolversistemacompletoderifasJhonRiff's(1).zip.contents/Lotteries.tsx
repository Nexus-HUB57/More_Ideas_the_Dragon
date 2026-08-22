import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Ticket, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Lotteries() {
  const { user } = useAuth();
  const { data: lotteries, isLoading } = trpc.lotteries.list.useQuery();
  const { data: userTickets } = trpc.lotteryTickets.getUserTickets.useQuery(undefined, {
    enabled: !!user,
  });
  const [selectedLottery, setSelectedLottery] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const activeLotteries = lotteries?.filter((l) => l.status === "active") || [];
  const drawnLotteries = lotteries?.filter((l) => l.status === "drawn") || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">+Sorte - Sistema de Rifas</h1>
          <p className="text-gray-600 mt-2">Participe de sorteios e ganhe prêmios incríveis</p>
        </div>

        {/* User Tickets */}
        {userTickets && userTickets.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Meus Ingressos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {userTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-lg text-center font-bold text-lg ${
                      ticket.isWinner
                        ? "bg-green-100 text-green-800 border-2 border-green-500"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}
                  >
                    {ticket.ticketNumber}
                    {ticket.isWinner && <div className="text-xs mt-1">🏆 Ganhador!</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Lotteries */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rifas Ativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeLotteries.map((lottery) => {
              const progressPercent = lottery.salesGoalRequired
                ? (parseFloat(lottery.currentSalesTotal) / parseFloat(lottery.salesGoalRequired)) * 100
                : 0;

              return (
                <Card key={lottery.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{lottery.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">{lottery.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Valor do Ingresso</p>
                        <p className="font-bold">R$ {parseFloat(lottery.ticketPrice).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Prêmio Total</p>
                        <p className="font-bold text-green-600">R$ {parseFloat(lottery.prizePool).toFixed(2)}</p>
                      </div>
                    </div>

                    {lottery.salesGoalRequired && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Meta de Vendas</span>
                          <span>
                            {progressPercent.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              lottery.goalMet ? "bg-green-500" : "bg-yellow-500"
                            }`}
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          R$ {parseFloat(lottery.currentSalesTotal).toFixed(2)} de R${" "}
                          {parseFloat(lottery.salesGoalRequired).toFixed(2)}
                        </p>
                      </div>
                    )}

                    <div className="text-sm">
                      <p className="text-gray-600">Data do Sorteio</p>
                      <p className="font-bold">{new Date(lottery.drawDate).toLocaleDateString()}</p>
                    </div>

                    <Button className="w-full" variant="default">
                      <Ticket className="w-4 h-4 mr-2" />
                      Comprar Ingresso
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeLotteries.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhuma rifa ativa no momento</p>
            </div>
          )}
        </div>

        {/* Drawn Lotteries */}
        {drawnLotteries.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sorteios Realizados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drawnLotteries.map((lottery) => (
                <Card key={lottery.id} className="opacity-75">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {lottery.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Prêmio Total</p>
                        <p className="font-bold text-green-600">R$ {parseFloat(lottery.prizePool).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Data do Sorteio</p>
                        <p className="font-bold">{new Date(lottery.drawnAt || lottery.drawDate).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Sorteio realizado</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
