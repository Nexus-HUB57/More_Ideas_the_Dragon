import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Gift, Calendar, Target } from "lucide-react";
import { useState } from "react";

export default function Lotteries() {
  const { user } = useAuth();
  const [selectedLottery, setSelectedLottery] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: lotteries, isLoading } = trpc.lottery.list.useQuery();
  const { data: myTickets, isLoading: ticketsLoading } = trpc.lottery.getMyTickets.useQuery();

  const buyTicketMutation = trpc.lottery.buyTicket.useMutation();

  if (!user) return null;

  const handleBuyTicket = async (lotteryId: number) => {
    try {
      await buyTicketMutation.mutateAsync({
        lotteryId,
        quantity,
      });
      setSelectedLottery(null);
      setQuantity(1);
    } catch (error) {
      console.error("Erro ao comprar ticket:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rifas e Sorteios</h1>
          <p className="text-muted-foreground mt-2">
            Participe de sorteios exclusivos e ganhe prêmios incríveis
          </p>
        </div>

        {/* Active Lotteries */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Sorteios Ativos</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8" />
            </div>
          ) : lotteries && lotteries.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {lotteries.map((lottery) => {
                const prizePool = parseFloat(lottery.prizePool.toString());
                const ticketPrice = parseFloat(lottery.ticketPrice.toString());
                const currentSales = parseFloat(lottery.currentSalesTotal.toString());
                const goalRequired = lottery.salesGoalRequired
                  ? parseFloat(lottery.salesGoalRequired.toString())
                  : 0;
                const goalPercentage = goalRequired > 0 ? (currentSales / goalRequired) * 100 : 0;

                return (
                  <Card key={lottery.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{lottery.name}</CardTitle>
                          <CardDescription>{lottery.description}</CardDescription>
                        </div>
                        <Gift className="w-6 h-6 text-purple-600" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      {/* Prize Pool */}
                      <div>
                        <p className="text-sm text-muted-foreground">Prêmio Total</p>
                        <p className="text-2xl font-bold">
                          R$ {prizePool.toFixed(2).replace(".", ",")}
                        </p>
                      </div>

                      {/* Ticket Price */}
                      <div>
                        <p className="text-sm text-muted-foreground">Preço do Ticket</p>
                        <p className="text-lg font-semibold">
                          R$ {ticketPrice.toFixed(2).replace(".", ",")}
                        </p>
                      </div>

                      {/* Draw Date */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          Sorteio em {new Date(lottery.drawDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>

                      {/* Sales Goal Progress */}
                      {goalRequired > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Meta de Vendas</span>
                            <span className="text-sm font-semibold">
                              {goalPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                lottery.goalMet ? "bg-green-600" : "bg-blue-600"
                              }`}
                              style={{ width: `${Math.min(goalPercentage, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            R$ {currentSales.toFixed(2).replace(".", ",")} de R${" "}
                            {goalRequired.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      )}

                      {/* Available Tickets */}
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {lottery.totalTickets} tickets disponíveis
                        </span>
                      </div>

                      {/* Buy Button */}
                      <Button
                        className="w-full mt-4"
                        onClick={() => setSelectedLottery(lottery.id)}
                      >
                        Comprar Tickets
                      </Button>

                      {/* Buy Modal */}
                      {selectedLottery === lottery.id && (
                        <div className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-3">
                          <div>
                            <label className="text-sm font-medium">Quantidade</label>
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                              className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                            />
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">Total</p>
                            <p className="text-lg font-bold">
                              R$ {(ticketPrice * quantity).toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={() => handleBuyTicket(lottery.id)}
                              disabled={buyTicketMutation.isPending}
                            >
                              {buyTicketMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Confirmar"
                              )}
                            </Button>
                            <Button
                              className="flex-1"
                              variant="outline"
                              onClick={() => setSelectedLottery(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Nenhum sorteio ativo no momento</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* My Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Tickets</CardTitle>
            <CardDescription>Tickets que você possui em sorteios</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin w-6 h-6" />
              </div>
            ) : myTickets && myTickets.length > 0 ? (
              <div className="space-y-3">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">Ticket #{ticket.ticketNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Comprado em {new Date(ticket.purchaseDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      {ticket.isWinner ? (
                        <div>
                          <p className="font-bold text-green-600">Premiado!</p>
                          <p className="text-sm">
                            R$ {parseFloat(ticket.prizeAmount?.toString() || "0").toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aguardando sorteio</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem tickets
                </p>
                <Button>
                  Comprar Meu Primeiro Ticket
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
