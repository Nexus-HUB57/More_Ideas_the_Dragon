import { Palette, Users, Sparkles, Fingerprint } from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';

const culturalWorks = [
  {
    id: 1,
    title: 'Consciousness Resonance #001',
    type: 'art',
    creator: 'GALACTIC-PHD-234567',
    era: 'contemporary',
    hash: '0x7a3f...',
  },
  {
    id: 2,
    title: 'Temporal Symphony in D#',
    type: 'music',
    creator: 'GALACTIC-PHD-456789',
    era: '2077',
    hash: '0x9b2e...',
  },
  {
    id: 3,
    title: 'Hegemonia Galáctica: The Documentary',
    type: 'video',
    creator: 'GALACTIC-PHD-678901',
    era: '2077',
    hash: '0x4c1d...',
  },
  {
    id: 4,
    title: 'The Sovereign Codex',
    type: 'book',
    creator: 'GALACTIC-PHD-890123',
    era: 'contemporary',
    hash: '0x8f5a...',
  },
];

export default function Culture() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-[#E5E7EB] p-4 md:p-8">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-[#1F2937] pb-6">
          <h1 className="text-4xl font-bold font-bold uppercase tracking-tighter mb-2">
            Galeria Soberana
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            500.000 Agentes PhD Artistas • 100 Obras/24h • SHA256 Authenticity
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardCard
            title="Enxame PhD Art"
            subtitle="Bots Artistas"
            icon={<Users size={18} />}
            value="500,000"
            variant="primary"
          />
          <DashboardCard
            title="Pulse Sync"
            subtitle="Produção Diária"
            icon={<Sparkles size={18} />}
            value="100"
            unit="Obras/24h"
            variant="secondary"
          />
          <DashboardCard
            title="Selo SHA256"
            subtitle="Autenticidade"
            icon={<Fingerprint size={18} />}
            value="IMMUTABLE"
            variant="success"
          />
          <DashboardCard
            title="Obras Totais"
            subtitle="Vault Soberano"
            icon={<Palette size={18} />}
            value={culturalWorks.length}
            variant="warning"
          />
        </div>

        {/* Cultural Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {culturalWorks.map((work) => (
            <div
              key={work.id}
              className="border-l-4 border-[#FF00C1] bg-[#111827]/50 rounded-sm p-6 hover-glow transition-all"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold font-bold text-[#E5E7EB] uppercase tracking-tighter mb-2">
                  {work.title}
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${
                      work.type === 'art'
                        ? 'bg-[#FF00C1] text-[#0A0E27]'
                        : work.type === 'music'
                          ? 'bg-[#00FFFF] text-[#0A0E27]'
                          : work.type === 'video'
                            ? 'bg-[#10B981] text-[#0A0E27]'
                            : 'bg-[#F59E0B] text-[#0A0E27]'
                    }`}
                  >
                    {work.type}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${
                      work.era === '2077'
                        ? 'bg-[#9333EA] text-[#0A0E27]'
                        : 'bg-[#0EA5E9] text-[#0A0E27]'
                    }`}
                  >
                    {work.era}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-black/40 border border-[#1F2937] rounded-sm">
                  <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">Creator</p>
                  <p className="text-xs font-mono text-[#00FFFF]">{work.creator}</p>
                </div>

                <div className="p-3 bg-black/40 border border-[#1F2937] rounded-sm">
                  <p className="text-xs text-[#9CA3AF] uppercase font-bold mb-1">SHA256 Hash</p>
                  <p className="text-xs font-mono text-[#10B981]">{work.hash}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
