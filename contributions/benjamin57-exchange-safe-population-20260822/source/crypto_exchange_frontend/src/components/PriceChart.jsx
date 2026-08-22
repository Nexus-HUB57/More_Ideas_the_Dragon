import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react'

const PriceChart = ({ pair = 'BNJ/USDT', height = 400 }) => {
  const [chartData, setChartData] = useState([])
  const [timeframe, setTimeframe] = useState('1h')
  const [chartType, setChartType] = useState('line')
  const [marketData, setMarketData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Gerar dados simulados para demonstração
  const generateMockData = () => {
    const now = new Date()
    const data = []
    const basePrice = 1.10
    let currentPrice = basePrice
    
    const intervals = {
      '1m': { count: 60, interval: 1 * 60 * 1000 },
      '5m': { count: 60, interval: 5 * 60 * 1000 },
      '1h': { count: 24, interval: 60 * 60 * 1000 },
      '1d': { count: 30, interval: 24 * 60 * 60 * 1000 }
    }

    const { count, interval } = intervals[timeframe] || intervals['1h']

    for (let i = count; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * interval))
      
      // Simular variação de preço
      const change = (Math.random() - 0.5) * 0.02 // Variação de até 2%
      currentPrice = Math.max(0.5, currentPrice + change)
      
      const volume = Math.random() * 10000 + 1000
      
      data.push({
        time: timestamp.toISOString(),
        timestamp: timestamp.getTime(),
        price: parseFloat(currentPrice.toFixed(4)),
        volume: parseFloat(volume.toFixed(2)),
        high: parseFloat((currentPrice * 1.01).toFixed(4)),
        low: parseFloat((currentPrice * 0.99).toFixed(4)),
        open: parseFloat((currentPrice * 0.995).toFixed(4)),
        close: parseFloat(currentPrice.toFixed(4))
      })
    }

    return data
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

  const refreshData = () => {
    setLoading(true)
    const newData = generateMockData()
    setChartData(newData)
    fetchMarketData()
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 30000) // Atualizar a cada 30 segundos
    return () => clearInterval(interval)
  }, [timeframe])

  const formatXAxisLabel = (tickItem) => {
    const date = new Date(tickItem)
    
    switch (timeframe) {
      case '1m':
      case '5m':
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      case '1h':
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      case '1d':
        return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
      default:
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const formatTooltipLabel = (value) => {
    const date = new Date(value)
    return date.toLocaleString('pt-BR')
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3">
          <p className="text-white text-sm font-medium">
            {formatTooltipLabel(label)}
          </p>
          <div className="space-y-1 mt-2">
            <p className="text-green-400 text-sm">
              Preço: ${data.price.toFixed(4)}
            </p>
            <p className="text-blue-400 text-sm">
              Volume: {data.volume.toLocaleString('pt-BR')}
            </p>
            {data.high && (
              <>
                <p className="text-gray-300 text-xs">
                  Máxima: ${data.high.toFixed(4)}
                </p>
                <p className="text-gray-300 text-xs">
                  Mínima: ${data.low.toFixed(4)}
                </p>
              </>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const calculatePriceChange = () => {
    if (chartData.length < 2) return { change: 0, percentage: 0 }
    
    const firstPrice = chartData[0].price
    const lastPrice = chartData[chartData.length - 1].price
    const change = lastPrice - firstPrice
    const percentage = (change / firstPrice) * 100
    
    return { change, percentage }
  }

  const { change, percentage } = calculatePriceChange()
  const isPositive = change >= 0

  if (loading && chartData.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Gráfico de Preços - {pair}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Acompanhe a evolução dos preços em tempo real
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive ? '+' : ''}{percentage.toFixed(2)}%
            </Badge>
            
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Price Display */}
        <div className="flex items-center space-x-4 mt-4">
          <div>
            <p className="text-2xl font-bold text-white">
              ${chartData.length > 0 ? chartData[chartData.length - 1].price.toFixed(4) : '1.1000'}
            </p>
            <p className={`text-sm flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive ? '+' : ''}${Math.abs(change).toFixed(4)} ({isPositive ? '+' : ''}{percentage.toFixed(2)}%)
            </p>
          </div>
          
          {marketData && (
            <div className="text-sm text-gray-300">
              <p>Volume 24h: ${marketData.volume_24h?.toLocaleString('pt-BR') || '0'}</p>
              <p>Máx 24h: ${marketData.high_24h?.toFixed(4) || '1.1000'}</p>
              <p>Mín 24h: ${marketData.low_24h?.toFixed(4) || '1.1000'}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">Período:</span>
            {['1m', '5m', '1h', '1d'].map((tf) => (
              <Button
                key={tf}
                onClick={() => setTimeframe(tf)}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                className={
                  timeframe === tf
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }
              >
                {tf}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">Tipo:</span>
            <Button
              onClick={() => setChartType('line')}
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              className={
                chartType === 'line'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              Linha
            </Button>
            <Button
              onClick={() => setChartType('area')}
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              className={
                chartType === 'area'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }
            >
              Área
            </Button>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatXAxisLabel}
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis 
                  domain={['dataMin - 0.01', 'dataMax + 0.01']}
                  tickFormatter={(value) => `$${value.toFixed(4)}`}
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatXAxisLabel}
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis 
                  domain={['dataMin - 0.01', 'dataMax + 0.01']}
                  tickFormatter={(value) => `$${value.toFixed(4)}`}
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400">Pontos de Dados</p>
            <p className="text-white font-medium">{chartData.length}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Última Atualização</p>
            <p className="text-white font-medium">
              {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Intervalo</p>
            <p className="text-white font-medium">{timeframe}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PriceChart

