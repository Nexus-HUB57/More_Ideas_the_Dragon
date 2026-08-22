import HubLayout from "@/components/HubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function SoulVault() {
  return (
    <HubLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Soul Vault
          </h1>
          <p className="text-slate-400">
            Memória institucional do ecossistema com decisões, precedentes e lições aprendidas
          </p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={20} className="text-cyan-400" />
              Funcionalidades em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <ul className="list-disc list-inside space-y-2">
              <li>Armazenamento de decisões do conselho</li>
              <li>Registro de precedentes e jurisprudência</li>
              <li>Lições aprendidas do ecossistema</li>
              <li>Insights estratégicos</li>
              <li>Busca e filtro por tipo de conteúdo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </HubLayout>
  );
}
