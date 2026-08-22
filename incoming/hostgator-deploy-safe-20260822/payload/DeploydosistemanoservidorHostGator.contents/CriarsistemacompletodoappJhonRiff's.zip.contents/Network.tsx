import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Users, TrendingUp, Award } from "lucide-react";

export default function Network() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: upline, isLoading: uplineLoading } = trpc.network.getUpline.useQuery();
  const { data: directDownline, isLoading: directDownlineLoading } = trpc.network.getDirectDownline.useQuery();
  const { data: fullNetwork, isLoading: fullNetworkLoading } = trpc.network.getFullNetwork.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.network.getNetworkStats.useQuery();

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
          <h1 className="text-2xl font-bold text-gray-900">Minha Rede</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Network Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Rede Direta
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.directDownlineCount || 0}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Rede Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-green-600">
                  {stats?.totalNetworkCount || 0}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Meu Upline
            </CardTitle>
            <CardDescription>Seu indicador direto</CardDescription>
          </CardHeader>
          <CardContent>
            {uplineLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : upline ? (
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nome</p>
                    <p className="text-lg font-semibold text-gray-900">{upline.name}</p>
                    <p className="text-sm text-gray-600 mt-2">{upline.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Nível</p>
                    <p className="text-lg font-semibold text-amber-600">
                      {upline.careerLevel}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {upline.points} pontos
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Você é um membro independente sem upline
              </p>
            )}
          </CardContent>
        </Card>

        {/* Direct Downline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Rede Direta
            </CardTitle>
            <CardDescription>
              {directDownline?.length || 0} membros indicados por você
            </CardDescription>
          </CardHeader>
          <CardContent>
            {directDownlineLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : directDownline && directDownline.length > 0 ? (
              <div className="space-y-3">
                {directDownline.map((member: any) => (
                  <div
                    key={member.id}
                    className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Nível</p>
                      <p className="font-semibold text-blue-600">{member.careerLevel}</p>
                      <p className="text-xs text-gray-600 mt-1">{member.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Você ainda não tem membros na sua rede direta
              </p>
            )}
          </CardContent>
        </Card>

        {/* Full Network */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Rede Completa
            </CardTitle>
            <CardDescription>
              Todos os membros da sua rede (até 4 níveis de profundidade)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fullNetworkLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : fullNetwork && fullNetwork.length > 0 ? (
              <div className="space-y-3">
                {fullNetwork.map((member: any) => (
                  <div
                    key={member.id}
                    className="bg-green-50 rounded-lg p-4 border border-green-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Nível</p>
                      <p className="font-semibold text-green-600">{member.careerLevel}</p>
                      <p className="text-xs text-gray-600 mt-1">{member.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Sua rede ainda está vazia
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
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setLocation("/products")}
          >
            Convidar Membros
          </Button>
        </div>
      </div>
    </div>
  );
}
