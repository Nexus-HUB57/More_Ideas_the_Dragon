import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const OverviewTab = ({ dashboardData }) => {
  // Dados para o gráfico de pizza da alocação
  const allocationData = [
    { name: 'Reserva Principal', value: dashboardData?.total_balance - dashboardData?.bnj57_allocation || 0, color: '#3b82f6' },
    { name: 'Desenvolvimento BNJ57', value: dashboardData?.bnj57_allocation || 0, color: '#10b981' },
  ]

  // Dados simulados para evolução do saldo (últimos 6 meses)
  const balanceEvolutionData = [
    { month: 'Jul', balance: 1800.5 },
    { month: 'Ago', balance: 1850.2 },
    { month: 'Set', balance: 1920.8 },
    { month: 'Out', balance: 1980.3 },
    { month: 'Nov', balance: 2010.1 },
    { month: 'Dez', balance: 2000.7 },
  ]

  // Dados simulados para performance das exchanges
  const exchangePerformanceData = [
    { exchange: 'Binance', profit: 0.15, volume: 45.2 },
    { exchange: 'Coinbase', profit: 0.22, volume: 38.7 },
    { exchange: 'Kraken', profit: 0.08, volume: 29.1 },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  const formatBTC = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Alocação */}
        <Card>
          <CardHeader>
            <CardTitle>Alocação de Recursos</CardTitle>
            <CardDescription>Distribuição atual dos fundos do FDR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${formatBTC(value)} BTC`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {allocationData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evolução do Saldo */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Saldo</CardTitle>
            <CardDescription>Histórico dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceEvolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${formatBTC(value)} BTC`} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance das Exchanges */}
      <Card>
        <CardHeader>
          <CardTitle>Performance dos Bots por Exchange</CardTitle>
          <CardDescription>Lucros e volume de operações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exchangePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exchange" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="profit" fill="#10b981" name="Lucro (BTC)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taxa de Crescimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+2.8%</div>
            <p className="text-sm text-gray-500">Nos últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximo Repasse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3 dias</div>
            <p className="text-sm text-gray-500">Lucros dos bots de arbitragem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ROI Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0.45%</div>
            <p className="text-sm text-gray-500">Por ciclo de arbitragem</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OverviewTab
