import { consolidationData } from './data.js'
import bitcoinApi from './services/bitcoinApi.js'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Bitcoin, Wallet, TrendingUp, Clock, CheckCircle, AlertCircle, DollarSign, Activity, Blocks, Hash, RefreshCw } from 'lucide-react'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [realTimeData, setRealTimeData] = useState({
    custodyBalance: 0,
    blockInfo: null,
    bitcoinPrice: { usd: 30000, brl: 150000 },
    sourceWalletsData: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Endereços das carteiras de origem (do arquivo de dados simulados)
  const sourceAddresses = consolidationData.complete_report.source_wallets_detail.map(wallet => wallet.address)
  const custodyAddress = consolidationData.executive_summary["Carteira de Destino"]

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Função para buscar dados reais da mainnet
  const fetchRealTimeData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar informações da carteira de custódia
      let custodyInfo = null
      try {
        custodyInfo = await bitcoinApi.getAddressInfo(custodyAddress)
      } catch (err) {
        console.warn('Erro ao buscar dados da carteira de custódia:', err.message)
      }

      // Buscar informações das carteiras de origem
      let sourceWalletsInfo = []
      try {
        const { results, errors } = await bitcoinApi.getMultipleAddressesInfo(sourceAddresses)
        sourceWalletsInfo = results
        if (errors.length > 0) {
          console.warn('Alguns endereços falharam:', errors)
        }
      } catch (err) {
        console.warn('Erro ao buscar dados das carteiras de origem:', err.message)
      }

      // Buscar informações do último bloco
      let blockInfo = null
      try {
        blockInfo = await bitcoinApi.getLatestBlockInfo()
      } catch (err) {
        console.warn('Erro ao buscar dados do bloco:', err.message)
      }

      // Buscar preço do Bitcoin
      let bitcoinPrice = { usd: 30000, brl: 150000 }
      try {
        bitcoinPrice = await bitcoinApi.getBitcoinPrice()
      } catch (err) {
        console.warn('Erro ao buscar preço do Bitcoin:', err.message)
      }

      setRealTimeData({
        custodyBalance: custodyInfo?.balance || 0,
        custodyInfo,
        blockInfo,
        bitcoinPrice,
        sourceWalletsData: sourceWalletsInfo
      })

    } catch (err) {
      console.error('Erro geral ao buscar dados:', err)
      setError('Erro ao carregar dados da mainnet: ' + err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Função para atualizar dados manualmente
  const handleRefresh = () => {
    setRefreshing(true)
    fetchRealTimeData()
  }

  // Buscar dados iniciais
  useEffect(() => {
    fetchRealTimeData()
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchRealTimeData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Dados combinados: simulados + reais da mainnet
  const walletData = realTimeData.sourceWalletsData.length > 0 
    ? realTimeData.sourceWalletsData.map((wallet, index) => ({
        address: wallet.address,
        balance: wallet.balance,
        totalReceived: wallet.totalReceived,
        totalSent: wallet.totalSent,
        transactionCount: wallet.transactionCount,
        priority: consolidationData.complete_report.source_wallets_detail[index]?.description.includes("Principal") ? "Alta" : 
                 consolidationData.complete_report.source_wallets_detail[index]?.description.includes("Secundária") ? "Alta" : 
                 consolidationData.complete_report.source_wallets_detail[index]?.description.includes("Menor") ? "Baixa" : "Média",
        source: wallet.source
      }))
    : consolidationData.complete_report.source_wallets_detail.map(wallet => ({
        address: wallet.address,
        balance: wallet.original_balance,
        priority: wallet.description.includes("Principal") ? "Alta" : wallet.description.includes("Secundária") ? "Alta" : wallet.description.includes("Menor") ? "Baixa" : "Média",
        source: 'simulated'
      }))

  const totalBTC = walletData.reduce((sum, wallet) => sum + wallet.balance, 0)
  const totalUSD = totalBTC * realTimeData.bitcoinPrice.usd
  const totalBRL = totalBTC * realTimeData.bitcoinPrice.brl

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Bitcoin className="h-10 w-10 text-orange-500" />
                Dashboard de Consolidação Bitcoin
                <Badge variant="outline" className="ml-2">
                  {realTimeData.sourceWalletsData.length > 0 ? 'MAINNET REAL' : 'DADOS SIMULADOS'}
                </Badge>
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Sistema de monitoramento e gestão de operações de consolidação Bitcoin
              </p>
              {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4 mb-2">
                <Button 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Atualizando...' : 'Atualizar'}
                </Button>
                <Badge variant="secondary">
                  BTC: ${realTimeData.bitcoinPrice.usd.toLocaleString()}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Data da Operação</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {new Date(consolidationData.executive_summary["Data de Execução"]).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-slate-400">
                Última atualização: {currentTime.toLocaleTimeString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Carteira Custódia</CardTitle>
              <Bitcoin className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : realTimeData.custodyBalance.toFixed(8)} BTC
              </div>
              <p className="text-xs opacity-80">
                ${(realTimeData.custodyBalance * realTimeData.bitcoinPrice.usd).toLocaleString()}
              </p>
              {realTimeData.custodyInfo && (
                <p className="text-xs opacity-70">
                  Fonte: {realTimeData.custodyInfo.source}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carteira de Destino</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{custodyAddress.slice(0, 8)}...</div>
              <p className="text-xs text-muted-foreground">
                {realTimeData.custodyInfo?.transactionCount || consolidationData.executive_summary["Transações Executadas"]} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Bloco</CardTitle>
              <Blocks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : realTimeData.blockInfo?.height.toLocaleString() || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {realTimeData.blockInfo ? 
                  `${realTimeData.blockInfo.transactionCount} transações` : 
                  'Carregando...'
                }
              </p>
              {realTimeData.blockInfo && (
                <p className="text-xs text-muted-foreground">
                  Fonte: {realTimeData.blockInfo.source}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Carteiras</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBTC.toFixed(8)} BTC</div>
              <p className="text-xs text-muted-foreground">
                R$ {totalBRL.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preço Bitcoin</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${realTimeData.bitcoinPrice.usd.toLocaleString()}</div>
              <p className="text-xs opacity-80">R$ {realTimeData.bitcoinPrice.brl.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="wallets">Carteiras</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="transfers">Transferências</TabsTrigger>
            <TabsTrigger value="blocks">Blocos</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de distribuição de saldos */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Saldos</CardTitle>
                  <CardDescription>Saldos por carteira (BTC)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={walletData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ address, balance }) => `${address.slice(0, 8)}... (${balance.toFixed(4)} BTC)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="balance"
                      >
                        {walletData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} BTC`, 'Saldo']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Estatísticas da Consolidação */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas da Consolidação</CardTitle>
                  <CardDescription>Resultados da operação de consolidação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Transações Executadas</span>
                    <Badge variant="secondary">{consolidationData.complete_report.financial_summary.number_of_transactions}</Badge>
                  </div>
                  <Progress value={(consolidationData.complete_report.financial_summary.number_of_transactions / consolidationData.complete_report.source_wallets_detail.length) * 100} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valor Líquido Recebido</span>
                    <Badge variant="outline">{consolidationData.complete_report.financial_summary.net_amount_received.toFixed(8)} BTC</Badge>
                  </div>
                  <Progress value={100} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa Média por Transação</span>
                    <Badge variant="destructive">{(consolidationData.complete_report.financial_summary.total_fees_paid / consolidationData.complete_report.financial_summary.number_of_transactions).toFixed(8)} BTC</Badge>
                  </div>
                  <Progress value={100} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wallets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Carteiras de Origem da Consolidação</CardTitle>
                <CardDescription>Detalhes das carteiras que contribuíram para a consolidação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletData.map((wallet, index) => (
                    <div key={wallet.address} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full">
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-mono text-sm">{wallet.address}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              Prioridade: {wallet.priority}
                            </Badge>
                            <Badge variant={wallet.source === 'simulated' ? 'secondary' : 'default'}>
                              {wallet.source === 'simulated' ? 'Simulado' : `Real (${wallet.source})`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{wallet.balance.toFixed(8)} BTC</p>
                        <p className="text-sm text-muted-foreground">
                          ${(wallet.balance * realTimeData.bitcoinPrice.usd).toLocaleString()}
                        </p>
                        {wallet.transactionCount && (
                          <p className="text-xs text-muted-foreground">
                            {wallet.transactionCount} transações
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance das APIs</CardTitle>
                <CardDescription>Status e performance das APIs de blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Blockstream API</p>
                        <p className="text-sm text-muted-foreground">API principal para dados da blockchain</p>
                      </div>
                    </div>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">BlockCypher API</p>
                        <p className="text-sm text-muted-foreground">API de fallback para dados da blockchain</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Standby</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">CoinGecko API</p>
                        <p className="text-sm text-muted-foreground">API para preços de criptomoedas</p>
                      </div>
                    </div>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transferências</CardTitle>
                <CardDescription>Transações de consolidação executadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consolidationData.complete_report.transaction_confirmations.map((tx, index) => (
                    <div key={tx.tx_hash} className="flex flex-col p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">Transação #{tx.transaction_number}</span>
                        <Badge variant={tx.confirmation_status === 'CONFIRMADA' ? 'default' : 'destructive'}>
                          {tx.confirmation_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Hash:</strong> 
                        <span className="font-mono ml-2">{tx.tx_hash}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>De:</strong> {tx.from_address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Para:</strong> {tx.to_address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Valor:</strong> {tx.amount_btc} BTC
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Taxa:</strong> {tx.fee_btc} BTC
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Confirmações:</strong> {tx.confirmations}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Blockchain</CardTitle>
                <CardDescription>Dados em tempo real da rede Bitcoin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Altura do Último Bloco</span>
                      <Badge variant="outline">
                        {loading ? '...' : realTimeData.blockInfo?.height.toLocaleString() || 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Hash do Último Bloco</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {loading ? '...' : realTimeData.blockInfo?.hash.slice(0, 10) + '...' || 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Transações no Bloco</span>
                      <Badge variant="outline">
                        {loading ? '...' : realTimeData.blockInfo?.transactionCount || 'N/A'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Fonte dos Dados</span>
                      <Badge variant="default">
                        {loading ? '...' : realTimeData.blockInfo?.source || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Preço BTC (USD)</span>
                      <Badge variant="outline">
                        ${realTimeData.bitcoinPrice.usd.toLocaleString()}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Preço BTC (BRL)</span>
                      <Badge variant="outline">
                        R$ {realTimeData.bitcoinPrice.brl.toLocaleString('pt-BR')}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status da Rede</span>
                      <Badge variant="default">
                        {loading ? 'Carregando...' : 'Online'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Última Atualização</span>
                      <Badge variant="secondary">
                        {currentTime.toLocaleTimeString("pt-BR")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App

