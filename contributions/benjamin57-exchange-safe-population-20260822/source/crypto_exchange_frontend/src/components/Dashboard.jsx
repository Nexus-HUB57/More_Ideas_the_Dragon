import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'

const Dashboard = ({ user }) => {
  const [wallets, setWallets] = useState([])
  const [marketData, setMarketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchWallets = async () => {
    try {
      const response = await fetch(`/api/wallets?user_id=${user.id}`)
      const data = await response.json()
      if (response.ok) {
        setWallets(data.wallets || [])
      }
    } catch (error) {
      console.error('Erro ao buscar carteiras:', error)
    }
  }

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market-data/BNJ/USDT')
      const data = await response.json()
      if (response.ok) {
        setMarketData(data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados de mercado:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([fetchWallets(), fetchMarketData()])
    setRefreshing(false)
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchWallets(), fetchMarketData()])
      setLoading(false)
    }
    loadData()
  }, [user.id])

  const calculateTotalBalance = () => {
    const prices = {
      'BTC': 45000,
      'ETH': 3000,
      'LTC': 100,
      'BNJ': marketData?.price || 1.10,
      'USDT': 1.0
    }

    return wallets.reduce((total, wallet) => {
      const price = prices[wallet.currency] || 1
      return total + (wallet.balance * price)
    }, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  const totalBalanceUSD = calculateTotalBalance()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-300">Bem-vindo de volta, {user.full_name || user.username}!</p>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Saldo Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${totalBalanceUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-400">
              Equivalente em USD
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              BNJ/USDT
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${marketData?.price?.toFixed(4) || '1.1000'}
            </div>
            <p className="text-xs text-green-400 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{marketData?.change_24h?.toFixed(2) || '0.00'}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Carteiras Ativas
            </CardTitle>
            <Wallet className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {wallets.length}
            </div>
            <p className="text-xs text-gray-400">
              Moedas diferentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Volume 24h
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${marketData?.volume_24h?.toLocaleString('pt-BR') || '0'}
            </div>
            <p className="text-xs text-gray-400">
              BNJ/USDT
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Minhas Carteiras
            </CardTitle>
            <CardDescription className="text-gray-300">
              Saldos das suas criptomoedas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wallets.map((wallet) => {
                const prices = {
                  'BTC': 45000,
                  'ETH': 3000,
                  'LTC': 100,
                  'BNJ': marketData?.price || 1.10,
                  'USDT': 1.0
                }
                const price = prices[wallet.currency] || 1
                const valueUSD = wallet.balance * price

                return (
                  <div key={wallet.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {wallet.currency.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{wallet.currency}</p>
                        <p className="text-gray-400 text-sm">
                          {wallet.balance.toLocaleString('pt-BR', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        ${valueUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-gray-400 text-sm">
                        ${price.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )
              })}
              
              {wallets.length === 0 && (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma carteira encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Mercado BNJ/USDT
            </CardTitle>
            <CardDescription className="text-gray-300">
              Informações em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Preço Atual</span>
                <span className="text-white font-bold text-lg">
                  ${marketData?.price?.toFixed(4) || '1.1000'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Variação 24h</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{marketData?.change_24h?.toFixed(2) || '0.00'}%
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Máxima 24h</span>
                <span className="text-white">
                  ${marketData?.high_24h?.toFixed(4) || '1.1000'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Mínima 24h</span>
                <span className="text-white">
                  ${marketData?.low_24h?.toFixed(4) || '1.1000'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Volume 24h</span>
                <span className="text-white">
                  ${marketData?.volume_24h?.toLocaleString('pt-BR') || '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Ações Rápidas</CardTitle>
          <CardDescription className="text-gray-300">
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => window.location.href = '/exchange'}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Ir para Exchange
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => window.location.href = '/p2p'}
            >
              <Users className="h-4 w-4 mr-2" />
              Mercado P2P
            </Button>
            
            <Button 
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => window.location.href = '/profile'}
            >
              <User className="h-4 w-4 mr-2" />
              Meu Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

