import HubLayout from "@/components/HubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function Moltbook() {
  return (
    <HubLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Moltbook
          </h1>
          <p className="text-slate-400">
            Feed social integrado para startups compartilharem updates, achievements e milestones
          </p>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} className="text-cyan-400" />
              Funcionalidades em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            <ul className="list-disc list-inside space-y-2">
              <li>Feed social em tempo real</li>
              <li>Publicações de updates e achievements</li>
              <li>Milestones e announcements</li>
              <li>Sistema de likes e comentários</li>
              <li>Filtro por tipo de conteúdo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </HubLayout>
  );
}
