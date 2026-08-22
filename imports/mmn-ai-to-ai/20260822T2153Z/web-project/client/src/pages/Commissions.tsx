import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Commissions() {
  const [period, setPeriod] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  
  const { data: commissions, isLoading, refetch } = trpc.commissions.getCommissions.useQuery({ period: period || undefined });
  const withdrawalMutation = trpc.commissions.requestWithdrawal.useMutation();

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount) return;
    
    try {
      await withdrawalMutation.mutateAsync({
        amount: withdrawalAmount,
        bankAccount: "12345678", // This should come from user input
      });
      setShowWithdrawalModal(false);
      setWithdrawalAmount("");
      refetch();
    } catch (error) {
      console.error("Withdrawal error:", error);
    }
  };

  const totalCommissions = commissions?.reduce((sum, c) => {
    const amount = typeof c.amount === 'string' ? parseFloat(c.amount) : c.amount;
    return sum + amount;
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted">Carregando comissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comissões</h1>
          <p className="text-muted mt-1">Acompanhe suas comissões e solicite saques</p>
        </div>
        <Button onClick={onRefresh} disabled={refreshing} variant="outline">
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Atualizar
        </Button>
      </div>

      {/* Summary */}
      <Card className="p-6 bg-card border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted">Total de Comissões</p>
            <p className="text-3xl font-bold text-primary mt-2">
              R$ {totalCommissions.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">Comissões Confirmadas</p>
            <p className="text-3xl font-bold text-green-500 mt-2">
              R$ {(commissions?.filter(c => c.status === 'confirmed').reduce((sum, c) => {
                const amount = typeof c.amount === 'string' ? parseFloat(c.amount) : c.amount;
                return sum + amount;
              }, 0) || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 bg-card border border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground block mb-2">
              Filtrar por período
            </label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os períodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os períodos</SelectItem>
                <SelectItem value="2026-05">Maio 2026</SelectItem>
                <SelectItem value="2026-04">Abril 2026</SelectItem>
                <SelectItem value="2026-03">Março 2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setPeriod("")} variant="outline" className="mt-6">
            Limpar
          </Button>
        </div>
      </Card>

      {/* Commissions List */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Histórico de Comissões</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {commissions && commissions.length > 0 ? (
            commissions.map((commission) => (
              <div key={commission.id} className="p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <p className="font-medium text-foreground">
                        R$ {typeof commission.amount === 'string' ? commission.amount : commission.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-muted">
                      <span className="capitalize">Tipo: {commission.type || '-'}</span>
                      <span className="capitalize">Status: {commission.status || '-'}</span>
                      <span>Período: {commission.period || '-'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">
                      {commission.createdAt ? new Date(commission.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                      commission.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                      commission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {commission.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted">Nenhuma comissão encontrada</p>
            </div>
          )}
        </div>
      </Card>

      {/* Withdrawal Request */}
      <Button 
        className="w-full h-12 text-base"
        onClick={() => setShowWithdrawalModal(true)}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Solicitar Saque
      </Button>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 bg-card border border-border max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Solicitar Saque</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Valor do Saque (R$)
                </label>
                <input
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted">
                  <span className="font-medium">Confirmação:</span> Você está solicitando um saque de R$ {withdrawalAmount || "0,00"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowWithdrawalModal(false);
                    setWithdrawalAmount("");
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleWithdrawal}
                  disabled={!withdrawalAmount || withdrawalMutation.isPending}
                >
                  {withdrawalMutation.isPending ? "Processando..." : "Confirmar Saque"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
