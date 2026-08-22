import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";

export default function Sales() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "",
    paymentReference: "",
  });

  const { data: sales, isLoading, refetch } = trpc.sales.getMySales.useQuery();
  const createSaleMutation = trpc.sales.create.useMutation();
  const confirmSaleMutation = trpc.sales.confirmSale.useMutation();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSaleMutation.mutateAsync({
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference,
      });
      setFormData({ amount: "", paymentMethod: "", paymentReference: "" });
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Erro ao criar venda:", error);
    }
  };

  const handleConfirmSale = async (saleId: number) => {
    try {
      await confirmSaleMutation.mutateAsync({ saleId });
      refetch();
    } catch (error) {
      console.error("Erro ao confirmar venda:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
            <p className="text-muted-foreground mt-2">
              Registre e gerencie suas vendas
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>

        {/* New Sale Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Registrar Nova Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valor da Venda (R$)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">Selecione um método</option>
                    <option value="boleto">Boleto</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="pix">PIX</option>
                    <option value="transfer">Transferência Bancária</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Referência de Pagamento
                  </label>
                  <Input
                    type="text"
                    value={formData.paymentReference}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentReference: e.target.value })
                    }
                    placeholder="Número do boleto, transação, etc."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={createSaleMutation.isPending}
                    className="flex-1"
                  >
                    {createSaleMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Registrar Venda"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vendas</CardTitle>
            <CardDescription>
              Todas as suas vendas registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
            ) : sales && sales.length > 0 ? (
              <div className="space-y-3">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(sale.status)}
                      <div className="flex-1">
                        <p className="font-medium">Venda #{sale.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleDateString("pt-BR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <p className="font-bold">
                        R$ {parseFloat(sale.amount.toString()).toFixed(2).replace(".", ",")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getStatusLabel(sale.status)}
                      </p>
                    </div>

                    {sale.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmSale(sale.id)}
                        disabled={confirmSaleMutation.isPending}
                      >
                        {confirmSaleMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Confirmar"
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem vendas registradas
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Registrar Primeira Venda
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Summary */}
        {sales && sales.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  R${" "}
                  {sales
                    .reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vendas Confirmadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {sales.filter((s) => s.status === "confirmed").length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vendas Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {sales.filter((s) => s.status === "pending").length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
