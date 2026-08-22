import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Users,
  Plus,
  RefreshCw,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  User,
  DollarSign
} from 'lucide-react'

const P2P = ({ user }) => {
  const [p2pOrders, setP2pOrders] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('market')
  const [filters, setFilters] = useState({
    type: '',
    currency: '',
    payment_method: ''
  })
  const [orderForm, setOrderForm] = useState({
    order_type: 'sell',
    currency: 'BNJ',
    amount: '',
    price_per_unit: '',
    payment_method: 'PIX',
    min_amount: '',
    max_amount: '',
    description: ''
  })

  const fetchP2POrders = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.currency) params.append('currency', filters.currency)
      if (filters.payment_method) params.append('payment_method', filters.payment_method)

      const response = await fetch(`/api/p2p/orders?${params}`)
      const data = await response.json()
      if (response.ok) {
        setP2pOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Erro ao buscar ordens P2P:', error)
    }
  }

  const fetchMyOrders = async () => {
    try {
      const response = await fetch(`/api/p2p/my-orders/${user.id}`)
      const data = await response.json()
      if (response.ok) {
        setMyOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Erro ao buscar minhas ordens P2P:', error)
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
    await Promise.all([fetchP2POrders(), fetchMyOrders(), fetchWallets()])
  }

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 10000) // Atualizar a cada 10 segundos
    return () => clearInterval(interval)
  }, [user.id, filters])

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/p2p/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderForm,
          user_id: user.id,
          amount: parseFloat(orderForm.amount),
          price_per_unit: parseFloat(orderForm.price_per_unit),
          min_amount: parseFloat(orderForm.min_amount) || 0,
          max_amount: parseFloat(orderForm.max_amount) || parseFloat(orderForm.amount)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Ordem P2P criada com sucesso!')
        setOrderForm({
          order_type: 'sell',
          currency: 'BNJ',
          amount: '',
          price_per_unit: '',
          payment_method: 'PIX',
          min_amount: '',
          max_amount: '',
          description: ''
        })
        refreshData()
      } else {
        setMessage(data.error || 'Erro ao criar ordem P2P')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId, amount) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/p2p/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer_id: user.id,
          amount: parseFloat(amount)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Ordem P2P aceita com sucesso!')
        refreshData()
      } else {
        setMessage(data.error || 'Erro ao aceitar ordem P2P')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/p2p/orders/${orderId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Ordem P2P cancelada com sucesso!')
        refreshData()
      } else {
        setMessage(data.error || 'Erro ao cancelar ordem P2P')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-500/20 text-green-400', icon: Clock, text: 'Ativa' },
      completed: { color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle, text: 'Concluída' },
      cancelled: { color: 'bg-red-500/20 text-red-400', icon: XCircle, text: 'Cancelada' }
    }

    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method) => {
    return <CreditCard className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mercado P2P</h1>
          <p className="text-gray-300">Negocie diretamente com outros usuários</p>
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

      {message && (
        <Alert className="bg-blue-500/20 border-blue-500/50">
          <AlertDescription className="text-blue-200">
            {message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="market">Mercado</TabsTrigger>
          <TabsTrigger value="create">Criar Ordem</TabsTrigger>
          <TabsTrigger value="my-orders">Minhas Ordens</TabsTrigger>
        </TabsList>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Tipo</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="buy">Compra</SelectItem>
                      <SelectItem value="sell">Venda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Moeda</Label>
                  <Select value={filters.currency} onValueChange={(value) => setFilters({...filters, currency: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      <SelectItem value="BNJ">BNJ</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Pagamento</Label>
                  <Select value={filters.payment_method} onValueChange={(value) => setFilters({...filters, payment_method: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="TED">TED</SelectItem>
                      <SelectItem value="DOC">DOC</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* P2P Orders List */}
          <div className="space-y-4">
            {p2pOrders.length > 0 ? (
              p2pOrders.map((order) => (
                <Card key={order.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="text-white font-medium">{order.username}</span>
                        </div>
                        
                        <Badge className={order.order_type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {order.order_type === 'buy' ? 'Compra' : 'Venda'}
                        </Badge>
                        
                        <Badge variant="outline" className="border-white/20 text-white">
                          {order.currency}
                        </Badge>
                        
                        <div className="flex items-center space-x-1 text-gray-300">
                          {getPaymentMethodIcon(order.payment_method)}
                          <span className="text-sm">{order.payment_method}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          R$ {order.price_per_unit.toFixed(2)}
                        </p>
                        <p className="text-gray-400 text-sm">por {order.currency}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Quantidade</p>
                        <p className="text-white font-medium">
                          {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {order.currency}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm">Limites</p>
                        <p className="text-white font-medium">
                          {order.min_amount.toFixed(2)} - {order.max_amount.toFixed(2)} {order.currency}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm">Total</p>
                        <p className="text-white font-medium">
                          R$ {order.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {order.description && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-sm">Descrição</p>
                        <p className="text-white text-sm">{order.description}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      {getStatusBadge(order.status)}
                      
                      {order.user_id !== user.id && order.status === 'active' && (
                        <Button
                          onClick={() => handleAcceptOrder(order.id, order.amount)}
                          disabled={loading}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          {order.order_type === 'buy' ? 'Vender' : 'Comprar'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhuma ordem P2P encontrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Create Order Tab */}
        <TabsContent value="create">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Criar Nova Ordem P2P
              </CardTitle>
              <CardDescription className="text-gray-300">
                Crie uma ordem para comprar ou vender criptomoedas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrder} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Tipo de Ordem</Label>
                    <Select value={orderForm.order_type} onValueChange={(value) => setOrderForm({...orderForm, order_type: value})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Comprar</SelectItem>
                        <SelectItem value="sell">Vender</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Moeda</Label>
                    <Select value={orderForm.currency} onValueChange={(value) => setOrderForm({...orderForm, currency: value})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BNJ">BNJ</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Quantidade</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={orderForm.amount}
                      onChange={(e) => setOrderForm({...orderForm, amount: e.target.value})}
                      placeholder="0.00000000"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white">Preço por Unidade (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={orderForm.price_per_unit}
                      onChange={(e) => setOrderForm({...orderForm, price_per_unit: e.target.value})}
                      placeholder="0.00"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Quantidade Mínima</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={orderForm.min_amount}
                      onChange={(e) => setOrderForm({...orderForm, min_amount: e.target.value})}
                      placeholder="0.00000000"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Quantidade Máxima</Label>
                    <Input
                      type="number"
                      step="0.00000001"
                      value={orderForm.max_amount}
                      onChange={(e) => setOrderForm({...orderForm, max_amount: e.target.value})}
                      placeholder="0.00000000"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Método de Pagamento</Label>
                  <Select value={orderForm.payment_method} onValueChange={(value) => setOrderForm({...orderForm, payment_method: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="TED">TED</SelectItem>
                      <SelectItem value="DOC">DOC</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Descrição (Opcional)</Label>
                  <Textarea
                    value={orderForm.description}
                    onChange={(e) => setOrderForm({...orderForm, description: e.target.value})}
                    placeholder="Adicione informações adicionais sobre sua ordem..."
                    className="bg-white/10 border-white/20 text-white"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loading ? 'Criando...' : 'Criar Ordem P2P'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Orders Tab */}
        <TabsContent value="my-orders">
          <div className="space-y-4">
            {myOrders.length > 0 ? (
              myOrders.map((order) => (
                <Card key={order.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge className={order.order_type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {order.order_type === 'buy' ? 'Compra' : 'Venda'}
                        </Badge>
                        
                        <Badge variant="outline" className="border-white/20 text-white">
                          {order.currency}
                        </Badge>
                        
                        <div className="flex items-center space-x-1 text-gray-300">
                          {getPaymentMethodIcon(order.payment_method)}
                          <span className="text-sm">{order.payment_method}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {getStatusBadge(order.status)}
                        
                        {order.status === 'active' && (
                          <Button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={loading}
                            variant="outline"
                            size="sm"
                            className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Quantidade</p>
                        <p className="text-white font-medium">
                          {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {order.currency}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm">Preço Unitário</p>
                        <p className="text-white font-medium">
                          R$ {order.price_per_unit.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm">Total</p>
                        <p className="text-white font-medium">
                          R$ {order.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 text-sm">Criada em</p>
                        <p className="text-white font-medium">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {order.description && (
                      <div className="mt-4">
                        <p className="text-gray-400 text-sm">Descrição</p>
                        <p className="text-white text-sm">{order.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Você ainda não criou nenhuma ordem P2P</p>
                  <Button
                    onClick={() => setActiveTab('create')}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Criar Primeira Ordem
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default P2P

