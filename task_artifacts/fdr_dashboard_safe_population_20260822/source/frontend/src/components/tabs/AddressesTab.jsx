import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  Search,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const AddressesTab = () => {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newAddress, setNewAddress] = useState({ address: '', label: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addStatus, setAddStatus] = useState(null)

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleAddAddress = async () => {
    if (!newAddress.address) {
      setAddStatus({ type: 'destructive', message: 'O endereço é obrigatório.' })
      return
    }

    setAddLoading(true)
    setAddStatus(null)

    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/addresses/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      })

      if (response.ok) {
        const result = await response.json()
        setAddStatus({ type: 'success', message: result.message })
        setNewAddress({ address: '', label: '' })
        fetchAddresses()
      } else {
        const errorData = await response.json()
        setAddStatus({ type: 'destructive', message: `Erro: ${errorData.error}` })
      }
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error)
      setAddStatus({ type: 'destructive', message: 'Ocorreu um erro ao tentar adicionar o endereço.' })
    } finally {
      setAddLoading(false)
    }
  }

  const formatBTC = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    }).format(amount)
  }

  const formatUSD = (btcAmount, btcPrice = 45000) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(btcAmount * btcPrice)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const openInExplorer = (address) => {
    window.open(`https://blockchair.com/bitcoin/address/${address}`, '_blank')
  }

  const filteredAddresses = addresses.filter(addr =>
    addr.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalBalance = addresses.reduce((sum, addr) => sum + addr.balance, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando endereços...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total de Endereços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{addresses.length}</div>
            <p className="text-sm text-gray-500">Carteiras monitoradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBTC(totalBalance)} BTC</div>
            <p className="text-sm text-gray-500">{formatUSD(totalBalance)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endereços Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {addresses.filter(addr => addr.balance > 0).length}
            </div>
            <p className="text-sm text-gray-500">Com saldo positivo</p>
          </CardContent>
        </Card>
      </div>

      {/* Adicionar Novo Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Adicionar Novo Endereço Manualmente</span>
          </CardTitle>
          <CardDescription>
            Insira um novo endereço Bitcoin para monitoramento no FDR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new_address">Endereço Bitcoin</Label>
              <Input
                id="new_address"
                placeholder="Ex: 1CYtH4TeoAHZUZqCHBBkrLtwRh5Kquj82i"
                value={newAddress.address}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_label">Rótulo (Opcional)</Label>
              <Input
                id="new_label"
                placeholder="Ex: Carteira Fria 01"
                value={newAddress.label}
                onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
          </div>
          <Button
            onClick={handleAddAddress}
            disabled={addLoading}
            className="w-full"
          >
            {addLoading ? 'Adicionando...' : 'Adicionar Endereço'}
          </Button>
          {addStatus && (
            <Alert variant={addStatus.type === 'success' ? 'default' : 'destructive'}>
              {addStatus.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>
                {addStatus.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Controles e Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Endereços do FDR</CardTitle>
          <CardDescription>
            Lista completa de todos os endereços Bitcoin que compõem o fundo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchAddresses} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Saldo (BTC)</TableHead>
                  <TableHead>Saldo (USD)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAddresses.map((addr, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <div>
                          <code className="text-sm font-mono">
                            {addr.address.substring(0, 15)}...{addr.address.substring(addr.address.length - 5)}
                          </code>
                          {addr.label && <p className="text-xs text-gray-500">{addr.label}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatBTC(addr.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600">
                        {formatUSD(addr.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={addr.balance > 0 ? "default" : "secondary"}
                      >
                        {addr.balance > 0 ? "Ativo" : "Vazio"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(addr.address)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openInExplorer(addr.address)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAddresses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum endereço encontrado com os critérios de busca.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Endereço de Custódia Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Endereço de Custódia Principal</span>
          </CardTitle>
          <CardDescription>
            Endereço consolidado na Binance para custódia dos fundos do FDR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Endereço:</p>
                <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                  bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8
                </code>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8')}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openInExplorer('bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explorar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddressesTab
