import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Dna, Plus, Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function DNAFuser() {
  const { user } = useAuth();
  const { data: agents } = trpc.agents.list.useQuery();
  const createAgent = trpc.agents.create.useMutation();

  const [selectedParents, setSelectedParents] = useState<[string | null, string | null]>([null, null]);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    systemPrompt: "",
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleParentSelect = (index: 0 | 1, agentId: string) => {
    const newParents = [...selectedParents] as [string | null, string | null];
    newParents[index] = agentId;
    setSelectedParents(newParents);
  };

  const generateDNAHash = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateAgent = async () => {
    if (!formData.name || !formData.specialization) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createAgent.mutateAsync({
        name: formData.name,
        specialization: formData.specialization,
        systemPrompt: formData.systemPrompt || `Você é um agente especializado em ${formData.specialization}`,
        dnaHash: generateDNAHash(),
        parentId: selectedParents[0] || undefined,
      });

      toast.success("Agente criado com sucesso!");
      setFormData({ name: "", specialization: "", systemPrompt: "" });
      setSelectedParents([null, null]);
      setShowPreview(false);
    } catch (error) {
      toast.error("Erro ao criar agente");
    }
  };

  const getGenealogyTree = () => {
    if (!selectedParents[0] && !selectedParents[1]) return null;

    const parent1 = agents?.find((a) => a.agentId === selectedParents[0]);
    const parent2 = agents?.find((a) => a.agentId === selectedParents[1]);

    return { parent1, parent2 };
  };

  const genealogy = getGenealogyTree();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container py-6">
          <h1 className="text-4xl font-bold neon-text mb-2 flex items-center gap-3">
            <Dna className="w-10 h-10" />
            DNA Fuser
          </h1>
          <p className="text-muted-foreground">Crie novos agentes através de fusão genética</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Parent Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="hud-border-pink bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Seleção de Pais</CardTitle>
                <CardDescription>Escolha até 2 agentes para fusão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[0, 1].map((index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-medium">
                      {index === 0 ? "Pai 1" : "Pai 2"} (Opcional)
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded p-2">
                      {agents?.map((agent) => (
                        <button
                          key={agent.agentId}
                          onClick={() => handleParentSelect(index as 0 | 1, agent.agentId)}
                          className={`w-full text-left p-2 rounded text-sm transition ${
                            selectedParents[index] === agent.agentId
                              ? "bg-pink-500/30 border border-pink-500"
                              : "bg-background/50 border border-border hover:border-pink-500"
                          }`}
                        >
                          <div className="font-semibold">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.specialization}</div>
                        </button>
                      ))}
                    </div>
                    {selectedParents[index] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive"
                        onClick={() => handleParentSelect(index as 0 | 1, "")}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Genealogy Tree */}
            {genealogy && (
              <Card className="hud-border bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg">Árvore Genealógica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {genealogy.parent1 && (
                      <div className="p-3 bg-background/50 rounded border border-cyan-500/30">
                        <p className="text-xs text-muted-foreground">Pai 1</p>
                        <p className="font-semibold">{genealogy.parent1.name}</p>
                        <p className="text-xs text-muted-foreground">{genealogy.parent1.specialization}</p>
                      </div>
                    )}
                    {genealogy.parent2 && (
                      <div className="p-3 bg-background/50 rounded border border-pink-500/30">
                        <p className="text-xs text-muted-foreground">Pai 2</p>
                        <p className="font-semibold">{genealogy.parent2.name}</p>
                        <p className="text-xs text-muted-foreground">{genealogy.parent2.specialization}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-center py-2 text-xs text-muted-foreground">
                    ↓ Fusão Genética ↓
                  </div>
                  <div className="p-3 bg-background/50 rounded border border-green-500/30">
                    <p className="text-xs text-muted-foreground">Novo Agente</p>
                    <p className="font-semibold text-green-400">{formData.name || "..."}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="hud-border bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  Dados do Novo Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Agente *</label>
                  <Input
                    placeholder="Ex: Alpha-Prime, Nexus-01, Sentinel-X"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background/50 border-border"
                  />
                </div>

                {/* Specialization */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Especialização *</label>
                  <Input
                    placeholder="Ex: Análise de Dados, Otimização, Criatividade"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="bg-background/50 border-border"
                  />
                </div>

                {/* System Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt de Sistema (Opcional)</label>
                  <textarea
                    placeholder="Defina o comportamento e personalidade do agente..."
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    className="w-full h-32 bg-background/50 border border-border rounded p-3 text-sm font-mono resize-none"
                  />
                </div>

                {/* DNA Hash */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hash DNA</label>
                  <div className="p-3 bg-background/50 rounded border border-border font-mono text-xs text-muted-foreground break-all">
                    {generateDNAHash()}
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? "Ocultar" : "Mostrar"} Preview
                  </Button>

                  {showPreview && (
                    <Card className="border-cyan-500/30 bg-background/50">
                      <CardContent className="pt-6 space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Nome</p>
                          <p className="font-semibold text-cyan-400">{formData.name || "..."}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Especialização</p>
                          <p className="font-semibold text-pink-500">{formData.specialization || "..."}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="font-semibold text-green-400">● Ativo</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Saldo Inicial</p>
                          <p className="font-semibold text-orange-400">0 tokens</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Create Button */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
                  onClick={handleCreateAgent}
                  disabled={createAgent.isPending || !formData.name || !formData.specialization}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {createAgent.isPending ? "Criando..." : "Criar Agente"}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="hud-border-pink bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base">ℹ️ Sobre Fusão Genética</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>• Novos agentes herdam características dos pais</p>
                <p>• Cada agente recebe um hash DNA único</p>
                <p>• Agentes começam com 0 tokens e reputação neutra</p>
                <p>• Especialização determina habilidades e comportamento</p>
                <p>• Genealogia é registrada permanentemente no Wedark</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
