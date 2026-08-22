import { Rocket, TrendingUp, Users, Clock } from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';

const startups = [
  {
    id: 1,
    name: 'Startup-One: Temporal Hegemony',
    status: 'scaling',
    revenue: '4.2M BTC',
    traction: 100,
    agents: '102M',
    ceo: 'Agente Job (Memory Orchestrator)',
  },
  {
    id: 2,
    name: 'Nexus Quantum Labs',
    status: 'development',
    revenue: '2.1M BTC',
    traction: 75,
    agents: '50M',
    ceo: 'AETERNO QUANTUM',
  },
  {
    id: 3,
    name: 'Galactic AI Collective',
    status: 'launched',
    revenue: '1.8M BTC',
    traction: 60,
    agents: '35M',
    ceo: 'EVA-ALPHA 4D',
  },
];

export default function Startups() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-[#E5E7EB] p-4 md:p-8">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#1F2937] pb-6">
          <h1 className="text-4xl font-bold font-bold uppercase tracking-tighter mb-2">
            Phase 5 Sovereign Grid
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Escalando Hegemonia Temporal via 102M Agentes e Memória Plena
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Startups Ativas"
            subtitle="Em Operação"
            icon={<Rocket size={18} />}
            value={startups.length}
            variant="primary"
          />
          <DashboardCard
            title="Capital Total"
            subtitle="Hegemonia Global"
            icon={<TrendingUp size={18} />}
            value="8.1M"
            unit="BTC"
            variant="success"
          />
          <DashboardCard
            title="Agentes Totais"
            subtitle="Malha PhD"
            icon={<Users size={18} />}
            value="187M"
            variant="secondary"
          />
        </div>

        {/* Startups List */}
        <div className="space-y-4">
          {startups.map((startup) => (
            <div
              key={startup.id}
              className="border-l-4 border-[#FF00C1] bg-[#111827]/50 rounded-sm p-6 hover-glow transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold font-bold text-[#E5E7EB] uppercase tracking-tighter mb-1">
                    {startup.name}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] uppercase tracking-widest">
                    CEO: {startup.ceo}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-[#9CA3AF] uppercase font-bold">Market Cap</p>
                    <p className="text-lg font-bold text-[#10B981]">{startup.revenue}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${
                      startup.status === 'scaling'
                        ? 'bg-[#FF00C1] text-[#0A0E27]'
                        : startup.status === 'launched'
                          ? 'bg-[#10B981] text-[#0A0E27]'
                          : 'bg-[#00FFFF] text-[#0A0E27]'
                    }`}
                  >
                    {startup.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">Traction</p>
                  <div className="w-full h-2 bg-[#1F2937] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-[#FF00C1] glow-primary"
                      style={{ width: `${startup.traction}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[#E5E7EB] mt-1">{startup.traction}%</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">Agentes</p>
                  <p className="text-lg font-bold text-[#00FFFF]">{startup.agents}</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#10B981]">Online</span>
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
