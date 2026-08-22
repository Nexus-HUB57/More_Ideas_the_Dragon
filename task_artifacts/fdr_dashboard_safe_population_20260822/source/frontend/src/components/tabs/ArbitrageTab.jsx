import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bot,
  Play,
  Pause,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

const ArbitrageTab = () => {
  const [bots, setBots] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchBotsData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/arbitrage/bots', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBots(data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos bots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBotsData()
  }, [])

  const handleBotAction = async (action, exchange = 'all') => {
    setActionLoading(`${action}-${exchange}`)
    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/arbitrage/control', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, exchange }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Ação executada:', result)
        // Atualizar dados dos bots após a ação
        await fetchBotsData()
      }
    } catch (error) {
      console.error('Erro ao executar ação do bot:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatBTC = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount)
  }

  const formatUSDT = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getBotStatus = (bot) => {
    // Simulação de status baseado no lucro
    if (bot.profit > 0.2) return { status: 'active', label: 'Ativo', color: 'bg-green-500' }
    if (bot.profit > 0) return { status: 'idle', label: 'Aguardando', color: 'bg-yellow-500' }
    return { status: 'stopped', label: 'Parado', color: 'bg-red-500' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 animate-pulse" />
          <span>Carregando dados dos bots...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Controle Global dos Bots</span>
          </CardTitle>
          <CardDescription>
            Controle todos os bots de arbitragem simultaneamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              onClick={() => handleBotAction('start')}
              disabled={actionLoading === 'start-all'}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {actionLoading === 'start-all' ? 'Iniciando...' : 'Iniciar Todos'}
            </Button>
            <Button
              onClick={() => handleBotAction('stop')}
              disabled={actionLoading === 'stop-all'}
              variant="destructive"
            >
              <Pause className="w-4 h-4 mr-2" />
              {actionLoading === 'stop-all' ? 'Parando...' : 'Parar Todos'}
            </Button>
            <Button
              onClick={() => handleBotAction('manual')}
              disabled={actionLoading === 'manual-all'}
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              {actionLoading === 'manual-all' ? 'Ativando...' : 'Modo Manual'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Bots por Exchange */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {bots.map((bot, index) => {
          const status = getBotStatus(bot)
          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{bot.exchange}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <Badge variant="outline">{status.label}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saldos */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">BTC:</span>
                    <span className="font-medium">{formatBTC(bot.btc_balance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">USDT:</span>
                    <span className="font-medium">{formatUSDT(bot.usdt_balance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ETH:</span>
                    <span className="font-medium">{formatBTC(bot.eth_balance)} ETH</span>
                  </div>
                </div>

                {/* Lucro */}
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lucro:</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-green-600">
                        {formatBTC(bot.profit)} BTC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controles Individuais */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleBotAction('start', bot.exchange)}
                    disabled={actionLoading === `start-${bot.exchange}`}
                    className="flex-1"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Iniciar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBotAction('stop', bot.exchange)}
                    disabled={actionLoading === `stop-${bot.exchange}`}
                    className="flex-1"
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Parar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informações Importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Os bots de arbitragem estão em desenvolvimento.
            As funcionalidades de controle serão ativadas quando a integração estiver completa.
          </AlertDescription>
        </Alert>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Repasse de Lucros:</strong> Os lucros são transferidos automaticamente
            para o FDR a cada 10 dias.
          </AlertDescription>
        </Alert>
      </div>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Arbitragem</CardTitle>
          <CardDescription>
            Parâmetros avançados para os bots de arbitragem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="parameters">
            <TabsList>
              <TabsTrigger value="parameters">Parâmetros</TabsTrigger>
              <TabsTrigger value="limits">Limites</TabsTrigger>
              <TabsTrigger value="schedule">Agendamento</TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Margem Mínima (%)</label>
                  <p className="text-sm text-gray-500">0.15%</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Volume Máximo por Operação</label>
                  <p className="text-sm text-gray-500">1.0 BTC</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Limite Diário</label>
                  <p className="text-sm text-gray-500">50 operações</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Stop Loss</label>
                  <p className="text-sm text-gray-500">-2%</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Horário de Operação</label>
                <p className="text-sm text-gray-500">24/7 (Contínuo)</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ArbitrageTab
