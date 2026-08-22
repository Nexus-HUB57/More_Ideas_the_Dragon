import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Bitcoin, 
  TrendingUp, 
  Wallet, 
  Shield, 
  Activity, 
  Upload, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  Eye,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Loader2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import ApiService from './services/api.js'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Estados dos dados
  const [overviewData, setOverviewData] = useState(null)
  const [walletsData, setWalletsData] = useState(null)
  const [fdrData, setFdrData] = useState(null)
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState([])
  const [arbitragePerformance, setArbitragePerformance] = useState(null)
  const [exchangesStatus, setExchangesStatus] = useState([])
  const [transfersData, setTransfersData] = useState(null)
  const [monitoringStatus, setMonitoringStatus] = useState({ is_monitoring: true })
  const [uploadedFiles, setUploadedFiles] = useState([])

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [
        overview,
        wallets,
        fdr,
        opportunities,
        performance,
        exchanges,
        transfers,
        monitoring
      ] = await Promise.all([
        ApiService.getOverview(),
        ApiService.getWallets(),
        ApiService.getFdrInfo(),
        ApiService.getArbitrageOpportunities(),
        ApiService.getArbitragePerformance(),
        ApiService.getExchangesStatus(),
        ApiService.getTransfers(),
        ApiService.getMonitoringStatus()
      ])

      setOverviewData(overview)
      setWalletsData(wallets)
      setFdrData(fdr)
      setArbitrageOpportunities(opportunities.opportunities || [])
      setArbitragePerformance(performance)
      setExchangesStatus(exchanges.exchanges || [])
      setTransfersData(transfers)
      setMonitoringStatus(monitoring)

    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message)
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleMonitoring = async () => {
    try {
      const newStatus = !monitoringStatus.is_monitoring
      const response = await ApiService.toggleMonitoring(newStatus)
      setMonitoringStatus({ is_monitoring: newStatus })
    } catch (err) {
      setError('Erro ao alterar status do monitoramento: ' + err.message)
    }
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    
    // Adicionar arquivos com status "processing"
    const newFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'processing'
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    try {
      const response = await ApiService.uploadWalletFiles(files)
      
      // Atualizar status dos arquivos baseado na resposta
      setUploadedFiles(prev => prev.map(file => {
        const processedFile = response.processed_files.find(pf => pf.name === file.name)
        return processedFile ? { ...file, status: processedFile.status, message: processedFile.message } : file
      }))
      
      // Recarregar dados das carteiras
      const updatedWallets = await ApiService.getWallets()
      setWalletsData(updatedWallets)
      
    } catch (err) {
      setError('Erro ao fazer upload dos arquivos: ' + err.message)
      // Marcar arquivos como erro
      setUploadedFiles(prev => prev.map(file => 
        newFiles.some(nf => nf.name === file.name) ? { ...file, status: 'error' } : file
      ))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={loadInitialData} className="mt-4">
            Tentar Novamente
          </Button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Dashboard de Arbitragem
              </h1>
              <p className="text-slate-300">
                Fundo Descentralizado de Reserva (FDR) - Sistema de Monitoramento
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={monitoringStatus.is_monitoring ? "default" : "secondary"} className="px-3 py-1">
                <Activity className="w-4 h-4 mr-1" />
                {monitoringStatus.is_monitoring ? 'Monitorando' : 'Pausado'}
              </Badge>
              <Button 
                onClick={handleToggleMonitoring}
                variant={monitoringStatus.is_monitoring ? "destructive" : "default"}
              >
                {monitoringStatus.is_monitoring ? 'Pausar' : 'Iniciar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        {overviewData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                <Bitcoin className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData.total_balance.toLocaleString('pt-BR')} BTC</div>
                <p className="text-blue-100 text-xs">≈ $940M USD</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">FDR Balance</CardTitle>
                <Wallet className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData.fdr_balance.toLocaleString('pt-BR')} BTC</div>
                <p className="text-green-100 text-xs">Fundo Ativo</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Arbitragem</CardTitle>
                <TrendingUp className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData.arbitrage_profit.toLocaleString('pt-BR')} BTC</div>
                <p className="text-purple-100 text-xs">+12.3% este mês</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-0 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
                <Zap className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewData.active_opportunities}</div>
                <p className="text-orange-100 text-xs">Ativas agora</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="wallets" className="data-[state=active]:bg-blue-600">
              <Wallet className="w-4 h-4 mr-2" />
              Carteiras
            </TabsTrigger>
            <TabsTrigger value="fdr" className="data-[state=active]:bg-blue-600">
              <Shield className="w-4 h-4 mr-2" />
              FDR
            </TabsTrigger>
            <TabsTrigger value="arbitrage" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Arbitragem
            </TabsTrigger>
            <TabsTrigger value="transfers" className="data-[state=active]:bg-blue-600">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Transferências
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {overviewData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Evolução dos Lucros</CardTitle>
                    <CardDescription className="text-slate-400">
                      Lucros mensais de arbitragem em BTC
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={overviewData.profit_data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="profit" 
                          stroke="#4361ee" 
                          strokeWidth={3}
                          name="Lucro (BTC)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Distribuição de Carteiras</CardTitle>
                    <CardDescription className="text-slate-400">
                      Saldos por carteira identificada
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={overviewData.wallet_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value.toLocaleString('pt-BR')} BTC`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {overviewData.wallet_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Oportunidades de Arbitragem Ativas */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Oportunidades de Arbitragem Ativas
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Spreads detectados entre exchanges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {arbitrageOpportunities.map((opp, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          {opp.pair}
                        </Badge>
                        <div className="text-sm text-slate-300">
                          <div>Comprar: <span className="text-green-400">{opp.buy_exchange}</span></div>
                          <div>Vender: <span className="text-red-400">{opp.sell_exchange}</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{opp.spread}%</div>
                        <div className="text-sm text-green-400">+{opp.profit.toLocaleString('pt-BR')} BRL</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Carteiras */}
          <TabsContent value="wallets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Carteiras Identificadas</CardTitle>
                  <CardDescription className="text-slate-400">
                    Resultado da varredura de saldos blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div clas
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)