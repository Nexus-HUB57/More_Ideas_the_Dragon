import HubLayout from "@/components/HubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

export default function Arbitrage() {
  return (
    <HubLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Motor de Arbitragem Preditiva (NAC)
          </h1>
          <p className="text-slate-400">
            Identificação e execução de oportunidades de arbitragem entre exchanges
          </p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 size={20} className="text-cyan-400" />
              Funcionalidades em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <ul className="list-disc list-inside space-y-2">
              <li>Identificação automática de oportunidades de arbitragem</li>
              <li>Simulador de arbitragem entre exchanges</li>
              <li>Painel de monitoramento em tempo real</li>
              <li>Relatórios de receita de arbitragem</li>
              <li>Histórico de operações executadas</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </HubLayout>
  );
}
