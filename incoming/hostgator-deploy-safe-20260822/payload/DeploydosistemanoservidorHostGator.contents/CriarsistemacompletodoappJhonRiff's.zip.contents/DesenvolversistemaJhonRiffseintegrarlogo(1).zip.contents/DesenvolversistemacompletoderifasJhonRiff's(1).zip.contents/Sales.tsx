import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const saleSchema = z.object({
  productId: z.number().optional(),
  customerId: z.number(),
  amount: z.string(),
  paymentMethod: z.string(),
  paymentReference: z.string().optional(),
});

type SaleForm = z.infer<typeof saleSchema>;

export default function Sales() {
  const { user } = useAuth();
  const { data: sales, isLoading } = trpc.sales.getUserSales.useQuery(undefined, {
    enabled: !!user,
  });
  const createSaleMutation = trpc.sales.create.useMutation();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<SaleForm>();

  const onSubmit = async (data: SaleForm) => {
    try {
      await createSaleMutation.mutateAsync({
        ...data,
        customerId: parseInt(data.customerId.toString()),
        productId: data.productId ? parseInt(data.productId.toString()) : undefined,
      });
      reset();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao criar venda:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
            <p className="text-gray-600 mt-2">Acompanhe e registre suas vendas</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>

        {/* New Sale Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registrar Nova Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID do Cliente</label>
                    <input
                      type="number"
                      {...register("customerId")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Venda</label>
                    <input
                      type="text"
                      {...register("amount")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
                    <select {...register("paymentMethod")} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="boleto">Boleto</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referência de Pagamento</label>
                    <input
                      type="text"
                      {...register("paymentReference")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createSaleMutation.isPending}>
                    {createSaleMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Registrar Venda
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">ID</th>
                    <th className="text-left py-2 px-4">Cliente</th>
                    <th className="text-left py-2 px-4">Valor</th>
                    <th className="text-left py-2 px-4">Método</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {sales?.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">#{sale.id}</td>
                      <td className="py-2 px-4">{sale.customerId}</td>
                      <td className="py-2 px-4 font-bold">R$ {parseFloat(sale.amount).toFixed(2)}</td>
                      <td className="py-2 px-4">{sale.paymentMethod}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            sale.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : sale.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sales?.length === 0 && (
                <div className="text-center py-8 text-gray-500">Nenhuma venda registrada</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
