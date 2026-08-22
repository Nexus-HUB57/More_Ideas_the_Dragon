import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Wallet, Plus, Upload, RefreshCw, Bitcoin, Shield, Database, Activity } from 'lucide-react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [wallets, setWallets] = useState([])
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [blockHeight, setBlockHeight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [newWalletName, setNewWalletName] = useState('')

  // Carrega informações da blockchain
  useEffect(() => {
    fetchBlockHeight()
  }, [])

  // Carrega carteiras ao iniciar
  useEffect(() => {
    fetchWallets()
  }, [])

  // Carrega endereços quando uma carteira é selecionada
  useEffect(() => {
    if (selectedWallet) {
      fetchAddresses(selectedWallet._id)
    }
  }, [selectedWallet])

  const fetchBlockHeight = async () => {
    try {
      const response = await fetch(`${API_URL}/blockchain/height`)
      const data = await response.json()
      if (data.success) {
        setBlockHeight(data.block_height)
      }
    } catch (error) {
      console.error('Erro ao obter altura do bloco:', error)
    }
  }

  const fetchWallets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/wallets`)
      const data = await response.json()
      if (data.success) {
        setWallets(data.wallets)
      }
    } catch (error) {
      showMessage('Erro ao carregar carteiras', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchAddresses = async (walletId) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/wallets/${walletId}/addresses`)
      const data = await response.json()
      if (data.success) {
        setAddresses(data.addresses)
      }
    } catch (error) {
      showMessage('Erro ao carregar endereços', 'error')
    } finally {
      setLoading(false)
    }
  }

  const createWallet = async () => {
    if (!newWalletName.trim()) {
      showMessage('Digite um nome para a carteira', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/wallets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWalletName })
      })
      const data = await response.json()
      if (data.success) {
        showMessage('Carteira criada com sucesso!', 'success')
        setNewWalletName('')
        fetchWallets()
      }
    } catch (error) {
      showMessage('Erro ao criar carteira', 'error')
    } finally {
      setLoading(false)
    }
  }

  const generateAddress = async () => {
    if (!selectedWallet) {
      showMessage('Selecione uma carteira primeiro', 'error')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/wallets/${selectedWallet._id}/addresses`, {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        showMessage(`Endereço gerado: ${data.address}`, 'success')
        fetchAddresses(selectedWallet._id)
      }
    } catch (error) {
      showMessage('Erro ao gerar endereço', 'error')
    } finally {
      setLoading(false)
    }
  }

  const importWallet = async (event) => {
    const file = event.target.files[0]
    if (!file || !selectedWallet) {
      showMessage('Selecione uma carteira e um arquivo', 'error')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/wallets/${selectedWallet._id}/import`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        showMessage(`${data.imported_count} chaves importadas com sucesso! Protocolo CAISK ativado.`, 'success')
        fetchAddresses(selectedWallet._id)
      } else {
        showMessage(data.error || 'Erro ao importar carteira', 'error')
      }
    } catch (error) {
      showMessage('Erro ao importar carteira', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const getTotalBalance = () => {
    return addresses.reduce((sum, addr) => sum + (addr.balance_btc || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Bitcoin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bitcoin Wallet
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistema de Carteira Digital
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400 animate-pulse" />
                <div className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Mainnet</div>
                  <div className="font-mono font-semibold text-green-600 dark:text-green-400">
                    Bloco: {blockHeight || '...'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="text-sm">
                  <div className="text-gray-600 dark:text-gray-400">Protocolos</div>
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    TSRA + CAISK
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Carteiras */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Minhas Carteiras
                </CardTitle>
                <CardDescription>
                  Gerencie suas carteiras Bitcoin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-name">Nova Carteira</Label>
                  <div className="flex gap-2">
                    <Input
                      id="wallet-name"
                      placeholder="Nome da carteira"
                      value={newWalletName}
                      onChange={(e) => setNewWalletName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createWallet()}
                    />
                    <Button onClick={createWallet} disabled={loading}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {wallets.map((wallet) => (
                    <Card
                      key={wallet._id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedWallet?._id === wallet._id
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : ''
                      }`}
                      onClick={() => setSelectedWallet(wallet)}
                    >
                      <CardContent className="p-4">
                        <div className="font-semibold">{wallet.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(wallet.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Area - Endereços e Operações */}
          <div className="lg:col-span-2">
            {selectedWallet ? (
              <Tabs defaultValue="addresses" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="addresses">Endereços</TabsTrigger>
                  <TabsTrigger value="operations">Operações</TabsTrigger>
                </TabsList>

                <TabsContent value="addresses" className="space-y-4">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Endereços da Carteira: {selectedWallet.name}</CardTitle>
                      <CardDescription>
                        Saldo Total: <span className="font-bold text-orange-600">{getTotalBalance().toFixed(8)} BTC</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {addresses.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum endereço encontrado</p>
                            <p className="text-sm">Gere um novo endereço ou importe uma carteira</p>
                          </div>
                        ) : (
                          addresses.map((address) => (
                            <Card key={address._id} className="bg-gray-50 dark:bg-gray-800/50">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white break-all">
                                      {address.address}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Criado em: {new Date(address.created_at).toLocaleString('pt-BR')}
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <div className="font-bold text-orange-600">
                                      {(address.balance_btc || 0).toFixed(8)} BTC
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {address.balance_satoshis || 0} sats
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="operations" className="space-y-4">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Operações</CardTitle>
                      <CardDescription>
                        Gere novos endereços ou importe carteiras existentes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Gerar Novo Endereço */}
                      <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-500 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Plus className="h-6 w-6 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Gerar Novo Endereço</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Crie um novo endereço Bitcoin para esta carteira
                            </p>
                          </div>
                          <Button onClick={generateAddress} disabled={loading} size="lg">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Gerar'}
                          </Button>
                        </div>
                      </div>

                      {/* Importar Carteira */}
                      <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Upload className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Importar Carteira</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Suporta: .txt, .dat, .core, .wallet, .backup
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Protocolo CAISK: Chaves criptografadas com AES-256
                            </p>
                          </div>
                          <div>
                            <Input
                              type="file"
                              accept=".txt,.dat,.core,.wallet,.backup"
                              onChange={importWallet}
                              className="hidden"
                              id="import-file"
                            />
                            <Button asChild size="lg">
                              <label htmlFor="import-file" className="cursor-pointer">
                                Selecionar Arquivo
                              </label>
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Atualizar Saldos */}
                      <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <RefreshCw className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Atualizar Saldos</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Consulta em tempo real na Mainnet (Protocolo TSRA)
                            </p>
                          </div>
                          <Button
                            onClick={() => fetchAddresses(selectedWallet._id)}
                            disabled={loading}
                            size="lg"
                            variant="outline"
                          >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Atualizar'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Selecione uma Carteira</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Escolha uma carteira existente ou crie uma nova para começar
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              Sistema de Carteira Digital Bitcoin - Ambiente 100% Real (Mainnet)
            </div>
            <div className="flex items-center gap-4">
              <span>Protocolo TSRA: Ativo</span>
              <span>Protocolo CAISK: Ativo</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
