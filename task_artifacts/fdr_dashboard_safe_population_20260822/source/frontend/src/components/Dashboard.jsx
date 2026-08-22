import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Bitcoin,
  TrendingUp,
  Wallet,
  Settings,
  LogOut,
  RefreshCw,
  Bot,
  PieChart,
  BarChart3,
  DollarSign
} from 'lucide-react'
import OverviewTab from './tabs/OverviewTab'
import AddressesTab from './tabs/AddressesTab'
import ArbitrageTab from './tabs/ArbitrageTab'
import TransactionsTab from './tabs/TransactionsTab'
import SettingsTab from './tabs/SettingsTab'

const Dashboard = ({ user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        setLastUpdate(new Date(data.last_update))
      } else {
        console.error('Erro ao carregar dados do dashboard')
      }
    } catch (error) {
      console.error('Erro de conexão:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('fdr_token')
    localStorage.removeItem('fdr_user')
    onLogout()
  }

  const formatBTC = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    }).format(amount)
  }

  const formatUSD = (btcAmount, btcPrice = 45000) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(btcAmount * btcPrice)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FDR Dashboard</h1>
                <p className="text-sm text-gray-500">Fundo Descentralizado de Reserva</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Bem-vindo, {user.username}</p>
                <p className="text-xs text-gray-500">
                  Última atualização: {lastUpdate?.toLocaleString('pt-BR')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total FDR</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBTC(dashboardData?.total_balance || 0)} BTC</div>
              <p className="text-xs text-muted-foreground">
                {formatUSD(dashboardData?.total_balance || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alocação BNJ57</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBTC(dashboardData?.bnj57_allocation || 0)} BTC</div>
              <p className="text-xs text-muted-foreground">
                7% do total do fundo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Arbitragem</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBTC(dashboardData?.total_arbitrage_profit || 0)} BTC</div>
              <p className="text-xs text-muted-foreground">
                Lucro acumulado dos bots
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Endereços Ativos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.addresses_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                Carteiras monitoradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="addresses">Endereços</TabsTrigger>
            <TabsTrigger value="arbitrage">Arbitragem</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab dashboardData={dashboardData} />
          </TabsContent>

          <TabsContent value="addresses">
            <AddressesTab />
          </TabsContent>

          <TabsContent value="arbitrage">
            <ArbitrageTab />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard
