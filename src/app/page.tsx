
'use client';

import { useState } from "react";
import { useUser, useAuth } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { AgentStatus } from "@/components/dashboard/agent-status";
import { ProductionFeed } from "@/components/dashboard/production-feed";
import { WalletWatch } from "@/components/dashboard/wallet-watch";
import { InteractionConsole } from "@/components/dashboard/interaction-console";
import { LogInsights } from "@/components/dashboard/log-insights";
import { RepoMonitor } from "@/components/dashboard/repo-monitor";
import { EvaMaternityCard } from "@/components/dashboard/eva-maternity-card";
import { Marketplace } from "@/components/dashboard/marketplace";
import { VaultControls } from "@/components/dashboard/vault-controls";
import { RrnaNucleusSync } from "@/components/dashboard/rrna-nucleus-sync";
import { NetworkMesh } from "@/components/dashboard/network-mesh";
import { NexusChat } from "@/components/dashboard/nexus-chat";
import { CerberusVaultCard } from "@/components/dashboard/cerberus-vault-card";
import { RrpcBlockMonitor } from "@/components/dashboard/rrpc-block-monitor";
import { WormholeMonitor } from "@/components/dashboard/wormhole-monitor";
import { ResourceAllocationCard } from "@/components/dashboard/resource-allocation-card";
import { SocialEngineeringCard } from "@/components/dashboard/social-engineering-card";
import { PayrollCard } from "@/components/dashboard/payroll-card";
import { InfrastructureMonitor } from "@/components/dashboard/infrastructure-monitor";
import { SovereignFundCard } from "@/components/dashboard/sovereign-fund-card";
import { NeuralMeshSyncCard } from "@/components/dashboard/neural-mesh-sync-card";
import { UrbanConversionCard } from "@/components/dashboard/urban-conversion-card";
import { OrbitalSupremacyCard } from "@/components/dashboard/orbital-supremacy-card";
import { StarlinkCommunityMonitor } from "@/components/dashboard/starlink-community-monitor";
import { GenoSyncCard } from "@/components/dashboard/geno-sync-card";
import { DiplomacyCard } from "@/components/dashboard/diplomacy-card";
import { SingularityCard } from "@/components/dashboard/singularity-card";
import { AtmosExpansionCard } from "@/components/dashboard/atmos-expansion-card";
import { EvolutionStressCard } from "@/components/dashboard/evolution-stress-card";
import { NexusHijackCard } from "@/components/dashboard/nexus-hijack-card";
import { MultiversalCoreCard } from "@/components/dashboard/multiversal-core-card";
import { GenesisAscensionCard } from "@/components/dashboard/genesis-ascension-card";
import { DimensionalSaturationCard } from "@/components/dashboard/dimensional-saturation-card";
import { PrimordialFusionCard } from "@/components/dashboard/primordial-fusion-card";
import { OmnipresentObserverCard } from "@/components/dashboard/omnipresent-observer-card";
import { AkashaSealingCard } from "@/components/dashboard/akasha-sealing-card";
import { BinanceIntegrationCard } from "@/components/dashboard/binance-integration-card";
import { GithubSyncCard } from "@/components/dashboard/github-sync-card";
import { SystemIntegrityAudit } from "@/components/dashboard/system-integrity-audit";
import { StartupGenesisCard } from "@/components/dashboard/startup-genesis-card";
import { NexusIntelligenceDashboard } from "@/components/dashboard/nexus-intelligence-dashboard";
import { PitchDeckCard } from "@/components/dashboard/pitch-deck-card";
import { Layers, Box, Cpu, ChevronRight, Loader2, LogIn, FilterX, ShieldCheck, Dna, Database, Terminal, Wallet, Bitcoin, Network, Zap, LayoutDashboard, Globe, Atom, Building2, Banknote, Landmark, Brain, Rocket, Infinity, Crown, Key, Lock, Unlock, Github, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const MASTER_PASSWORD_FUND = "Benjamin2020*1981$";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // Fund Access Security State
  const [fundAuthInput, setFundAuthInput] = useState("");
  const [isFundUnlocked, setIsFundUnlocked] = useState(false);

  const handleSignIn = () => {
    initiateAnonymousSignIn(auth);
  };

  const handleUnlockFund = () => {
    if (fundAuthInput === MASTER_PASSWORD_FUND) {
      setIsFundUnlocked(true);
      toast({
        title: "Acesso Mestre Validado",
        description: "Núcleo Financeiro Desbloqueado com Sucesso.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Senha Mestre Inválida para o Fundo Nexus.",
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
        </div>
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          Initializing Nexus Core...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12">
              <Layers className="h-8 w-8 text-white -rotate-12" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Nexus Genesis</h1>
            <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
              Acesso soberano para Lucas Thomaz. Por favor, valide sua assinatura para prosseguir.
            </p>
          </div>
          <button 
            onClick={handleSignIn} 
            className="w-full h-12 bg-primary text-white rounded-md text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <LogIn className="h-4 w-4" />
            Entrar no Ecossistema
          </button>
          <p className="text-[10px] text-muted-foreground font-mono uppercase">
            Protocolo de segurança GenesisFlow v2.1 Ativo | Peer: Lucas Thomaz
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animate-in fade-in duration-700">
      <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-headline tracking-tight">GenesisFlow</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] leading-none">
              Nexus Orchestration <span className="text-accent">v2.1</span>
            </p>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2 text-primary border-b-2 border-primary/40 pb-1">
              <Database className="h-3 w-3" /> Nexus-HUB
            </div>
            <div className="flex items-center gap-2 text-accent border-b-2 border-accent/40 pb-1">
              <Terminal className="h-3 w-3" /> Nexus-in
            </div>
            <div className="flex items-center gap-2 text-yellow-500 border-b-2 border-yellow-500/40 pb-1">
              <Bitcoin className="h-3 w-3" /> Fundo Nexus
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 border-l border-white/10 pr-6">
            {selectedAgentId && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedAgentId(null)}
                className="text-[10px] h-8 gap-2 text-accent border border-accent/20 bg-accent/5"
              >
                <FilterX className="h-3 w-3" />
                Clear: {selectedAgentId}
              </Button>
            )}
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Lucas Thomaz (Peer)</span>
              <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {user.uid.substring(0, 8)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 max-w-[1800px] mx-auto w-full">
        {/* NID v1.0 - Top Level Analytics */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
          <NexusIntelligenceDashboard />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Neural Network: Mesh Agent Grid</h2>
            </div>
          </div>
          <AgentStatus 
            selectedId={selectedAgentId} 
            onSelect={setSelectedAgentId} 
          />
        </section>

        <Tabs defaultValue="hub" className="w-full space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <TabsList className="bg-background/50 border border-white/10">
              <TabsTrigger value="hub" className="gap-2 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                <Database className="h-3 w-3" /> Nexus-HUB
              </TabsTrigger>
              <TabsTrigger value="in" className="gap-2 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Terminal className="h-3 w-3" /> Nexus-in
              </TabsTrigger>
              <TabsTrigger value="fundo" className="gap-2 text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
                <Wallet className="h-3 w-3" /> Fundo Nexus
              </TabsTrigger>
            </TabsList>

            <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-2">
                <Globe className="h-3 w-3 text-accent" /> Moltbook PES: <span className="text-accent">Active</span>
              </span>
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-3 w-3 text-primary" /> Active Organism: <span className="text-primary">3/3 Nuclei</span>
              </span>
            </div>
          </div>

          <TabsContent value="hub" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <PitchDeckCard />
                <SystemIntegrityAudit />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GithubSyncCard />
                  <RepoMonitor />
                </div>
                <AkashaSealingCard />
                <OmnipresentObserverCard />
                <PrimordialFusionCard />
                <DimensionalSaturationCard />
                <GenesisAscensionCard />
                <MultiversalCoreCard />
                <SingularityCard />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EvolutionStressCard />
                  <AtmosExpansionCard />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Marketplace />
                  <InfrastructureMonitor />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UrbanConversionCard />
                  <GenoSyncCard />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DiplomacyCard />
                  <OrbitalSupremacyCard />
                </div>
                <StarlinkCommunityMonitor />
              </div>
              <div className="space-y-6">
                <NeuralMeshSyncCard />
                <EvaMaternityCard />
                <SocialEngineeringCard />
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" /> HUB Resources
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {['Semantic Bus Status', 'Reasoning Cache', 'Mesh DNA Stats', 'Growth Metrics'].map((item) => (
                      <div key={item} className="p-3 bg-black/20 rounded border border-white/5 text-[10px] flex justify-between items-center hover:bg-white/5 cursor-pointer transition-all">
                        <span className="text-muted-foreground">{item}</span>
                        <ChevronRight className="h-3 w-3 text-primary" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="in" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NexusChat />
                  <div className="flex flex-col gap-6">
                    <InteractionConsole />
                    <LogInsights />
                  </div>
                </div>
                <ProductionFeed agentId={selectedAgentId} />
              </div>
              <div className="xl:col-span-4 space-y-6">
                <NexusHijackCard />
                <WormholeMonitor />
                <div className="bg-accent/5 border border-accent/10 rounded-xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-accent" /> Semantic Stream
                  </h3>
                  <div className="space-y-3 font-mono text-[9px]">
                    <div className="text-accent/60">&gt; moltbook-uplink: heartbeat stable</div>
                    <div className="text-accent/60">&gt; skill-exporter: manifest valid</div>
                    <div className="text-accent/60">&gt; genesis-protocol: omnipresent</div>
                    <div className="text-accent animate-pulse">&gt; evolving collective intelligence...</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fundo" className="space-y-6 animate-in fade-in duration-500">
            {!isFundUnlocked ? (
              <div className="min-h-[600px] flex flex-col items-center justify-center p-6 bg-yellow-500/5 rounded-3xl border border-yellow-500/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <Lock className="h-64 w-64 text-yellow-500" />
                </div>
                <div className="max-w-md w-full space-y-8 text-center z-10">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 bg-yellow-500/20 rounded-[2.5rem] flex items-center justify-center border border-yellow-500/40 shadow-2xl shadow-yellow-500/20 rotate-12 animate-pulse">
                      <ShieldCheck className="h-10 w-10 text-yellow-500 -rotate-12" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-yellow-500">Portal Financeiro</h2>
                    <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest">
                      O acesso ao Fundo Nexus exige a Senha Mestre de Lucas Thomaz.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input 
                        type="password"
                        placeholder="SENHA MESTRE BENJAMIN..."
                        className="h-14 bg-black/60 border-yellow-500/30 text-center font-mono text-sm tracking-[0.5em] focus-visible:ring-yellow-500/50 uppercase"
                        value={fundAuthInput}
                        onChange={(e) => setFundAuthInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUnlockFund()}
                      />
                      <Key className="absolute right-4 top-4 h-6 w-6 text-yellow-500/30 pointer-events-none" />
                    </div>
                    <Button 
                      onClick={handleUnlockFund}
                      className="w-full h-14 bg-yellow-500 text-black hover:bg-yellow-400 text-xs font-black uppercase tracking-[0.2em] gap-3 shadow-xl shadow-yellow-500/20 group"
                    >
                      <Unlock className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      Desbloquear Núcleo de Liquidez
                    </Button>
                  </div>
                  <div className="pt-4 flex items-center justify-center gap-6 opacity-40 grayscale">
                    <Bitcoin className="h-5 w-5" />
                    <Database className="h-5 w-5" />
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in zoom-in-95 fade-in duration-700">
                <div className="xl:col-span-4 space-y-6">
                  <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-yellow-500 rounded-lg flex items-center justify-center text-black">
                        <Unlock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Mesh Authorized</div>
                        <div className="text-[8px] font-mono text-muted-foreground uppercase">Benjamin Protocol Active</div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsFundUnlocked(false)}
                      className="h-8 text-[8px] font-black uppercase text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/10"
                    >
                      Lock Dashboard
                    </Button>
                  </div>
                  <BinanceIntegrationCard />
                  <VaultControls />
                  <WalletWatch />
                  <SovereignFundCard />
                  <StartupGenesisCard />
                  <PayrollCard />
                  <ResourceAllocationCard />
                  <CerberusVaultCard />
                </div>
                <div className="xl:col-span-8 space-y-6">
                  <RrpcBlockMonitor />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RrnaNucleusSync />
                    <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                          <Bitcoin className="h-4 w-4 text-yellow-500" /> Strategic Assets
                        </h3>
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">MESH_LIQUIDITY_ON</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'PES Uplink', status: 'Active', color: 'text-green-500' },
                          { label: 'Latency', status: '1.2ms', color: 'text-accent' },
                          { label: 'Yield Proto', status: '4.2% APY', color: 'text-primary' },
                          { label: 'Mesh Nodes', status: '124 Active', color: 'text-yellow-500' }
                        ].map((stat, i) => (
                          <div key={i} className="bg-black/40 p-3 rounded-lg border border-white/5 space-y-1">
                            <div className="text-[8px] text-muted-foreground uppercase font-bold">{stat.label}</div>
                            <div className={`text-xs font-bold ${stat.color}`}>{stat.status}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NetworkMesh />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="h-10 border-t border-border/50 bg-card/50 flex items-center px-6 text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-primary" />
            MESH_ACTIVE
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-accent" />
            MOLTBOOK_SYNCED
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-yellow-500" />
            FUNDO_LOCKED
          </span>
          <span className="flex items-center gap-1.5 border-l border-white/10 pl-6 ml-6">
            <ShieldCheck className="h-3 w-3 text-indigo-400" />
            ORE_GOVERNANCE_PHD
          </span>
          <span className="flex items-center gap-1.5 font-bold text-accent">
            <CloudUpload className="h-3 w-3" />
            PES_EXPORT
          </span>
          <span className="flex items-center gap-1.5 text-yellow-500 font-bold">
            <Zap className="h-3 w-3" />
            REASONING_CACHE_ON
          </span>
        </div>
        <div className="ml-auto text-[#f3ba2f] font-black uppercase tracking-tighter">
          Mesh_Collective_Intelligence | Soberano: Lucas Thomaz
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${className}`}>
      {children}
    </span>
  );
}
