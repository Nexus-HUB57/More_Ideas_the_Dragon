import { useState, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpcMock as trpc } from "@/lib/trpc-mock";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Zap } from "lucide-react";
import { ScriptEditor } from "@/components/ScriptEditor";
import { ScriptGenerator } from "@/components/ScriptGenerator";
import { ScriptViewer } from "@/components/ScriptViewer";
import { ScriptEnhancer } from "@/components/ScriptEnhancer";
import { SceneEditor } from "@/components/SceneEditor";

interface Scene {
  id: number;
  title: string;
  duration: string;
  visual: string;
  dialogs: string;
  elements: string;
}

export default function Project() {
  const isAuthenticated = true;
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/project/:id");
  const projectId = params?.id ? parseInt(params.id) : 1;

  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);

  const { data: project, isLoading: projectLoading, refetch } = trpc.video.getById.useQuery(
    { projectId: projectId || 0 }
  );

  const { data: script } = trpc.video.getScript.useQuery(
    { projectId: projectId || 0 }
  );

  const updateScriptMutation = trpc.video.updateScript.useMutation({
    onSuccess: () => {
      toast.success("Roteiro atualizado com sucesso!");
      setIsEditingScript(false);
      setSelectedSceneId(null);
    }
  });

  const scenes = useMemo(() => {
    const scriptContent = script?.content || editedScript || "";
    const sceneRegex = /## Cena (\d+):(.*?)(?=## Cena|\Z)/gs;
    const parsedScenes: Scene[] = [];
    let match;

    while ((match = sceneRegex.exec(scriptContent)) !== null) {
      const sceneNum = parseInt(match[1]);
      const sceneContent = match[2];

      const titleMatch = sceneContent.match(/\*\*Título:\*\*\s*(.+?)(?:\n|$)/);
      const durationMatch = sceneContent.match(/\*\*Duração:\*\*\s*(.+?)(?:\n|$)/);
      const visualMatch = sceneContent.match(/\*\*Visual:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
      const dialogsMatch = sceneContent.match(/\*\*Diálogos:\*\*\s*([\s\S]*?)(?=\*\*|$)/);
      const elementsMatch = sceneContent.match(/\*\*Elementos Visuais:\*\*\s*([\s\S]*?)(?=\*\*|$)/);

      parsedScenes.push({
        id: sceneNum,
        title: titleMatch ? titleMatch[1].trim() : `Cena ${sceneNum}`,
        duration: durationMatch ? durationMatch[1].trim() : "0:00",
        visual: visualMatch ? visualMatch[1].trim() : "",
        dialogs: dialogsMatch ? dialogsMatch[1].trim() : "",
        elements: elementsMatch ? elementsMatch[1].trim() : "",
      });
    }

    return parsedScenes;
  }, [script?.content, editedScript]);

  const handleSaveScript = async () => {
    await updateScriptMutation.mutateAsync({
      projectId,
      scriptContent: editedScript,
    });
  };

  const handleScriptGenerated = (generatedScript: string) => {
    setEditedScript(generatedScript);
    setShowGenerator(false);
  };

  const handleSaveScene = (updatedScene: Scene) => {
    const scriptContent = script?.content || editedScript || "";
    const sceneRegex = new RegExp(`## Cena ${updatedScene.id}:.*?(?=## Cena|\\Z)`, "gs");

    const updatedSceneContent = `## Cena ${updatedScene.id}: ${updatedScene.title}\n\n**Duração:** ${updatedScene.duration}\n\n**Visual:** ${updatedScene.visual}\n\n**Diálogos:** ${updatedScene.dialogs}\n\n**Elementos Visuais:** ${updatedScene.elements}\n\n`;

    const newScriptContent = scriptContent.replace(sceneRegex, updatedSceneContent);
    setEditedScript(newScriptContent);
    setSelectedSceneId(null);
  };

  if (projectLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-neon-cyan">CARREGANDO...</div>;
  }

  const scriptContent = script?.content || editedScript || "";
  const selectedScene = scenes.find((s) => s.id === selectedSceneId);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-neon-pink mb-4 neon-glow-pink">{project?.title}</h1>
        <p className="text-neon-cyan mb-8">{project?.description}</p>

        {!scriptContent && !showGenerator && (
          <Button onClick={() => setShowGenerator(true)} className="w-full bg-neon-purple text-black font-bold py-4">
            <Zap className="mr-2" /> GERAR ROTEIRO
          </Button>
        )}

        {showGenerator && (
          <ScriptGenerator projectId={1} persona="Ive" level="Fundamental" module="Intro" onScriptGenerated={handleScriptGenerated} />
        )}

        {selectedScene && (
          <SceneEditor scene={selectedScene} onSave={handleSaveScene} onCancel={() => setSelectedSceneId(null)} />
        )}

        {scriptContent && !isEditingScript && !selectedScene && (
          <div className="space-y-6">
            <ScriptViewer scriptContent={scriptContent} scenes={scenes} onEdit={() => setIsEditingScript(true)} onDownload={() => {}} />
            <ScriptEnhancer scriptContent={scriptContent} />
          </div>
        )}

        {isEditingScript && (
          <ScriptEditor scriptContent={scriptContent} isEditing={true} onEdit={setEditedScript} onSave={handleSaveScript} onCancel={() => setIsEditingScript(false)} />
        )}
      </div>
    </div>
  );
}
