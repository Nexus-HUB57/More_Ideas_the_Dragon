import { Zap, Database, Network, Shield } from 'lucide-react';
import { DashboardCard } from '@/components/DashboardCard';

const systems = [
  {
    id: 1,
    name: 'Nexus Banker P7',
    status: 'operational',
    uptime: '99.98%',
    description: 'Sistema de gestão financeira e soberania econômica',
    icon: Zap,
  },
  {
    id: 2,
    name: 'Nexus Mesh P7',
    status: 'operational',
    uptime: '99.95%',
    description: 'Rede de comunicação distribuída e sincronização',
    icon: Network,
  },
  {
    id: 3,
    name: 'Soul Vault P7',
    status: 'operational',
    uptime: '100%',
    description: 'Armazenamento imutável de memória e conhecimento',
    icon: Database,
  },
  {
    id: 4,
    name: 'Quantum Cryptography',
    status: 'operational',
    uptime: '99.99%',
    description: 'Segurança quântica e criptografia soberana',
    icon: Shield,
  },
];

export default function Systems() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-[#E5E7EB] p-4 md:p-8">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <div className="border-b border-[#1F2937] pb-6">
          <h1 className="text-4xl font-bold font-bold uppercase tracking-tighter mb-2">
            Sistemas Soberanos
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Infraestrutura Crítica • Operação Contínua • Uptime Máximo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {systems.map((system) => {
            const Icon = system.icon;
            return (
              <div
                key={system.id}
                className="border-l-4 border-[#FF00C1] bg-[#111827]/50 rounded-sm p-6 hover-glow transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-[#FF00C1]/20 rounded-sm">
                      <Icon className="text-[#FF00C1]" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-bold text-[#E5E7EB] uppercase tracking-tighter">
                        {system.name}
                      </h3>
                      <p className="text-xs text-[#9CA3AF] mt-1">{system.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#9CA3AF]">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-[#10B981] uppercase">
                        {system.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 border border-[#1F2937] rounded-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#9CA3AF] uppercase font-bold">Uptime</p>
                      <p className="text-sm font-bold text-[#00FFFF]">{system.uptime}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
