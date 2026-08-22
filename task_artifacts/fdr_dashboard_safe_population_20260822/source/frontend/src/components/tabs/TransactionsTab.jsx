import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Download,
  Calendar,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const TransactionsTab = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Estados para validação
  const [txHex, setTxHex] = useState('')
  const [txId, setTxId] = useState('')
  const [validateLoading, setValidateLoading] = useState(false)
  const [validationResult, setValidationResult] = useState(null)

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleValidateTransaction = async () => {
    if (!txHex && !txId) {
      alert('Por favor, insira o Hexadecimal ou o TXID da transação.')
      return
    }

    setValidateLoading(true)
    setValidationResult(null)

    try {
      const token = localStorage.getItem('fdr_token')
      const response = await fetch('/api/fdr/transactions/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tx_hex: txHex, tx_id: txId }),
      })

      if (response.ok) {
        const result = await response.json()
        setValidationResult(result.validation_result)
      } else {
        const errorData = await response.json()
        alert(`Erro: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao validar transação:', error)
      alert('Ocorreu um erro ao tentar validar a transação.')
    } finally {
      setValidateLoading(false)
    }
  }

  const formatBTC = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'Consolidation':
        return <ArrowDownLeft className="w-4 h-4 text-blue-500" />
      case 'BNJ57 Allocation':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />
      case 'Bot Funding':
        return <ArrowUpRight className="w-4 h-4 text-purple-500" />
      default:
        return <ArrowUpRight className="w-4 h-4 text-gray-500" />
    }
  }

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'Consolidation':
        return <Badge variant="outline" className="text-blue-600">Consolidação</Badge>
      case 'BNJ57 Allocation':
        return <Badge variant="outline" className="text-green-600">Alocação BNJ57</Badge>
      case 'Bot Funding':
        return <Badge variant="outline" className="text-purple-600">Financiamento Bot</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === 'all' || tx.type === filterType

    return matchesSearch && matchesFilter
  })

  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando transações...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total de Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-sm text-gray-500">Registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volume Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBTC(totalVolume)} BTC</div>
            <p className="text-sm text-gray-500">Movimentado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consolidações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(tx => tx.type === 'Consolidation').length}
            </div>
            <p className="text-sm text-gray-500">Realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alocações BNJ57</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(tx => tx.type === 'BNJ57 Allocation').length}
            </div>
            <p className="text-sm text-gray-500">Executadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Validação de Transação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5" />
            <span>Validar e Enviar Transação</span>
          </CardTitle>
          <CardDescription>
            Valide transações assinadas ou verifique o status na blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tx_hex">Transação Hexadecimal (Assinada)</Label>
            <Textarea
              id="tx_hex"
              placeholder="Cole aqui o hexadecimal da transação assinada..."
              value={txHex}
              onChange={(e) => setTxHex(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tx_id">Ou ID da Transação (TXID)</Label>
            <Input
              id="tx_id"
              placeholder="Cole aqui o TXID para verificar o status..."
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
            />
          </div>
          <Button
            onClick={handleValidateTransaction}
            disabled={validateLoading}
            className="w-full"
          >
            {validateLoading ? 'Validando...' : 'Validar Transação'}
          </Button>

          {validationResult && (
            <div className="mt-4 space-y-4">
              {validationResult.hex_validation && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <p className="font-medium">Hexadecimal Válido</p>
                    <p className="text-sm text-gray-600 mb-2">{validationResult.hex_validation.note}</p>
                    <Button
                      size="sm"
                      onClick={() => window.open(validationResult.hex_validation.broadcast_url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Ir para Broadcast (Blockchain.com)
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {validationResult.blockchain_validation && (
                <Alert variant={validationResult.blockchain_validation.status === 'error' ? 'destructive' : 'default'}>
                  {validationResult.blockchain_validation.status === 'confirmed' ?
                    <CheckCircle className="h-4 w-4 text-green-500" /> :
                    <AlertCircle className="h-4 w-4" />
                  }
                  <AlertDescription>
                    <p className="font-medium">Status na Blockchain: {validationResult.blockchain_validation.status.toUpperCase()}</p>
                    {validationResult.blockchain_validation.status !== 'error' ? (
                      <div className="text-sm mt-1 grid grid-cols-2 gap-2">
                        <span>Confirmações: {validationResult.blockchain_validation.confirmations}</span>
                        <span>Valor: {formatBTC(validationResult.blockchain_validation.total)} BTC</span>
                        <span>Taxas: {formatBTC(validationResult.blockchain_validation.fees)} BTC</span>
                        <span>Bloco: {validationResult.blockchain_validation.block_height}</span>
                      </div>
                    ) : (
                      <p className="text-sm">{validationResult.blockchain_validation.message}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles e Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            Registro completo de todas as movimentações do FDR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por endereço ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="Consolidation">Consolidação</SelectItem>
                <SelectItem value="BNJ57 Allocation">Alocação BNJ57</SelectItem>
                <SelectItem value="Bot Funding">Financiamento Bot</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchTransactions} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Para</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(tx.type)}
                        {getTransactionBadge(tx.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatBTC(tx.amount)} BTC
                      </span>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {tx.from.substring(0, 10)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {tx.to.substring(0, 10)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600">
                        Confirmada
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada com os critérios de busca.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximas Transações Programadas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Transações Programadas</CardTitle>
          <CardDescription>
            Transações automáticas agendadas pelo protocolo FDR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowUpRight className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">Repasse de Lucros dos Bots</p>
                  <p className="text-sm text-gray-500">Estimado: ~0.45 BTC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Em 3 dias</p>
                <p className="text-xs text-gray-500">Automático</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowUpRight className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Alocação BNJ57 (7%)</p>
                  <p className="text-sm text-gray-500">Baseado nos lucros recebidos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Após repasse</p>
                <p className="text-xs text-gray-500">Automático</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionsTab
