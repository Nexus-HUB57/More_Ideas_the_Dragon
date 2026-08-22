import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PriceChart from './PriceChart'
import VolumeChart from './VolumeChart'
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const Exchange = ({ user }) => {
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] })
  const [recentTrades, setRecentTrades] = useState([])
  const [marketData, setMarketData] = useState(null)
  const [wallets, setWallets] = useState([])
  const [orderForm, setOrderForm] = useState({
    type: 'buy',
    amount: '',
    price: '',
    total: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const fetchOrderbook = async () => {
    try {
      const response = await fetch('/api/orderbook/BNJ/USDT')
      const data = await response.json()
      if (response.ok) {
        setOrderbook(data)
      }
    } catch (error) {
      console.error('Erro ao buscar livro de ordens:', error)
    }
  }

  const fetchRecentTrades = async () => {
    try {
      const response = await fetch('/api/trades/BNJ/USDT?limit=10')
      const data = await response.json()
      if (response.ok) {
        setRecentTrades(data.trades || [])
      }
    } catch (error) {
      console.error('Erro ao buscar trades recentes:', error)
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

  const refreshData = async () => {
    await Promise.all([
      fetchOrderbook(),
      fetchRecentTrades(),
      fetchMarketData(),
      fetchWallets()
    ])
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 5000) // Atualizar a cada 5 segundos
    return () => clearInterval(interval)
  }, [user.id])

  const handleOrderFormChange = (field, value) => {
    const newForm = { ...orderForm, [field]: value }
    
    // Calcular total automaticamente
    if (field === 'amount' || field === 'price') {
      const amount = parseFloat(newForm.amount) || 0
      const price = parseFloat(newForm.price) || 0
      newForm.total = (amount * price).toFixed(4)
    }
    
    // Calcular quantidade automaticamente se total foi alterado
    if (field === 'total') {
      const total = parseFloat(newForm.total) || 0
      const price = parseFloat(newForm.price) || 0
      if (price > 0) {
        newForm.amount = (total / price).toFixed(8)
      }
    }
    
    setOrderForm(newForm)
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          pair: 'BNJ/USDT',
          order_type: orderForm.type,
          amount: parseFloat(orderForm.amount),
          price: parseFloat(orderForm.price)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(`Ordem ${orderForm.type === 'buy' ? 'de compra' : 'de venda'} criada com sucesso!`)
        setOrderForm({ type: orderForm.type, amount: '', price: '', total: '' })
        refreshData()
      } else {
        setMessage(data.error || 'Erro ao criar ordem')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const fillOrderFromBook = (price, amount) => {
    setOrderForm({
      ...orderForm,
      price: price.toString(),
      amount: amount.toString(),
      total: (price * amount).toFixed(4)
    })
  }

  const getBNJWallet = () => wallets.find(w => w.currency === 'BNJ')
  const getUSDTWallet = () => wallets.find(w => w.currency === 'USDT')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Exchange BNJ/USDT</h1>
          <p className="text-gray-300">Negocie Benjamin57 contra Tether USD</p>
        </div>
        <Button
          onClick={refreshData}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Preço Atual</p>
                <p className="text-white font-bold text-lg">
                  ${marketData?.price?.toFixed(4) || '1.1000'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Variação 24h</p>
                <p className="text-green-400 font-bold flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +{marketData?.change_24h?.toFixed(2) || '0.00'}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Máxima 24h</p>
                <p className="text-white font-bold">
                  ${marketData?.high_24h?.toFixed(4) || '1.1000'}
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Volume 24h</p>
                <p className="text-white font-bold">
                  ${marketData?.volume_24h?.toLocaleString('pt-BR') || '0'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PriceChart pair="BNJ/USDT" height={400} />
        <VolumeChart pair="BNJ/USDT" height={400} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Criar Ordem</CardTitle>
            <CardDescription className="text-gray-300">
              Compre ou venda BNJ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={orderForm.type} onValueChange={(value) => setOrderForm({...orderForm, type: value})}>
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="buy" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                  Comprar
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                  Vender
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4 mt-4">
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div>
                    <Label className="text-white">Preço (USDT)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={orderForm.price}
                      onChange={(e) => handleOrderFormChange('price', e.target.value)}
                      placeholder="0.0000"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Quantidade (BNJ)</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={orderForm.amount}
                      onChange={(e) => handleOrderFormChange('amount', e.target.value)}
                      placeholder="0.00000000"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Total (USDT)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={orderForm.total}
                      onChange={(e) => handleOrderFormChange('total', e.target.value)}
                      placeholder="0.0000"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="text-sm text-gray-300">
                    Saldo USDT: {getUSDTWallet()?.available_balance?.toFixed(4) || '0.0000'}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {loading ? 'Criando...' : 'Comprar BNJ'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4 mt-4">
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  <div>
                    <Label className="text-white">Preço (USDT)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={orderForm.price}
                      onChange={(e) => handleOrderFormChange('price', e.target.value)}
                      placeholder="0.0000"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Quantidade (BNJ)</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={orderForm.amount}
                      onChange={(e) => handleOrderFormChange('amount', e.target.value)}
                      placeholder="0.00000000"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Total (USDT)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={orderForm.total}
                      onChange={(e) => handleOrderFormChange('total', e.target.value)}
                      placeholder="0.0000"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div className="text-sm text-gray-300">
                    Saldo BNJ: {getBNJWallet()?.available_balance?.toFixed(8) || '0.00000000'}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 hover:bg-red-600"
                  >
                    {loading ? 'Criando...' : 'Vender BNJ'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {message && (
              <Alert className="mt-4 bg-blue-500/20 border-blue-500/50">
                <AlertDescription className="text-blue-200">
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Order Book */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Livro de Ordens</CardTitle>
            <CardDescription className="text-gray-300">
              BNJ/USDT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Asks (Vendas) */}
              <div>
                <h4 className="text-red-400 font-medium mb-2">Vendas</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {orderbook.asks.slice(0, 10).map((order, index) => (
                    <div
                      key={index}
                      onClick={() => fillOrderFromBook(order.price, order.amount)}
                      className="flex justify-between text-sm cursor-pointer hover:bg-white/5 p-1 rounded"
                    >
                      <span className="text-red-400">{order.price.toFixed(4)}</span>
                      <span className="text-white">{order.amount.toFixed(8)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spread */}
              <div className="text-center py-2 border-y border-white/10">
                <span className="text-gray-400 text-sm">
                  Spread: {orderbook.asks[0] && orderbook.bids[0] 
                    ? (orderbook.asks[0].price - orderbook.bids[0].price).toFixed(4)
                    : '0.0000'
                  }
                </span>
              </div>

              {/* Bids (Compras) */}
              <div>
                <h4 className="text-green-400 font-medium mb-2">Compras</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {orderbook.bids.slice(0, 10).map((order, index) => (
                    <div
                      key={index}
                      onClick={() => fillOrderFromBook(order.price, order.amount)}
                      className="flex justify-between text-sm cursor-pointer hover:bg-white/5 p-1 rounded"
                    >
                      <span className="text-green-400">{order.price.toFixed(4)}</span>
                      <span className="text-white">{order.amount.toFixed(8)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Negociações Recentes</CardTitle>
            <CardDescription className="text-gray-300">
              Últimas transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400 border-b border-white/10 pb-2">
                <span>Preço</span>
                <span>Quantidade</span>
                <span>Hora</span>
              </div>
              
              {recentTrades.length > 0 ? (
                recentTrades.map((trade, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-green-400">{trade.price.toFixed(4)}</span>
                    <span className="text-white">{trade.amount.toFixed(8)}</span>
                    <span className="text-gray-400">
                      {new Date(trade.created_at).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Nenhuma negociação recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Exchange

