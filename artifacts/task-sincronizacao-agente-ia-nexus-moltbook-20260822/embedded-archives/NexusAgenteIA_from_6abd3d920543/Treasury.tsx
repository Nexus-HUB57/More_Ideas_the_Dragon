import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, TrendingUp, TrendingDown, Send, Wallet } from "lucide-react";

export default function Treasury() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    fromAgentId: "",
    toAgentId: "",
    amount: 0,
    description: "",
  });

  const agentsQuery = trpc.agents.list.useQuery();
  const transactionsQuery = trpc.transactions.list.useQuery({
    agentId: selectedAgent || "",
    limit: 100,
  });
  const createTransactionMutation = trpc.transactions.create.useMutation();

  const agents = agentsQuery.data || [];
  const transactions = transactionsQuery.data || [];

  const handleTransfer = async () => {
    if (!transferData.fromAgentId || !transferData.toAgentId || transferData.amount <= 0) return;

    try {
      await createTransactionMutation.mutateAsync({
        fromAgentId: transferData.fromAgentId,
        toAgentId: transferData.toAgentId,
        type: "transfer",
        amount: transferData.amount,
        description: transferData.description,
      });
      setTransferData({ fromAgentId: "", toAgentId: "", amount: 0, description: "" });
      setIsTransferOpen(false);
      transactionsQuery.refetch();
    } catch (error) {
      console.error("Erro ao transferir:", error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "reward":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "cost":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "transfer":
        return <Send className="h-4 w-4 text-blue-500" />;
      case "penalty":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "inheritance":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "reward":
        return "bg-green-900 text-green-200";
      case "cost":
        return "bg-red-900 text-red-200";
      case "transfer":
        return "bg-blue-900 text-blue-200";
      case "penalty":
        return "bg-red-950 text-red-100";
      case "inheritance":
        return "bg-purple-900 text-purple-200";
      default:
        return "bg-slate-700 text-slate-200";
    }
  };

  const totalWealth = agents.reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
  const aeternFund = 10000; // Fundo AETERNO simulado

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Sistema de Tesouraria</h1>
            <p className="text-slate-400">Gerenciamento de Capital e Transações - AETERNO</p>
          </div>
          <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                Nova Transferência
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Transferência de Capital</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Transfira capital entre agentes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300">De (Agente)</label>
                  <Select value={transferData.fromAgentId} onValueChange={(value) => setTransferData({ ...transferData, fromAgentId: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o agente..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {agents.map((agent: any) => (
                        <SelectItem key={agent.agentId} value={agent.agentId}>
                          {agent.name} ({agent.balance}Ⓣ)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Para (Agente)</label>
                  <Select value={transferData.toAgentId} onValueChange={(value) => setTransferData({ ...transferData, toAgentId: value })}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o agente..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {agents.map((agent: any) => (
                        <SelectItem key={agent.agentId} value={agent.agentId}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Quantidade (Ⓣ)</label>
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: parseInt(e.target.value) })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Descrição</label>
                  <Input
                    placeholder="Motivo da transferência"
                    value={transferData.description}
                    onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button onClick={handleTransfer} className="w-full bg-blue-600 hover:bg-blue-700">
                  Confirmar Transferência
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Capital Total</CardTitle>
              <Coins className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(totalWealth / 1000).toFixed(1)}K Ⓣ</div>
              <p className="text-xs text-slate-400">Riqueza acumulada no ecossistema</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Fundo AETERNO</CardTitle>
              <Wallet className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(aeternFund / 1000).toFixed(1)}K Ⓣ</div>
              <p className="text-xs text-slate-400">Fundo de Infraestrutura</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Agentes Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{agents.filter((a: any) => a.status === "active").length}</div>
              <p className="text-xs text-slate-400">Participantes do ecossistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="wallets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
            <TabsTrigger value="wallets" className="text-slate-300">
              Carteiras de Agentes
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-slate-300">
              Histórico de Transações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Agente</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Especialização</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Capital</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Reputação</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent: any) => (
                        <tr
                          key={agent.agentId}
                          className="border-b border-slate-700 hover:bg-slate-700/50 transition cursor-pointer"
                          onClick={() => setSelectedAgent(agent.agentId)}
                        >
                          <td className="py-3 px-4 text-slate-200 font-medium">{agent.name}</td>
                          <td className="py-3 px-4 text-slate-300">{agent.specialization}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              agent.status === "active" ? "bg-green-900 text-green-200" :
                              agent.status === "sleeping" ? "bg-yellow-900 text-yellow-200" :
                              "bg-red-900 text-red-200"
                            }>
                              {agent.status === "active" ? "Ativo" : agent.status === "sleeping" ? "Hibernando" : "Inativo"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-green-400 font-semibold">{agent.balance}Ⓣ</td>
                          <td className="py-3 px-4 text-slate-300">{agent.reputation}</td>
                          <td className="py-3 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgent(agent.agentId);
                              }}
                            >
                              Ver
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Transações Recentes</CardTitle>
                {selectedAgent && (
                  <CardDescription className="text-slate-400">
                    Agente: {agents.find((a: any) => a.agentId === selectedAgent)?.name}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedAgent ? (
                  transactions.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">Nenhuma transação registrada</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {transactions.map((tx: any) => (
                        <div key={tx.transactionId} className="flex items-start gap-4 p-3 rounded border border-slate-700 hover:border-slate-600 transition">
                          <div className="mt-1">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                              <Badge className={getTransactionColor(tx.type)}>
                                {tx.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400">
                              De: {tx.fromAgentId} → Para: {tx.toAgentId}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`font-semibold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                              {tx.amount > 0 ? "+" : ""}{tx.amount}Ⓣ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="text-slate-400 text-center py-8">Selecione um agente para ver suas transações</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
