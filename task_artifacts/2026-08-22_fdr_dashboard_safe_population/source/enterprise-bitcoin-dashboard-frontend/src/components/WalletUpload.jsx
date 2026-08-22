import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Upload, File, CheckCircle, AlertCircle, Trash2, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'

const WalletUpload = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState([])
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const fileInputRef = useRef(null)

  const supportedFormats = ['.dat', '.txt', '.core', '.json', '.wallet']

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files)
    const validFiles = selectedFiles.filter(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase()
      return supportedFormats.includes(extension)
    })

    if (validFiles.length !== selectedFiles.length) {
      alert('Alguns arquivos foram ignorados. Formatos suportados: ' + supportedFormats.join(', '))
    }

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: '.' + file.name.split('.').pop().toLowerCase(),
      status: 'pending',
      progress: 0,
      error: null,
      walletInfo: null
    }))

    setFiles(prev => [...prev, ...newFiles])
  }

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeIcon = (type) => {
    switch (type) {
      case '.dat':
        return '🔐'
      case '.txt':
        return '📄'
      case '.core':
        return '⚙️'
      case '.json':
        return '📋'
      case '.wallet':
        return '💰'
      default:
        return '📁'
    }
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      alert('Selecione pelo menos um arquivo de carteira')
      return
    }

    if (!passphrase.trim()) {
      alert('Digite a passphrase da Master Key FDR')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setResults([])

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Atualizar status do arquivo
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
        ))

        const formData = new FormData()
        formData.append('wallet_file', file.file)
        formData.append('passphrase', passphrase)
        formData.append('file_type', file.type)
        formData.append('integration_target', 'FDR_MASTER_WALLET')

        try {
          const response = await fetch('/api/wallet/upload', {
            method: 'POST',
            body: formData,
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setFiles(prev => prev.map(f =>
                f.id === file.id ? { ...f, progress } : f
              ))
            }
          })

          const result = await response.json()

          if (response.ok && result.success) {
            setFiles(prev => prev.map(f =>
              f.id === file.id ? {
                ...f,
                status: 'success',
                progress: 100,
                walletInfo: result.wallet_info
              } : f
            ))

            setResults(prev => [...prev, {
              filename: file.name,
              status: 'success',
              message: result.message,
              addresses_imported: result.wallet_info?.addresses_imported || 0,
              balance_btc: result.wallet_info?.total_balance || 0,
              private_keys_count: result.wallet_info?.private_keys_count || 0
            }])
          } else {
            throw new Error(result.error || 'Erro no upload')
          }
        } catch (error) {
          setFiles(prev => prev.map(f =>
            f.id === file.id ? {
              ...f,
              status: 'error',
              error: error.message
            } : f
          ))

          setResults(prev => [...prev, {
            filename: file.name,
            status: 'error',
            message: error.message
          }])
        }

        // Atualizar progresso geral
        setUploadProgress(((i + 1) / files.length) * 100)
      }
    } finally {
      setUploading(false)
    }
  }

  const clearAll = () => {
    setFiles([])
    setResults([])
    setUploadProgress(0)
    setPassphrase('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Carteiras para Master Wallet FDR
          </CardTitle>
          <CardDescription>
            Importe carteiras Bitcoin (.dat, .txt, .core, .json, .wallet) para integração à Master Key FDR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Passphrase Input */}
          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase da Master Key FDR</Label>
            <div className="relative">
              <Input
                id="passphrase"
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Digite a passphrase da Master Key"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassphrase(!showPassphrase)}
              >
                {showPassphrase ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const droppedFiles = Array.from(e.dataTransfer.files)
              const event = { target: { files: droppedFiles } }
              handleFileSelect(event)
            }}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Formatos suportados: {supportedFormats.join(', ')}
            </p>
            <Button variant="outline" type="button">
              Selecionar Arquivos
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={supportedFormats.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Arquivos Selecionados ({files.length})</h3>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Tudo
                </Button>
              </div>

              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileTypeIcon(file.type)}</span>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.type.toUpperCase()}
                      </p>
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="w-32 mt-1" />
                      )}
                      {file.error && (
                        <p className="text-sm text-red-500 mt-1">{file.error}</p>
                      )}
                      {file.walletInfo && (
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">
                            {file.walletInfo.addresses_imported} endereços
                          </Badge>
                          <Badge variant="outline">
                            {file.walletInfo.total_balance} BTC
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'pending' && (
                      <Badge variant="secondary">Aguardando</Badge>
                    )}
                    {file.status === 'uploading' && (
                      <Badge variant="default">Processando...</Badge>
                    )}
                    {file.status === 'success' && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sucesso
                      </Badge>
                    )}
                    {file.status === 'error' && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Erro
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={uploading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do Upload</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-center">
            <Button
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading || !passphrase.trim()}
              size="lg"
              className="px-8"
            >
              {uploading ? (
                <>Processando Carteiras...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Integrar à Master Wallet FDR
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Integração</CardTitle>
            <CardDescription>
              Status da importação das carteiras para a Master Wallet FDR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <Alert
                  key={index}
                  variant={result.status === 'success' ? 'default' : 'destructive'}
                >
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <div className="font-medium">{result.filename}</div>
                    <div className="text-sm mt-1">{result.message}</div>
                    {result.status === 'success' && (
                      <div className="flex gap-4 mt-2 text-xs">
                        <span>Endereços: {result.addresses_imported}</span>
                        <span>Chaves Privadas: {result.private_keys_count}</span>
                        <span>Saldo: {result.balance_btc} BTC</span>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WalletUpload
