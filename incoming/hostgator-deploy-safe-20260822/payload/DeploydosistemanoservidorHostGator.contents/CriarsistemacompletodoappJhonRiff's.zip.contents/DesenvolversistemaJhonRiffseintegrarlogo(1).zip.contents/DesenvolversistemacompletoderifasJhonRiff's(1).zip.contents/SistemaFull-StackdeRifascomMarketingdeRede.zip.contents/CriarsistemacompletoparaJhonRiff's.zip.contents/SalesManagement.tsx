import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function SalesManagement() {
  const { data: sales } = trpc.sales.getAllSales.useQuery();
  const confirmSaleMutation = trpc.sales.confirmSale.useMutation();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const handleConfirmSale = async (saleId: number) => {
    try {
      await confirmSaleMutation.mutateAsync({ saleId });
      alert("Venda confirmada com sucesso!");
    } catch (error) {
      alert("Erro ao confirmar venda");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Vendas</h1>
        <p className="text-muted-foreground mt-2">
          Confirme e acompanhe todas as vendas do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendas Pendentes e Confirmadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Afiliado</th>
                  <th className="text-left py-3 px-4">Valor</th>
                  <th className="text-left py-3 px-4">Comissão</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sales?.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{sale.id}</td>
                    <td className="py-3 px-4">Afiliado #{sale.affiliateId}</td>
                    <td className="py-3 px-4">{formatCurrency(sale.amount)}</td>
                    <td className="py-3 px-4">{formatCurrency(sale.commission)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          sale.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sale.status === "confirmed" ? "Confirmada" : "Pendente"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sale.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleConfirmSale(sale.id)}
                          disabled={confirmSaleMutation.isPending}
                        >
                          Confirmar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
