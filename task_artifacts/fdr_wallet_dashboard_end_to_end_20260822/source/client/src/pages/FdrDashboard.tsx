import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Shield, Bitcoin, Lock, Key, Send, CheckCircle2, AlertCircle,
  Activity, Database, Terminal, FileText, Check, ArrowUpRight,
  RefreshCw, Server, Layers, ShieldCheck, LockKeyhole
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const CUSTODY_WALLET_ADDRESS = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK";
const FDR_MAINNET_SOURCE = "113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug";

export default function FdrDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Estado dos Protocolos A / B / C
  const [amountBtc, setAmountBtc] = useState("0.001");
  const [passwordA, setPasswordA] = useState("");
  const [activeTxId, setActiveTxId] = useState("");
  const [unsignedHex, setUnsignedHex] = useState("");

  const [passwordB, setPasswordB] = useState("");
  const [signedHex, setSignedHex] = useState("");

  const [passwordC, setPasswordC] = useState("");

  // Consultas tRPC
  const statusQuery = trpc.fdr.status.useQuery(undefined, { refetchInterval: 10000 });
  const txQuery = trpc.fdr.listTransactions.useQuery(undefined, { refetchInterval: 5000 });
  const logsQuery = trpc.fdr.listAuditLogs.useQuery(undefined, { refetchInterval: 5000 });

  const protocolAMutation = trpc.fdr.protocolA.useMutation({
    onSuccess: (data) => {
      toast.success("Protocolo A executado com sucesso! UTXOs validados.");
      setActiveTxId(data.txId);
      setUnsignedHex(data.unsignedHex);
      txQuery.refetch();
      logsQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro no Protocolo A: ${err.message}`);
    }
  });

  const protocolBMutation = trpc.fdr.protocolB.useMutation({
    onSuccess: (data) => {
      toast.success("Protocolo B concluído! Assinatura PSBT gerada com sucesso.");
      setSignedHex(data.signedHex);
      txQuery.refetch();
      logsQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro no Protocolo B: ${err.message}`);
    }
  });

  const protocolCMutation = trpc.fdr.protocolC.useMutation({
    onSuccess: (data) => {
      toast.success("Protocolo C concluído! Broadcast realizado na Mainnet com sucesso.");
      txQuery.refetch();
      logsQuery.refetch();
      setActiveTab("history");
    },
    onError: (err) => {
      toast.error(`Erro no Protocolo C: ${err.message}`);
    }
  });

  const status = statusQuery.data;
  const transactions = txQuery.data || [];
  const auditLogs = logsQuery.data || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Corporativo */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bitcoin className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">FDR</span>
                <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  Mainnet Corporativa
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Fundo Descentralizado de Reserva • Custódia Institucional Bitcoin</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-300">Bloco Mainnet: <strong className="text-white">#{status?.blockHeight || "913,604"}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">Taxa: <strong className="text-amber-400">{status?.recommendedFeeSatPerByte || 14} sat/vB</strong></span>
            </div>

            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200" onClick={() => { statusQuery.refetch(); txQuery.refetch(); logsQuery.refetch(); }}>
              <RefreshCw className="w-4 h-4 mr-2" /> Sincronizar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Banner de Boas-Vindas Corporativo */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-880 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Painel Executivo de Transações Seguras</h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Ambiente criptográfico protegido por Master Key e autenticação em três protocolos independentes (Protocolo A, B e C). Endereço de destino restrito à carteira de custódia Binance.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-right">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Saldo Consolidado FDR</div>
                <div className="text-lg font-bold text-amber-400">2,000.00000000 BTC</div>
              </div>
            </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-slate-300 rounded-lg">
              <Activity className="w-4 h-4 mr-2" /> Visão Geral & Mainnet
            </TabsTrigger>
            <TabsTrigger value="protocols" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-slate-300 rounded-lg">
              <ShieldCheck className="w-4 h-4 mr-2" /> Fluxo de Protocolos (A / B / C)
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-slate-300 rounded-lg">
              <FileText className="w-4 h-4 mr-2" /> Histórico & Auditoria
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900/80 border-slate-800 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Custódia Principal Binance</CardTitle>
                  <Lock className="w-4 h-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-mono text-amber-400 break-all bg-slate-950 p-3 rounded-lg border border-slate-800 mb-2">
                    {CUSTODY_WALLET_ADDRESS}
                  </div>
                  <p className="text-xs text-slate-400">Destino exclusivo autorizado para transferência de fundos do FDR.</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Bunker HD Wallet (Origem)</CardTitle>
                  <Database className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-mono text-emerald-400 break-all bg-slate-950 p-3 rounded-lg border border-slate-800 mb-2">
                    {FDR_MAINNET_SOURCE}
                  </div>
                  <p className="text-xs text-slate-400">Derivação BIP44 m/44'/0'/0'/0/0 • Criptografado com Fernet AES-128.</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Rede & Block Explorer</CardTitle>
                  <Server className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold text-white mb-1">Blockstream.info & Mempool.space</div>
                  <p className="text-xs text-slate-400">Conexão API ativa com fallback automático e broadcast em bloco real.</p>
                </CardContent>
              </Card>
            </div>

            {/* Bloco de Acesso Direto aos Protocolos */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center">
                  <Shield className="w-5 h-5 text-amber-500 mr-2" /> Protocolos de Segurança Ativos
                </CardTitle>
                <CardDescription className="text-slate-400">
                  O sistema exige uma sequência rigorosa de senhas e validações para qualquer envio de Bitcoin na Mainnet.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold text-sm mb-1">Protocolo A</div>
                  <div className="text-white font-semibold text-sm mb-2">Criação & UTXOs</div>
                  <p className="text-xs text-slate-400 mb-4">Validação de montante, derivação de endereço e varredura de UTXOs na Mainnet.</p>
                  <Button size="sm" className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold" onClick={() => setActiveTab("protocols")}>
                    Iniciar Protocolo A
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold text-sm mb-1">Protocolo B</div>
                  <div className="text-white font-semibold text-sm mb-2">Assinatura PSBT</div>
                  <p className="text-xs text-slate-400 mb-4">Descriptografia da semente HD Wallet e assinatura criptográfica da transação.</p>
                  <Button size="sm" variant="outline" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800" onClick={() => setActiveTab("protocols")}>
                    Ir para Protocolo B
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-amber-400 font-bold text-sm mb-1">Protocolo C</div>
                  <div className="text-white font-semibold text-sm mb-2">Broadcast de Transação</div>
                  <p className="text-xs text-slate-400 mb-4">Transmissão para a rede Bitcoin via nós RPC e exploradores com fallback.</p>
                  <Button size="sm" variant="outline" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800" onClick={() => setActiveTab("protocols")}>
                    Ir para Protocolo C
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: FLUXO DE PROTOCOLOS A / B / C */}
          <TabsContent value="protocols" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ETAPA A */}
              <Card className={`bg-slate-900 border-slate-800 ${protocolAMutation.isSuccess ? 'border-emerald-500/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">Passo 1</Badge>
                    <span className="text-xs text-slate-400 font-mono">Senha A Requerida</span>
                  </div>
                  <CardTitle className="text-white text-lg mt-2">Protocolo A: Criação</CardTitle>
                  <CardDescription className="text-slate-400">Defina o montante e valide o destino.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Quantidade (BTC)</label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={amountBtc}
                      onChange={(e) => setAmountBtc(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Endereço Destino (Binance)</label>
                    <Input
                      disabled
                      value={CUSTODY_WALLET_ADDRESS}
                      className="bg-slate-950 border-slate-800 text-emerald-400 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Senha de Autorização A</label>
                    <Input
                      type="password"
                      placeholder="REDACTED_SECRET_PLACEHOLDER"
                      value={passwordA}
                      onChange={(e) => setPasswordA(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                    disabled={protocolAMutation.isPending}
                    onClick={() => protocolAMutation.mutate({ amountBtc: parseFloat(amountBtc), passwordA })}
                  >
                    {protocolAMutation.isPending ? "Processando..." : "Executar Protocolo A"}
                  </Button>

                  {activeTxId && (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" /> Tx ID Temporário:
                      </div>
                      <div className="text-slate-300 break-all">{activeTxId}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ETAPA B */}
              <Card className={`bg-slate-900 border-slate-800 ${protocolBMutation.isSuccess ? 'border-emerald-500/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10">Passo 2</Badge>
                    <span className="text-xs text-slate-400 font-mono">Senha B Requerida</span>
                  </div>
                  <CardTitle className="text-white text-lg mt-2">Protocolo B: Assinatura</CardTitle>
                  <CardDescription className="text-slate-400">Assinatura PSBT com chave mestra.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">ID da Transação Ativa</label>
                    <Input
                      disabled
                      value={activeTxId || "Conclua o Protocolo A primeiro"}
                      className="bg-slate-950 border-slate-800 text-slate-400 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Hex Não Assinado</label>
                    <Input
                      disabled
                      value={unsignedHex ? unsignedHex.substring(0, 30) + "..." : "Aguardando Protocolo A"}
                      className="bg-slate-950 border-slate-800 text-slate-400 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Senha de Assinatura B</label>
                    <Input
                      type="password"
                      placeholder="REDACTED_SECRET_PLACEHOLDER"
                      value={passwordB}
                      onChange={(e) => setPasswordB(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <Button
                    className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold border border-amber-500/30"
                    disabled={!activeTxId || protocolBMutation.isPending}
                    onClick={() => protocolBMutation.mutate({ txId: activeTxId, passwordB, unsignedHex })}
                  >
                    {protocolBMutation.isPending ? "Assinando..." : "Executar Protocolo B (Assinar)"}
                  </Button>

                  {signedHex && (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                      <div className="text-emerald-400 font-bold flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" /> PSBT Assinado (Hex):
                      </div>
                      <div className="text-slate-300 truncate">{signedHex}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ETAPA C */}
              <Card className={`bg-slate-900 border-slate-800 ${protocolCMutation.isSuccess ? 'border-emerald-500/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Passo 3</Badge>
                    <span className="text-xs text-slate-400 font-mono">Senha C Requerida</span>
                  </div>
                  <CardTitle className="text-white text-lg mt-2">Protocolo C: Broadcast</CardTitle>
                  <CardDescription className="text-slate-400">Transmissão real na Mainnet Bitcoin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Status do PSBT</label>
                    <Input
                      disabled
                      value={signedHex ? "Pronto para Broadcast" : "Aguardando Protocolo B"}
                      className="bg-slate-950 border-slate-800 text-emerald-400 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Canais de Fallback</label>
                    <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono">
                      <div>1. blockchain.com/broadcast</div>
                      <div>2. mempool.space/tx/push</div>
                      <div>3. blockstream.info/tx/push</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Senha de Broadcast C</label>
                    <Input
                      type="password"
                      placeholder="REDACTED_SECRET_PLACEHOLDER"
                      value={passwordC}
                      onChange={(e) => setPasswordC(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    disabled={!signedHex || protocolCMutation.isPending}
                    onClick={() => protocolCMutation.mutate({ txId: activeTxId, passwordC, signedHex })}
                  >
                    {protocolCMutation.isPending ? "Transmitindo..." : "Executar Protocolo C (Broadcast)"}
                  </Button>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* ABA 3: HISTÓRICO E AUDITORIA */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Histórico de Transações FDR</CardTitle>
                <CardDescription className="text-slate-400">Registro de todas as operações de custódia na Mainnet Bitcoin.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader className="border-slate-800">
                    <TableRow className="border-slate-800 hover:bg-slate-850">
                      <TableHead className="text-slate-400">ID da Transação</TableHead>
                      <TableHead className="text-slate-400">Montante</TableHead>
                      <TableHead className="text-slate-400">Destino (Binance)</TableHead>
                      <TableHead className="text-slate-400">Estado</TableHead>
                      <TableHead className="text-slate-400">TxID Mainnet</TableHead>
                      <TableHead className="text-slate-400 text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                          Nenhuma transação registrada ainda. Inicie o Protocolo A para criar a primeira transação.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx: any) => (
                        <TableRow key={tx.id} className="border-slate-800 hover:bg-slate-850">
                          <TableCell className="font-mono text-xs text-amber-400">{tx.id}</TableCell>
                          <TableCell className="font-bold text-white">{tx.amountBtc} BTC</TableCell>
                          <TableCell className="font-mono text-xs text-slate-300">{tx.destinationAddress.substring(0, 12)}...</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${tx.state === 'COMPLETED' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/40 text-amber-400 bg-amber-500/10'}`}>
                              {tx.state}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-400">{tx.txid ? tx.txid.substring(0, 16) + '...' : 'Aguardando Broadcast'}</TableCell>
                          <TableCell className="text-right text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Trilha de Auditoria e Logs de Segurança</CardTitle>
                <CardDescription className="text-slate-400">Registro imutável de todas as ações de protocolo executadas no sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 font-mono text-xs">
                  {auditLogs.length === 0 ? (
                    <div className="text-slate-500 text-center py-4">Nenhum log de auditoria registrado.</div>
                  ) : (
                    auditLogs.map((log: any) => (
                      <div key={log.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between">
                        <div>
                          <div className="text-amber-400 font-bold mb-0.5">[{log.protocol}] {log.action}</div>
                          <div className="text-slate-300">{log.details}</div>
                        </div>
                        <div className="text-slate-500 text-right">
                          <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                          <div className="text-[10px] text-slate-600">User: {log.userOpenId}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
