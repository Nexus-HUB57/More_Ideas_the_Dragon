import HubLayout from "@/components/HubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Audit() {
  return (
    <HubLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Auditoria e Compliance
          </h1>
          <p className="text-slate-400">
            Logs detalhados, persistência em S3 e snapshots automáticos de decisões críticas
          </p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} className="text-cyan-400" />
              Funcionalidades em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <ul className="list-disc list-inside space-y-2">
              <li>Logs detalhados de todas as ações</li>
              <li>Persistência de auditoria em S3</li>
              <li>Snapshots automáticos de decisões</li>
              <li>Rastreabilidade completa de transações</li>
              <li>Relatórios de compliance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </HubLayout>
  );
}
