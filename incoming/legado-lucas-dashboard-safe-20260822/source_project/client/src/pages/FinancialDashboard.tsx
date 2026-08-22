import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FinancialDashboard() {
  const { data: financialData, isLoading } = trpc.financial.getAllData.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-amber-400" size={32} />
      </div>
    );
  }

  if (!financialData || financialData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Nenhum dado financeiro disponível</p>
      </div>
    );
  }

  // Formatar dados para gráficos
  const chartData = financialData.map((item) => ({
    year: `Ano ${item.year}`,
    patrimonioLiquido: parseFloat(item.patrimonioLiquido.replace(/[^\d.-]/g, "")) / 1e9,
    lucroAnual: parseFloat(item.lucroAnual.replace(/[^\d.-]/g, "")) / 1e6,
    valorMercado: parseFloat(item.valorMercado.replace(/[^\d.-]/g, "")) / 1e9,
    valorIntangivel: parseFloat(item.valorIntangivel.replace(/[^\d.-]/g, "")) / 1e9,
    crescimentoPL: parseFloat(item.crescimentoPL),
    multiploVMPC: parseFloat(item.multiploVMPC),
  }));

  const formatTooltip = (value: any) => {
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Gestão Financeira</h1>
        <p className="text-slate-400">Análise de Performance - 11 Anos (Ano 0 ao Ano 10)</p>
      </div>

      {/* Patrimônio Líquido */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-amber-400">Evolução do Patrimônio Líquido</CardTitle>
          <CardDescription>Crescimento do capital ao longo de 11 anos</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPL" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: "Bilhões (R$)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                formatter={(value: any) => `R$ ${formatTooltip(value)}B`}
              />
              <Area type="monotone" dataKey="patrimonioLiquido" stroke="#fbbf24" fillOpacity={1} fill="url(#colorPL)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Valor de Mercado vs Patrimônio Contábil */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-blue-400">Valor de Mercado vs Patrimônio Contábil</CardTitle>
          <CardDescription>Comparação entre VM e PC ao longo do período</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: "Bilhões (R$)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                formatter={(value: any) => `R$ ${formatTooltip(value)}B`}
              />
              <Legend wrapperStyle={{ color: "#cbd5e1" }} />
              <Line type="monotone" dataKey="valorMercado" stroke="#3b82f6" strokeWidth={2} name="Valor de Mercado" />
              <Line type="monotone" dataKey="patrimonioLiquido" stroke="#fbbf24" strokeWidth={2} name="Patrimônio Líquido" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lucro Anual */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-green-400">Lucro Anual Ajustado</CardTitle>
          <CardDescription>Rentabilidade por ano</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: "Milhões (R$)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                formatter={(value: any) => `R$ ${formatTooltip(value)}M`}
              />
              <Bar dataKey="lucroAnual" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Valor Intangível */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-purple-400">Valor Intangível Gerado</CardTitle>
          <CardDescription>Ativos intangíveis (PI, Tecnologia, Propósito)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" label={{ value: "Bilhões (R$)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                formatter={(value: any) => `R$ ${formatTooltip(value)}B`}
              />
              <Area type="monotone" dataKey="valorIntangivel" stroke="#a855f7" fillOpacity={1} fill="url(#colorVI)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Crescimento PL e Múltiplo VM/PC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-orange-400">Crescimento do Patrimônio Líquido (%)</CardTitle>
            <CardDescription>Taxa de crescimento anual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" label={{ value: "%", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  formatter={(value: any) => `${formatTooltip(value)}%`}
                />
                <Bar dataKey="crescimentoPL" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-red-400">Múltiplo VM/PC (P/B)</CardTitle>
            <CardDescription>Relação Valor de Mercado / Patrimônio Contábil</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" label={{ value: "Múltiplo (x)", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  formatter={(value: any) => `${formatTooltip(value)}x`}
                />
                <Line type="monotone" dataKey="multiploVMPC" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-amber-400">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chartData.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-400">PL Inicial (Ano 0)</p>
                  <p className="text-lg font-bold text-white">
                    R$ {chartData[0].patrimonioLiquido.toFixed(2)}B
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">PL Final (Ano 10)</p>
                  <p className="text-lg font-bold text-white">
                    R$ {chartData[chartData.length - 1].patrimonioLiquido.toFixed(2)}B
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">VM Final (Ano 10)</p>
                  <p className="text-lg font-bold text-white">
                    R$ {chartData[chartData.length - 1].valorMercado.toFixed(2)}B
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">VI Gerado (Ano 10)</p>
                  <p className="text-lg font-bold text-white">
                    R$ {chartData[chartData.length - 1].valorIntangivel.toFixed(2)}B
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
