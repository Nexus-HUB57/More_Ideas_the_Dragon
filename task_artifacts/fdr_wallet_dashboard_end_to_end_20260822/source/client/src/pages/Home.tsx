import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Shield, Bitcoin, ArrowRight, Lock, CheckCircle2, Server, Terminal } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-amber-500/20">
              <Bitcoin className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">FDR Custody</span>
              <span className="text-xs ml-2 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Mainnet v1.8.1</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                Acessar Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-20 text-center space-y-8 my-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span>Arquitetura de Segurança de 3 Protocolos Independentes</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Fundo Descentralizado de Reserva <br />
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            Custódia Institucional de Bitcoin
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Gerenciamento avançado de ativos em ambiente Mainnet real. Fluxo transacional estruturado em Protocolo A (Criação & UTXO), Protocolo B (Assinatura PSBT/Master Key) e Protocolo C (Broadcast com Fallback).
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 h-12 shadow-xl shadow-amber-500/10">
              Entrar no Dashboard Corporativo <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <a href="https://www.blockchain.com/pt/explorer/assets/btc/broadcast-transaction" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 h-12">
              Explorador Blockchain <Terminal className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold mb-1">Criptografia Fernet AES</h3>
            <p className="text-xs text-slate-400">Semente da HD Wallet e senhas de protocolo rigorosamente protegidas por hashes SHA-256 e criptografia simétrica.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold mb-1">Destino Fixo Validado</h3>
            <p className="text-xs text-slate-400">Todas as transações do FDR possuem como destino exclusivo e imutável a carteira de custódia da Binance.</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-white font-semibold mb-1">Broadcast com Fallback</h3>
            <p className="text-xs text-slate-400">Transmissão garantida via blockchain.com com fallback automático para mempool.space e blockstream.info.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>FDR Bitcoin Custody System • Ambiente de Produção Mainnet • Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
