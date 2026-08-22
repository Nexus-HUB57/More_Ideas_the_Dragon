import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Gift, Sparkles, Dice5 } from "lucide-react";
import { useState } from "react";

export default function Lottery() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [generatedNumber, setGeneratedNumber] = useState<number | null>(null);

  const { data: luckyNumbers, isLoading: numbersLoading } = trpc.lottery.getLuckyNumbers.useQuery();
  const { data: generatedNumberData } = trpc.lottery.generateLuckyNumber.useQuery();

  const handleGenerateNumber = async () => {
    setGeneratedNumber(generatedNumberData?.number || null);
  };

  const winnerCount = luckyNumbers?.filter((n: any) => n.isWinner).length || 0;
  const totalPrize = luckyNumbers
    ?.filter((n: any) => n.isWinner)
    .reduce((sum: number, n: any) => sum + parseFloat(n.prize || 0), 0) || 0;

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
          <h1 className="text-2xl font-bold text-gray-900">+Sorte</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="pt-8">
            <div className="flex items-center gap-4 mb-4">
              <Gift className="h-8 w-8" />
              <h2 className="text-3xl font-bold">Programa +Sorte</h2>
            </div>
            <p className="text-lg mb-4">
              Participe do programa de sorteios vinculado à Loteria Federal e ganhe prêmios incríveis!
            </p>
            <p className="text-sm opacity-90">
              Quanto mais você vende e cresce sua rede, mais números da sorte você gera.
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Números</CardTitle>
            </CardHeader>
            <CardContent>
              {numbersLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-purple-600">
                  {luckyNumbers?.length || 0}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Prêmios Ganhos</CardTitle>
            </CardHeader>
            <CardContent>
              {numbersLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalPrize.toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Números Premiados</CardTitle>
            </CardHeader>
            <CardContent>
              {numbersLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-amber-600">{winnerCount}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generate Number Section */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice5 className="h-5 w-5 text-blue-600" />
              Gerar Número da Sorte
            </CardTitle>
            <CardDescription>
              Clique para gerar um novo número da sorte para participar dos sorteios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {generatedNumber !== null && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Seu número da sorte:</p>
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <span className="text-4xl font-bold">{generatedNumber}</span>
                  </div>
                </div>
              )}
              <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleGenerateNumber}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Gerar Número
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold">
                  1
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Gere Números da Sorte</p>
                <p className="text-sm text-gray-600">
                  Cada venda realizada gera automaticamente números da sorte para você.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold">
                  2
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Acompanhe os Sorteios</p>
                <p className="text-sm text-gray-600">
                  Seus números participam automaticamente dos sorteios vinculados à Loteria Federal.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-bold">
                  3
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ganhe Prêmios</p>
                <p className="text-sm text-gray-600">
                  Se seus números forem sorteados, você recebe os prêmios automaticamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lucky Numbers History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              Meus Números da Sorte
            </CardTitle>
            <CardDescription>
              Histórico de todos os seus números gerados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {numbersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : luckyNumbers && luckyNumbers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {luckyNumbers.map((lucky: any) => (
                  <div
                    key={lucky.id}
                    className={`p-4 rounded-lg border-2 text-center ${
                      lucky.isWinner
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p className="text-sm text-gray-600 mb-2">Número</p>
                    <p className="text-3xl font-bold text-purple-600 mb-3">
                      {lucky.number}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {new Date(lucky.drawDate).toLocaleDateString("pt-BR")}
                    </p>
                    {lucky.isWinner && (
                      <div>
                        <p className="text-xs text-green-600 font-semibold mb-1">
                          🎉 PREMIADO!
                        </p>
                        <p className="text-sm font-bold text-green-600">
                          R$ {parseFloat(lucky.prize || 0).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Você ainda não gerou nenhum número da sorte. Comece a vender para gerar números!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/dashboard")}
          >
            Voltar
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setLocation("/products")}
          >
            Vender e Gerar Números
          </Button>
        </div>
      </div>
    </div>
  );
}
