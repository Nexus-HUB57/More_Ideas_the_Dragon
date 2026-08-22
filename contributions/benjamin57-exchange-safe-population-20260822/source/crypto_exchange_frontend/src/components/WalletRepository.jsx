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
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  File,
  Trash2,
  Download,
  Shield,
  HardDrive,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Folder,
  FileText,
  Database
} from 'lucide-react'

const WalletRepository = ({ user }) => {
  const [walletFiles, setWalletFiles] = useState([])
  const [backups, setBackups] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('files')
  const [uploadForm, setUploadForm] = useState({
    currency: '',
    wallet_address: '',
    description: ''
  })

  const fetchWalletFiles = async () => {
    try {
      const response = await fetch(`/api/wallet-files?user_id=${user.id}`)
      const data = await response.json()
      if (response.ok) {
        setWalletFiles(data.wallet_files || [])
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos de wallet:', error)
    }
  }

  const fetchBackups = async () => {
    try {
      const response = await fetch(`/api/wallet-files/backups?user_id=${user.id}`)
      const data = await response.json()
      if (response.ok) {
        setBackups(data.backups || [])
      }
    } catch (error) {
      console.error('Erro ao buscar backups:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/wallet-files/stats?user_id=${user.id}`)
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await Promise.all([fetchWalletFiles(), fetchBackups(), fetchStats()])
    setLoading(false)
  }

  useEffect(() => {
    refreshData()
  }, [user.id])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Verificar tipo de arquivo
    const allowedTypes = ['dat', 'txt', 'core']
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      setMessage('Tipo de arquivo não permitido. Use apenas .dat, .txt ou .core')
      return
    }

    // Verificar tamanho (16MB)
    if (file.size > 16 * 1024 * 1024) {
      setMessage('Arquivo muito grande. Tamanho máximo: 16MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', user.id)
      formData.append('currency', uploadForm.currency)
      formData.append('wallet_address', uploadForm.wallet_address)
      formData.append('description', uploadForm.description)

      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/wallet-files/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (response.ok) {
        setMessage('Arquivo de wallet enviado com sucesso!')
        setUploadForm({ currency: '', wallet_address: '', description: '' })
        refreshData()
      } else {
        setMessage(data.error || 'Erro ao enviar arquivo')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return

    try {
      const response = await fetch(`/api/wallet-files/${fileId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Arquivo excluído com sucesso!')
        refreshData()
      } else {
        setMessage(data.error || 'Erro ao excluir arquivo')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  const handleCreateBackup = async (fileId) => {
    try {
      const response = await fetch(`/api/wallet-files/${fileId}/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backup_name: `backup_${new Date().toISOString().split('T')[0]}`
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Backup criado com sucesso!')
        refreshData()
      } else {
        setMessage(data.error || 'Erro ao criar backup')
      }
    } catch (error) {
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  const getFileIcon = (fileType) => {
    const icons = {
      'dat': Database,
      'txt': FileText,
      'core': HardDrive
    }
    const Icon = icons[fileType] || File
    return <Icon className="h-5 w-5" />
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (file) => {
    if (file.currency && file.wallet_address) {
      return (
        <Badge className="bg-green-500/20 text-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          Configurado
        </Badge>
      )
    }
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400">
        <AlertCircle className="h-3 w-3 mr-1" />
        Pendente
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Repositório de Wallets</h1>
          <p className="text-gray-300">Gerencie seus arquivos de carteira (.dat, .txt, .core)</p>
        </div>
        <Button
          onClick={refreshData}
          disabled={loading}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total de Arquivos</p>
                  <p className="text-white font-bold text-lg">{stats.total_files}</p>
                </div>
                <Folder className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Espaço Usado</p>
                  <p className="text-white font-bold text-lg">{formatFileSize(stats.total_size)}</p>
                </div>
                <HardDrive className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Backups</p>
                  <p className="text-white font-bold text-lg">{backups.length}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Moedas</p>
                  <p className="text-white font-bold text-lg">{stats.by_currency.length}</p>
                </div>
                <Database className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="files">Arquivos</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          {walletFiles.length > 0 ? (
            walletFiles.map((file) => (
              <Card key={file.id} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/10 rounded-lg">
                        {getFileIcon(file.file_type)}
                      </div>
                      
                      <div>
                        <h3 className="text-white font-medium">{file.original_filename}</h3>
                        <p className="text-gray-400 text-sm">
                          {formatFileSize(file.file_size)} • {file.file_type.toUpperCase()}
                        </p>
                        {file.currency && (
                          <p className="text-blue-400 text-sm">
                            {file.currency} • {file.wallet_address?.substring(0, 20)}...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {getStatusBadge(file)}
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleCreateBackup(file.id)}
                          variant="outline"
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleDeleteFile(file.id)}
                          variant="outline"
                          size="sm"
                          className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {file.description && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-300 text-sm">{file.description}</p>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-400">
                    Criado em: {new Date(file.created_at).toLocaleString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-12 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum arquivo de wallet encontrado</p>
                <Button
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Fazer Upload
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload de Arquivo de Wallet
              </CardTitle>
              <CardDescription className="text-gray-300">
                Envie arquivos .dat, .txt ou .core das suas carteiras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Enviando arquivo...</span>
                    <span className="text-white">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* File Input */}
              <div className="space-y-2">
                <Label className="text-white">Arquivo da Carteira</Label>
                <Input
                  type="file"
                  accept=".dat,.txt,.core"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="bg-white/10 border-white/20 text-white file:bg-white/20 file:text-white file:border-0"
                />
                <p className="text-gray-400 text-sm">
                  Tipos aceitos: .dat, .txt, .core (máx. 16MB)
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Moeda (Opcional)</Label>
                  <Select 
                    value={uploadForm.currency} 
                    onValueChange={(value) => setUploadForm({...uploadForm, currency: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                      <SelectItem value="BNJ">Benjamin57 (BNJ)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Endereço da Carteira (Opcional)</Label>
                  <Input
                    value={uploadForm.wallet_address}
                    onChange={(e) => setUploadForm({...uploadForm, wallet_address: e.target.value})}
                    placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Descrição (Opcional)</Label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Adicione uma descrição para este arquivo de carteira..."
                  className="bg-white/10 border-white/20 text-white"
                  rows={3}
                />
              </div>

              {/* Supported File Types Info */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Tipos de Arquivo Suportados:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-400" />
                    <span><strong>.dat</strong> - Arquivos de carteira Bitcoin Core e similares</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-400" />
                    <span><strong>.txt</strong> - Chaves privadas, seeds e backups em texto</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-purple-400" />
                    <span><strong>.core</strong> - Arquivos de configuração e dados de carteira</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          {backups.length > 0 ? (
            backups.map((backup) => (
              <Card key={backup.id} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-500/20 rounded-lg">
                        <Shield className="h-5 w-5 text-green-400" />
                      </div>
                      
                      <div>
                        <h3 className="text-white font-medium">{backup.backup_name}</h3>
                        <p className="text-gray-400 text-sm">
                          {formatFileSize(backup.backup_size)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Hash: {backup.backup_hash.substring(0, 16)}...
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge className="bg-green-500/20 text-green-400 mb-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Backup Seguro
                      </Badge>
                      <p className="text-gray-400 text-xs">
                        {new Date(backup.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Nenhum backup encontrado</p>
                <p className="text-gray-500 text-sm mt-2">
                  Crie backups dos seus arquivos de carteira para maior segurança
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WalletRepository

