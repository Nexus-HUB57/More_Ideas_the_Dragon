import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Key,
  Shield,
  Settings,
  Save,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

const SettingsTab = () => {
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [newApiKey, setNewApiKey] = useState({
    exchange: '',
    api_key: '',
    api_secret: '',
    passphrase: '' // Adicionado campo para master passphrase
  })
  const [showSecrets, setShowSecrets] = useState({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [masterPassphrase, setMasterPassphrase] = useState(''); // Estado para a master passphrase para operações de leitura
  const [selectedFile, setSelectedFile] = useState(null)
  const [masterPassphraseUpload, setMasterPassphraseUpload] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleWalletUpload = async () => {
    if (!selectedFile || !masterPassphraseUpload) {
      setUploadStatus({ type: 'destructive', message: 'Selecione um arquivo e informe a Master Passphrase.' })
      return
    }

    setUploadLoading(true)
    setUploadStatus(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('passphrase', masterPassphraseUpload)

      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/wallets/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadStatus({ type: 'success', message: result.message })
        setSelectedFile(null)
        setMasterPassphraseUpload('')
      } else {
        const errorData = await response.json()
        setUploadStatus({ type: 'destructive', message: `Erro: ${errorData.error}` })
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      setUploadStatus({ type: 'destructive', message: 'Erro de conexão no upload.' })
    } finally {
      setUploadLoading(false)
    }
  }

  const fetchApiKeys = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys(data)
      }
    } catch (error) {
      console.error('Erro ao carregar chaves de API:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleSaveApiKey = async () => {
    if (!newApiKey.exchange || !newApiKey.api_key || !newApiKey.api_secret || !newApiKey.passphrase) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo a Master Passphrase.')
      return
    }

    setSaveLoading(true)
    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newApiKey),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('API Key salva:', result)

        // Limpar formulário, mas manter a passphrase para facilitar o uso contínuo
        setNewApiKey(prev => ({
          ...prev,
          exchange: '',
          api_key: '',
          api_secret: ''
        }))

        // Recarregar lista
        await fetchApiKeys()
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar chave de API: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao salvar chave de API:', error)
      alert('Ocorreu um erro ao tentar salvar a chave de API. Verifique o console para mais detalhes.');
    } finally {
      setSaveLoading(false)
    }
  }

  const toggleShowSecret = (exchange) => {
    setShowSecrets(prev => ({
      ...prev,
      [exchange]: !prev[exchange]
    }))
  }

  const exchanges = [
    { value: 'binance', label: 'Binance' },
    { value: 'coinbase', label: 'Coinbase Pro' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'bitfinex', label: 'Bitfinex' },
    { value: 'huobi', label: 'Huobi' },
    { value: 'bittrex', label: 'Bittrex' },
    { value: 'mercado bitcoin', label: 'Mercado Bitcoin' },
    { value: 'foxbit', label: 'Foxbit' }
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api-keys">Chaves de API</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          {/* Adicionar Nova API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Adicionar Nova Chave de API</span>
              </CardTitle>
              <CardDescription>
                Configure as chaves de API das exchanges para os bots de arbitragem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exchange">Exchange</Label>
                  <select
                    id="exchange"
                    value={newApiKey.exchange}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, exchange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma exchange</option>
                    {exchanges.map(ex => (
                      <option key={ex.value} value={ex.value}>{ex.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="text"
                    placeholder="Sua API Key"
                    value={newApiKey.api_key}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, api_key: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_secret">API Secret</Label>
                  <Input
                    id="api_secret"
                    type="password"
                    placeholder="Seu API Secret"
                    value={newApiKey.api_secret}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, api_secret: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="master_passphrase">Master Passphrase</Label>
                  <Input
                    id="master_passphrase"
                    type="password"
                    placeholder="Sua Master Passphrase"
                    value={newApiKey.passphrase}
                    onChange={(e) => setNewApiKey(prev => ({ ...prev, passphrase: e.target.value }))}
                  />
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Segurança:</strong> As chaves de API são criptografadas antes de serem armazenadas usando a Master Passphrase fornecida.
                  Recomendamos usar chaves com permissões mínimas (apenas leitura e negociação, sem saque).
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleSaveApiKey}
                disabled={saveLoading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveLoading ? 'Salvando...' : 'Salvar Chave de API'}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de API Keys Configuradas */}
          <Card>
            <CardHeader>
              <CardTitle>Chaves de API Configuradas</CardTitle>
              <CardDescription>
                Exchanges com chaves de API configuradas para os bots
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((api, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Key className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium capitalize">{api.exchange}</p>
                          <p className="text-sm text-gray-500">
                            Configurada em: {api.last_update || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={api.configured ? "default" : "secondary"}
                        >
                          {api.configured ? "Ativa" : "Inativa"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {apiKeys.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma chave de API configurada ainda.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Gerencie as configurações de segurança do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Autenticação de Dois Fatores</p>
                    <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                  </div>
                  <Badge variant="secondary">Em breve</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Logs de Auditoria</p>
                    <p className="text-sm text-gray-500">Registre todas as ações realizadas</p>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Timeout de Sessão</p>
                    <p className="text-sm text-gray-500">Logout automático após inatividade</p>
                  </div>
                  <span className="text-sm text-gray-600">24 horas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Atualize sua senha de acesso ao dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Senha Atual</Label>
                <Input id="current_password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">Nova Senha</Label>
                <Input id="new_password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                <Input id="confirm_password" type="password" />
              </div>
              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Importar Wallets</CardTitle>
              <CardDescription>
                Faça upload de arquivos .txt, .dar ou .core para importar novas wallets para o FDR.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet_file">Arquivo de Wallet</Label>
                <Input
                  id="wallet_file"
                  type="file"
                  accept=".txt,.dar,.core,.csv,.btc,.dat,.backup"
                  onChange={handleFileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="master_passphrase_upload">Master Passphrase</Label>
                <Input
                  id="master_passphrase_upload"
                  type="password"
                  placeholder="Sua Master Passphrase"
                  value={masterPassphraseUpload}
                  onChange={(e) => setMasterPassphraseUpload(e.target.value)}
                />
              </div>
              <Button
                onClick={handleWalletUpload}
                disabled={uploadLoading}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                {uploadLoading ? 'Importando...' : 'Importar Wallet'}
              </Button>
              {uploadStatus && (
                <Alert variant={uploadStatus.type === 'success' ? 'default' : 'destructive'}>
                  {uploadStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>
                    {uploadStatus.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Personalize a experiência do dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Atualização Automática</p>
                    <p className="text-sm text-gray-500">Atualizar dados a cada 10 dias</p>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-gray-500">Receber alertas importantes</p>
                  </div>
                  <Badge variant="secondary">Em breve</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Tema</p>
                    <p className="text-sm text-gray-500">Aparência do dashboard</p>
                  </div>
                  <span className="text-sm text-gray-600">Claro</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Versão do Dashboard:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Atualização:</span>
                  <span>{new Date().toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status do Sistema:</span>
                  <Badge variant="default">Operacional</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsTab
