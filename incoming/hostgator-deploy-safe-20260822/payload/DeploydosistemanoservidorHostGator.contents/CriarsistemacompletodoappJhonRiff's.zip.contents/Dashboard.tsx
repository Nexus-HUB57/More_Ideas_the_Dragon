import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { TrendingUp, Users, Gift, BarChart3, LogOut, Menu } from "lucide-react";
import { APP_LOGO } from "@/const";
import { useState } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();

  const { data: summary, isLoading: summaryLoading } = trpc.dashboard.getSummary.useQuery();
  const { data: profile, isLoading: profileLoading } = trpc.profile.getProfile.useQuery();
  const { data: commissions, isLoading: commissionsLoading } = trpc.commissions.getSummary.useQuery();
  const { data: networkStats, isLoading: networkLoading } = trpc.network.getNetworkStats.useQuery();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const navigationItems = [
    { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { label: "Meu Perfil", path: "/profile", icon: Users },
    { label: "Minha Rede", path: "/network", icon: Users },
    { label: "Produtos", path: "/products", icon: BarChart3 },
    { label: "Vendas", path: "/sales", icon: TrendingUp },
    { label: "Comissões", path: "/commissions", icon: TrendingUp },
    { label: "Sorteios", path: "/lottery", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-blue-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />
              <span className="font-bold">Jhon Riff's</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-blue-800 rounded"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo, {user?.name}!
            </h2>
            <p className="text-gray-600">
              {profileLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                `Seu nível atual: ${profile?.careerLevel || "Inscrito"}`
              )}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Sales */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {summary?.totalSales || "0,00"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Total Commissions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Comissões Totais</CardTitle>
              </CardHeader>
              <CardContent>
                {commissionsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    R$ {commissions?.total || "0,00"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pending Commissions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Comissões Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                {commissionsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-amber-600">
                    R$ {commissions?.pending || "0,00"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Network Count */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Rede Direta</CardTitle>
              </CardHeader>
              <CardContent>
                {networkLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {networkStats?.directDownlineCount || 0}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>Últimas 5 vendas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : summary?.recentSales && summary.recentSales.length > 0 ? (
                  <div className="space-y-3">
                    {summary.recentSales.map((sale: any) => (
                      <div key={sale.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium text-gray-900">Venda #{sale.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900">R$ {sale.amount}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">Nenhuma venda realizada ainda</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Commissions */}
            <Card>
              <CardHeader>
                <CardTitle>Comissões Recentes</CardTitle>
                <CardDescription>Últimas 5 comissões recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                {commissionsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : summary?.recentCommissions && summary.recentCommissions.length > 0 ? (
                  <div className="space-y-3">
                    {summary.recentCommissions.map((commission: any) => (
                      <div key={commission.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium text-gray-900">{commission.type === "direct" ? "Comissão Direta" : "Comissão Unilevel"}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(commission.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">R$ {commission.amount}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">Nenhuma comissão recebida ainda</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation("/products")}
            >
              Ver Produtos
            </Button>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => setLocation("/network")}
            >
              Gerenciar Rede
            </Button>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700"
              onClick={() => setLocation("/lottery")}
            >
              Participar de Sorteios
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
