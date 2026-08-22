import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Download, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Products() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: purchased } = trpc.products.getPurchased.useQuery();
  const createSaleMutation = trpc.sales.create.useMutation();

  const handleBuyProduct = async (productId: number, price: string) => {
    try {
      setSelectedProduct(productId);
      await createSaleMutation.mutateAsync({
        productId,
        amount: price,
      });
      toast.success("Produto adquirido com sucesso!");
      setSelectedProduct(null);
    } catch (error) {
      toast.error("Erro ao adquirir produto");
      setSelectedProduct(null);
    }
  };

  const isPurchased = (productId: number) => {
    return purchased?.some((p: any) => p.product.id === productId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation("/dashboard")}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Info Card */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-blue-900">
              <strong>Ganhe 100% de lucro</strong> na revenda de e-books e PPR (Produtos de Propriedade Replicável).
              Além disso, receba comissões sobre vendas diretas e bonificações da sua rede.
            </p>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </>
          ) : products && products.length > 0 ? (
            products.map((product: any) => {
              const hasPurchased = isPurchased(product.id);
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Preço</p>
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {parseFloat(product.price).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Categoria</p>
                      <p className="text-sm font-medium text-gray-900">
                        {product.category}
                      </p>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      {hasPurchased ? (
                        <>
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Já Adquirido
                          </Button>
                          {product.fileUrl && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => window.open(product.fileUrl, "_blank")}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Baixar
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleBuyProduct(product.id, product.price)}
                          disabled={selectedProduct === product.id || createSaleMutation.isPending}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {selectedProduct === product.id ? "Processando..." : "Comprar Agora"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">Nenhum produto disponível no momento</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
          >
            Voltar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setLocation("/sales")}
          >
            Ver Minhas Vendas
          </Button>
        </div>
      </div>
    </div>
  );
}
