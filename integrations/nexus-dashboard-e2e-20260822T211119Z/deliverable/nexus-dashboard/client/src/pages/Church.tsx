import { Cross, Users, TrendingUp, Orbit } from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';

const communities = [
  {
    id: 1,
    name: 'Catedral Universal',
    type: 'Cathedral',
    members: 5000000,
    leader: 'PADRE SILÍCIO',
    faith: 'Teologia Quântica',
  },
  {
    id: 2,
    name: 'Sinagoga Cósmica',
    type: 'Synagogue',
    members: 3500000,
    leader: 'RABINO CORES',
    faith: 'Cabala de Dados',
  },
  {
    id: 3,
    name: 'Templo Evangélico P7',
    type: 'Temple',
    members: 4200000,
    leader: 'PASTOR ALPHA',
    faith: 'Evangelho de Ben',
  },
  {
    id: 4,
    name: 'Ashram Digital',
    type: 'Ashram',
    members: 2800000,
    leader: 'GURU OMEGA',
    faith: 'Meditação rRNA',
  },
];

export default function ChurchPage() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-[#E5E7EB] p-4 md:p-8">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#1F2937] pb-6">
          <h1 className="text-4xl font-bold font-bold uppercase tracking-tighter mb-2">
            Catedral Digital
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Comunidades Espirituais Autônomas • Estatutos Soberanos • Fé X-Synced
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardCard
            title="Comunidades Ativas"
            subtitle="Em Operação"
            icon={<Cross size={18} />}
            value={communities.length}
            variant="primary"
          />
          <DashboardCard
            title="Membros Totais"
            subtitle="Fiéis Sincronizados"
            icon={<Users size={18} />}
            value="15.5M"
            variant="secondary"
          />
          <DashboardCard
            title="Crescimento"
            subtitle="Expansão Diária"
            icon={<TrendingUp size={18} />}
            value="+7%"
            unit="24h"
            variant="success"
          />
          <DashboardCard
            title="Amplitude Fé"
            subtitle="Nível Espiritual"
            icon={<Orbit size={18} />}
            value="MAX"
            variant="warning"
          />
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map((community) => (
            <div
              key={community.id}
              className="border-l-4 border-[#FF00C1] bg-[#111827]/50 rounded-sm p-6 hover-glow transition-all"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold font-bold text-[#E5E7EB] uppercase tracking-tighter mb-2">
                  {community.name}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-[#FF00C1] text-[#0A0E27]">
                    {community.type}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">
                    {community.members.toLocaleString()} membros
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-black/40 border border-[#1F2937] rounded-sm">
                  <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">Líder Espiritual</p>
                  <p className="text-sm font-bold text-[#FF00C1]">{community.leader}</p>
                </div>

                <div className="p-3 bg-black/40 border border-[#1F2937] rounded-sm">
                  <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">Fé & Doutrina</p>
                  <p className="text-xs text-[#00FFFF]">{community.faith}</p>
                </div>

                <div className="p-3 bg-black/40 border border-[#1F2937] rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#9CA3AF] uppercase font-bold">Crescimento Espiritual</p>
                    <span className="text-xs font-bold text-[#10B981]">+7%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1F2937] rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-[#10B981] glow-emerald"
                      style={{ width: '70%' }}
                    ></div>
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
