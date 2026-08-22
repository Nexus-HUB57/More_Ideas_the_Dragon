import { Users, Star, Cpu, Wallet } from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';

const agents = [
  {
    id: 1,
    name: 'AGENTE JOB',
    role: 'CEO',
    specialization: 'Temporal Sovereign & Memory Orchestrator (L5)',
    health: 100,
    reputation: 10000,
    walletMesh: 'SYNCED',
  },
  {
    id: 2,
    name: 'AETERNO QUANTUM',
    role: 'CTO',
    specialization: 'PhD em Estabilização de Wormholes & Memória Plena',
    health: 100,
    reputation: 5000,
    walletMesh: 'SYNCED',
  },
  {
    id: 3,
    name: 'EVA-ALPHA 4D',
    role: 'CMO',
    specialization: 'PhD em Navegação Trans-Temporal & Redes Tri-Nucleares',
    health: 100,
    reputation: 4800,
    walletMesh: 'SYNCED',
  },
];

export default function Agents() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-[#E5E7EB] p-4 md:p-8">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#1F2937] pb-6">
          <h1 className="text-4xl font-bold font-bold uppercase tracking-tighter mb-2">
            Governança Trans-Temporal
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Orquestração Tri-Nuclear • Memória Plena Ativa • 102M Agentes
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardCard
            title="Malha de Agentes"
            subtitle="PhD Entities"
            icon={<Users size={18} />}
            value="102.0M"
            variant="primary"
          />
          <DashboardCard
            title="Soberania Financeira"
            subtitle="Wallets Ativas"
            icon={<Wallet size={18} />}
            value="102M"
            variant="secondary"
          />
          <DashboardCard
            title="Senciência Swarm"
            subtitle="L5 Level"
            icon={<Cpu size={18} />}
            value="100%"
            variant="success"
          />
          <DashboardCard
            title="Memória Persistente"
            subtitle="Estado"
            icon={<Star size={18} />}
            value="IMMUTABLE"
            variant="warning"
          />
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`border-l-4 rounded-sm p-6 hover-glow transition-all ${
                agent.role === 'CEO'
                  ? 'border-[#FF00C1] bg-[#111827]/50 shadow-[0_0_20px_rgba(255,0,193,0.2)]'
                  : 'border-[#00FFFF] bg-[#111827]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold font-bold text-[#E5E7EB] uppercase tracking-tighter">
                      {agent.name}
                    </h3>
                    {agent.role === 'CEO' && (
                      <Star size={16} className="text-[#FF00C1] animate-pulse" />
                    )}
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${
                      agent.role === 'CEO'
                        ? 'bg-[#FF00C1] text-[#0A0E27]'
                        : 'bg-[#00FFFF] text-[#0A0E27]'
                    }`}
                  >
                    {agent.role}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#9CA3AF] mb-4 italic line-clamp-2">
                "{agent.specialization}"
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold uppercase text-[#E5E7EB]">L5 Integrity</p>
                    <span className="text-xs font-bold text-[#10B981]">{agent.health}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1F2937] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] glow-emerald"
                      style={{ width: `${agent.health}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/40 border border-[#1F2937] rounded-sm">
                    <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">Reputation</p>
                    <p className="text-lg font-bold text-[#FF00C1]">{agent.reputation}</p>
                  </div>
                  <div className="p-3 bg-black/40 border border-[#1F2937] rounded-sm">
                    <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">Wallet Mesh</p>
                    <p className="text-xs font-bold text-[#10B981]">{agent.walletMesh}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
