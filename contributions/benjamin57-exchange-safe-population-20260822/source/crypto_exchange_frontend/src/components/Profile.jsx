import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import {
  User,
  Settings,
  Shield,
  Key,
  Wallet,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from 'lucide-react'

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState(user)
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [profileForm, setProfileForm] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
    country: user.country || '',
    city: user.city || '',
    address: user.address || '',
    document_number: '',
    document_type: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`/api/auth/profile/${user.id}`)
      const data = await response.json()
      if (response.ok) {
        setProfileData(data)
        setProfileForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          country: data.country || '',
          city: data.city || '',
          address: data.address || '',
          document_number: data.document_number || '',
          document_type: data.document_type || ''
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error)
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

  const fetchTransactions = async () => {
    try {
      // Buscar transações de todas as carteiras
      const allTransactions = []
      for (const wallet of wallets) {
        const response = await fetch(`/api/wallets/${wallet.id}/transactions?limit=10`)
        const data = await response.json()
        if (response.ok) {
          allTransactions.push(...(data.transactions || []))
        }
      }
      
      // Ordenar por data mais recente
      allTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setTransactions(allTransactions.slice(0, 20)) // Últimas 20 transações
    } catch (error) {
      console.error('Erro ao buscar transações:', error)
    }
  }

  useEffect(() => {
    fetchProfileData()
    fetchWallets()
  }, [user.id])

  useEffect(() => {
    if (wallets.length > 0) {
      fetchTransactions()
    }
  }, [wallets])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Perfil atualizado com sucesso!')
        setProfileData(data.user)
      } else {
        setMessage(data.error || 'Erro ao atualizar perfil')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordForm.new_password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Senha alterada com sucesso!')
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
      } else {
        setMessage(data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setMessage('Copiado para a área de transferência!')
  }

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: { icon: Activity, color: 'text-green-400' },
      withdrawal: { icon: Activity, color: 'text-red-400' },
      trade: { icon: Activity, color: 'text-blue-400' },
      p2p: { icon: Activity, color: 'text-purple-400' }
    }
    return icons[type] || icons.deposit
  }

  const calculateTotalBalance = () => {
    const prices = {
      'BTC': 45000,
      'ETH': 3000,
      'LTC': 100,
      'BNJ': 1.10,
      'USDT': 1.0
    }

    return wallets.reduce((total, wallet) => {
      const price = prices[wallet.currency] || 1
      return total + (wallet.balance * price)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
          <p className="text-gray-300">Gerencie suas informações e configurações</p>
        </div>
        <Button
          onClick={() => window.location.reload()}
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

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg">{profileData.full_name || profileData.username}</h3>
            <p className="text-gray-400">{profileData.email}</p>
            <div className="flex items-center justify-center mt-4">
              {profileData.is_verified ? (
                <Badge className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  <XCircle className="h-3 w-3 mr-1" />
                  Não Verificado
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Saldo Total</h4>
              <Wallet className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              ${calculateTotalBalance().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">Equivalente em USD</p>
            <div className="mt-4">
              <p className="text-gray-400 text-sm">Carteiras Ativas</p>
              <p className="text-white font-medium">{wallets.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">Atividade</h4>
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{transactions.length}</p>
            <p className="text-gray-400 text-sm">Transações recentes</p>
            <div className="mt-4">
              <p className="text-gray-400 text-sm">Último acesso</p>
              <p className="text-white font-medium">
                {profileData.last_login 
                  ? new Date(profileData.last_login).toLocaleDateString('pt-BR')
                  : 'Primeiro acesso'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="wallets">Carteiras</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-gray-300">
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nome</Label>
                    <Input
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Sobrenome</Label>
                    <Input
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Telefone</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">País</Label>
                    <Input
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Cidade</Label>
                    <Input
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Tipo de Documento</Label>
                    <Input
                      value={profileForm.document_type}
                      onChange={(e) => setProfileForm({...profileForm, document_type: e.target.value})}
                      placeholder="CPF, RG, etc."
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Endereço</Label>
                  <Input
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Alterar Senha
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Mantenha sua conta segura com uma senha forte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label className="text-white">Senha Atual</Label>
                    <Input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Nova Senha</Label>
                    <Input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Confirmar Nova Senha</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  Chave API
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Use esta chave para acessar a API programaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={profileData.api_key || ''}
                    readOnly
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Button
                    onClick={() => setShowApiKey(!showApiKey)}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(profileData.api_key || '')}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Configurações de Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Autenticação de Dois Fatores</p>
                    <p className="text-gray-400 text-sm">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch checked={profileData.two_factor_enabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Notificações de Login</p>
                    <p className="text-gray-400 text-sm">Receba alertas sobre novos acessos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wallet className="h-5 w-5 mr-2" />
                Minhas Carteiras
              </CardTitle>
              <CardDescription className="text-gray-300">
                Gerencie suas carteiras de criptomoedas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wallets.map((wallet) => {
                  const prices = {
                    'BTC': 45000,
                    'ETH': 3000,
                    'LTC': 100,
                    'BNJ': 1.10,
                    'USDT': 1.0
                  }
                  const price = prices[wallet.currency] || 1
                  const valueUSD = wallet.balance * price

                  return (
                    <div key={wallet.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {wallet.currency.substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{wallet.currency}</p>
                            <p className="text-gray-400 text-sm">
                              {wallet.address.substring(0, 20)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            {wallet.balance.toLocaleString('pt-BR', { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8 
                            })} {wallet.currency}
                          </p>
                          <p className="text-gray-400 text-sm">
                            ${valueUSD.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {wallet.locked_balance > 0 && (
                            <p className="text-yellow-400 text-xs">
                              Bloqueado: {wallet.locked_balance.toFixed(8)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Histórico de Atividades
              </CardTitle>
              <CardDescription className="text-gray-300">
                Suas transações e atividades recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => {
                    const { icon: Icon, color } = getTransactionIcon(transaction.transaction_type)
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full bg-white/10`}>
                            <Icon className={`h-4 w-4 ${color}`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {transaction.description || `${transaction.transaction_type} ${transaction.currency}`}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {new Date(transaction.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(8)} {transaction.currency}
                          </p>
                          <Badge className={
                            transaction.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile

