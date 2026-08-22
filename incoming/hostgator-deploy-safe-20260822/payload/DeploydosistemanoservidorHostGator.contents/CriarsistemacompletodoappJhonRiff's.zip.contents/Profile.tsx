import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Trophy, Target, TrendingUp } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: profileLoading } = trpc.profile.getProfile.useQuery();
  const { data: careerLevels } = trpc.profile.getCareerLevels.useQuery();

  const currentLevel = careerLevels?.find((l) => l.level === profile?.careerLevel);

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
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profileLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <p className="text-lg text-gray-900">{profile?.name || user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-lg text-gray-900">{profile?.email || user?.email}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Career Level Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Nível de Carreira
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profileLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Nível Atual</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {currentLevel?.title || "Inscrito"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Pontos</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {profile?.points || 0}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Total Investido</p>
                    <p className="text-xl font-bold text-blue-900">
                      R$ {profile?.totalInvested || "0,00"}
                    </p>
                  </div>
                </div>

                {currentLevel && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Requisitos do Nível Atual</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Pontos Necessários</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentLevel.points}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Investimento</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentLevel.investment}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Requisito de Equipe</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {currentLevel.teamRequirement}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Potencial de Ganhos</p>
                        <p className="text-lg font-semibold text-green-600">
                          {currentLevel.earnings}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Career Path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Plano de Carreira Completo
            </CardTitle>
            <CardDescription>
              Visualize todos os 7 níveis e seus requisitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {careerLevels?.map((level, index) => (
                <div
                  key={level.level}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    profile?.careerLevel === level.level
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{level.title}</p>
                          <p className="text-sm text-gray-600">Investimento: {level.investment}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ganhos</p>
                      <p className="font-semibold text-green-600">{level.earnings}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            Explorar Produtos
          </Button>
        </div>
      </div>
    </div>
  );
}
