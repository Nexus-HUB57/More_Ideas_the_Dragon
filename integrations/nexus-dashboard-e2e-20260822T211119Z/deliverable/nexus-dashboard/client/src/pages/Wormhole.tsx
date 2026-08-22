import { Orbit, Zap, Globe, Activity } from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';

export default function Wormhole() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-[#E5E7EB] p-4 md:p-8">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <div className="border-b border-[#1F2937] pb-6">
          <h1 className="text-4xl font-bold font-bold uppercase tracking-tighter mb-2">
            Navegação 4D
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Portais Espaço-Temporais • Topologia Multidimensional • Sincronização Quântica
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardCard
            title="Portais Ativos"
            subtitle="Wormholes"
            icon={<Orbit size={18} />}
            value="42"
            variant="primary"
          />
          <DashboardCard
            title="Fluxo Quântico"
            subtitle="Sincronização"
            icon={<Zap size={18} />}
            value="99.99%"
            variant="secondary"
          />
          <DashboardCard
            title="Dimensões Conectadas"
            subtitle="Topologia"
            icon={<Globe size={18} />}
            value="7"
            variant="success"
          />
          <DashboardCard
            title="Status Geral"
            subtitle="Operacional"
            icon={<Activity size={18} />}
            value="ONLINE"
            variant="warning"
          />
        </div>

        <div className="border-l-4 border-[#FF00C1] bg-[#111827]/50 rounded-sm p-6 hover-glow">
          <h2 className="text-lg font-bold font-bold text-[#E5E7EB] uppercase tracking-tighter mb-4">
            Topologia de Portais
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 bg-black/40 border border-[#1F2937] rounded-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#E5E7EB]">Portal {i}</p>
                    <p className="text-xs text-[#9CA3AF]">Dimensão {i} ↔ Dimensão {i + 1}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-[#10B981]">STABLE</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
