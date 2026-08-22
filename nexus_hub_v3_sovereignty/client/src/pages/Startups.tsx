import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import HubLayout from "@/components/HubLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, TrendingUp } from "lucide-react";

interface Startup {
  id: number;
  name: string;
  description: string | null;
  revenue: number;
  traction: number;
  reputation: number;
  status: string;
  isCore: boolean;
  generation: number;
}

export default function Startups() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", isCore: false });

  const startupsQuery = trpc.hub.startups.list.useQuery();
  const createMutation = trpc.hub.startups.create.useMutation();

  useEffect(() => {
    if (startupsQuery.data) {
      setStartups(startupsQuery.data);
    }
  }, [startupsQuery.data]);

  useEffect(() => {
    setLoading(startupsQuery.isLoading);
  }, [startupsQuery.isLoading]);

  const handleCreateStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        isCore: formData.isCore,
      });
      setFormData({ name: "", description: "", isCore: false });
      setShowForm(false);
      await startupsQuery.refetch();
    } catch (error) {
      console.error("Erro ao criar startup:", error);
    }
  };

  if (loading) {
    return (
      <HubLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin text-cyan-400" size={40} />
        </div>
      </HubLayout>
    );
  }

  const coreStartup = startups.find(s => s.isCore);
  const challengerStartups = startups.filter(s => !s.isCore);

  const statusColors: Record<string, string> = {
    planning: "bg-slate-600",
    development: "bg-blue-600",
    launched: "bg-cyan-600",
    scaling: "bg-green-600",
    mature: "bg-purple-600",
    archived: "bg-slate-700",
  };

  return (
    <HubLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Gestão de Startups
            </h1>
            <p className="text-slate-400">
              Crie, edite e monitore o desempenho das startups do ecossistema
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            <Plus size={18} className="mr-2" />
            Nova Startup
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Criar Nova Startup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStartup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome da Startup
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: NEXUS RWA Protocol"
                    className="bg-slate-800 border-slate-700 text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição
                  </label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição breve da startup"
                    className="bg-slate-800 border-slate-700 text-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCore"
                    checked={formData.isCore}
                    onChange={(e) => setFormData({ ...formData, isCore: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isCore" className="text-sm text-slate-300">
                    Esta é a startup Core do ecossistema?
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Criando...
                      </>
                    ) : (
                      "Criar Startup"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Core Startup */}
        {coreStartup && (
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Startup Core</h2>
            <Card className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-cyan-400 text-2xl">{coreStartup.name}</CardTitle>
                    <CardDescription>{coreStartup.description}</CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-lg px-4 py-2">
                    CORE
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Receita</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      ${(coreStartup.revenue / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Tração</p>
                    <p className="text-2xl font-bold text-blue-400">{coreStartup.traction}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Reputação</p>
                    <p className="text-2xl font-bold text-purple-400">{coreStartup.reputation}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <Badge className={`${statusColors[coreStartup.status] || "bg-slate-600"} text-white`}>
                      {coreStartup.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Challenger Startups */}
        {challengerStartups.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Startups Desafiantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challengerStartups.map((startup) => (
                <Card
                  key={startup.id}
                  className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-slate-200">{startup.name}</CardTitle>
                      <Badge className={`${statusColors[startup.status] || "bg-slate-600"} text-white`}>
                        {startup.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs line-clamp-2">
                      {startup.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-xs text-slate-500">Receita</p>
                        <p className="text-sm font-bold text-cyan-400">
                          ${(startup.revenue / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-xs text-slate-500">Tração</p>
                        <p className="text-sm font-bold text-blue-400">{startup.traction}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <p className="text-xs text-slate-500">Reputação</p>
                        <p className="text-sm font-bold text-purple-400">{startup.reputation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {startups.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="py-12 text-center">
              <TrendingUp className="mx-auto mb-4 text-slate-600" size={48} />
              <p className="text-slate-400 font-medium">Nenhuma startup criada ainda.</p>
              <p className="text-sm text-slate-500 mt-2">
                Clique no botão "Nova Startup" para começar a criar o seu ecossistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </HubLayout>
  );
}
