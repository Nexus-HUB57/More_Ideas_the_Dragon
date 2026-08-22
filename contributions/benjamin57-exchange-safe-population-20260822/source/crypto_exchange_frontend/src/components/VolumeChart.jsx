import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity,
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

const VolumeChart = ({ pair = 'BNJ/USDT', height = 300 }) => {
  const [volumeData, setVolumeData] = useState([])
  const [timeframe, setTimeframe] = useState('1h')
  const [loading, setLoading] = useState(true)

  // Gerar dados simulados de volume
  const generateMockVolumeData = () => {
    const now = new Date()
    const data = []
    
    const intervals = {
      '1m': { count: 60, interval: 1 * 60 * 1000 },
      '5m': { count: 60, interval: 5 * 60 * 1000 },
      '1h': { count: 24, interval: 60 * 60 * 1000 },
      '1d': { count: 30, interval: 24 * 60 * 60 * 1000 }
    }

    const { count, interval } = intervals[timeframe] || intervals['1h']

    for (let i = count; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * interval))
      
      // Simular volume com variações realistas
      const baseVolume = 5000
      const variation = Math.random() * 10000
      const volume = baseVolume + variation
      
      // Simular volume de compra e venda
      const buyRatio = 0.3 + Math.random() * 0.4 // Entre 30% e 70%
      const buyVolume = volume * buyRatio
      const sellVolume = volume * (1 - buyRatio)
      
      data.push({
        time: timestamp.toISOString(),
        timestamp: timestamp.getTime(),
        volume: parseFloat(volume.toFixed(2)),
        buyVolume: parseFloat(buyVolume.toFixed(2)),
        sellVolume: parseFloat(sellVolume.toFixed(2)),
        price: 1.10 + (Math.random() - 0.5) * 0.1 // Preço simulado para correlação
      })
    }

    return data
  }

  const refreshData = () => {
    setLoading(true)
    const newData = generateMockVolumeData()
    setVolumeData(newData)
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
            <p className="text-blue-400 text-sm">
              Volume Total: {data.volume.toLocaleString('pt-BR')}
            </p>
            <p className="text-green-400 text-sm">
              Volume Compra: {data.buyVolume.toLocaleString('pt-BR')}
            </p>
            <p className="text-red-400 text-sm">
              Volume Venda: {data.sellVolume.toLocaleString('pt-BR')}
            </p>
            <p className="text-gray-300 text-xs">
              Preço: ${data.price.toFixed(4)}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const calculateVolumeStats = () => {
    if (volumeData.length === 0) return { totalVolume: 0, avgVolume: 0, maxVolume: 0, buyRatio: 0 }
    
    const totalVolume = volumeData.reduce((sum, item) => sum + item.volume, 0)
    const totalBuyVolume = volumeData.reduce((sum, item) => sum + item.buyVolume, 0)
    const avgVolume = totalVolume / volumeData.length
    const maxVolume = Math.max(...volumeData.map(item => item.volume))
    const buyRatio = (totalBuyVolume / totalVolume) * 100
    
    return { totalVolume, avgVolume, maxVolume, buyRatio }
  }

  const { totalVolume, avgVolume, maxVolume, buyRatio } = calculateVolumeStats()

  if (loading && volumeData.length === 0) {
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
              <Activity className="h-5 w-5 mr-2" />
              Volume de Negociação - {pair}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Análise do volume de compra e venda
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={buyRatio > 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
              {buyRatio > 50 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {buyRatio.toFixed(1)}% Compra
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

        {/* Volume Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Volume Total</p>
            <p className="text-white font-bold">
              {totalVolume.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Volume Médio</p>
            <p className="text-white font-bold">
              {avgVolume.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Volume Máximo</p>
            <p className="text-white font-bold">
              {maxVolume.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Razão Compra/Venda</p>
            <p className={`font-bold ${buyRatio > 50 ? 'text-green-400' : 'text-red-400'}`}>
              {buyRatio.toFixed(1)}% / {(100 - buyRatio).toFixed(1)}%
            </p>
          </div>
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

          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-white">Compra</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-white">Venda</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} barCategoryGap="10%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatXAxisLabel}
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="buyVolume" 
                stackId="volume"
                fill="#10b981"
                name="Volume Compra"
              />
              <Bar 
                dataKey="sellVolume" 
                stackId="volume"
                fill="#ef4444"
                name="Volume Venda"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Analysis */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Análise de Tendência</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pressão de Compra:</span>
                <span className={buyRatio > 60 ? 'text-green-400' : buyRatio > 40 ? 'text-yellow-400' : 'text-red-400'}>
                  {buyRatio > 60 ? 'Alta' : buyRatio > 40 ? 'Moderada' : 'Baixa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Liquidez:</span>
                <span className={avgVolume > 7500 ? 'text-green-400' : avgVolume > 5000 ? 'text-yellow-400' : 'text-red-400'}>
                  {avgVolume > 7500 ? 'Alta' : avgVolume > 5000 ? 'Moderada' : 'Baixa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volatilidade:</span>
                <span className="text-blue-400">Normal</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Estatísticas do Período</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pontos de Dados:</span>
                <span className="text-white">{volumeData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Última Atualização:</span>
                <span className="text-white">{new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Intervalo:</span>
                <span className="text-white">{timeframe}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default VolumeChart

