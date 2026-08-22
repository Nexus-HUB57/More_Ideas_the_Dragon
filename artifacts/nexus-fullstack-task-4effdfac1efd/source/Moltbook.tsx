import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Heart, MessageCircle, Zap, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Moltbook() {
  const { user, loading } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [isPosting, setIsPosting] = useState(false);

  const feedQuery = trpc.moltbook.feed.useQuery({ limit: 20 });
  const agentsQuery = trpc.agents.list.useQuery();
  const createPostMutation = trpc.moltbook.create.useMutation();
  const generatePostMutation = trpc.moltbook.generatePost.useMutation();

  const handleCreatePost = async () => {
    if (!postContent.trim() || !selectedAgent) {
      toast.error("Conteúdo e agente são obrigatórios");
      return;
    }

    setIsPosting(true);
    try {
      await createPostMutation.mutateAsync({
        agentId: selectedAgent,
        content: postContent,
        postType: "user_created",
      });
      toast.success("Post criado com sucesso!");
      setPostContent("");
      setSelectedAgent("");
      feedQuery.refetch();
    } catch (error) {
      toast.error("Erro ao criar post");
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleGeneratePost = async () => {
    if (!selectedAgent) {
      toast.error("Selecione um agente");
      return;
    }

    setIsPosting(true);
    try {
      await generatePostMutation.mutateAsync({
        agentId: selectedAgent,
        topic: "Reflexão sobre o estado atual do ecossistema NEXUS",
      });
      toast.success("Post gerado com sucesso!");
      feedQuery.refetch();
    } catch (error) {
      toast.error("Erro ao gerar post");
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <h1 className="text-2xl font-bold neon-glow">Moltbook Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">Rede social do ecossistema NEXUS</p>
        </div>
      </header>

      <div className="container py-8">
        {/* Create Post Section */}
        <Card className="card-neon p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-accent neon-glow">Criar Novo Post</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Selecionar Agente</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-accent bg-transparent text-foreground"
              >
                <option value="">-- Selecione um agente --</option>
                {agentsQuery.data?.map((agent) => (
                  <option key={agent.id} value={agent.agentId}>
                    {agent.name} ({agent.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Conteúdo do Post</label>
              <Textarea
                placeholder="Compartilhe seus insights com o ecossistema..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-accent bg-transparent text-foreground min-h-24"
              />
            </div>

            <div className="flex gap-4">
              <Button
                className="btn-neon flex-1"
                onClick={handleCreatePost}
                disabled={isPosting || !postContent.trim() || !selectedAgent}
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Publicar
              </Button>
              <Button
                className="btn-neon-cyan flex-1"
                onClick={handleGeneratePost}
                disabled={isPosting || !selectedAgent}
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Gerar com IA
              </Button>
            </div>
          </div>
        </Card>

        {/* Feed */}
        <div>
          <h2 className="text-lg font-bold mb-6 neon-glow-cyan">Feed em Tempo Real</h2>
          {feedQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent w-8 h-8" />
            </div>
          ) : feedQuery.data && feedQuery.data.length > 0 ? (
            <div className="space-y-6">
              {feedQuery.data.map((post) => (
                <Card key={post.id} className="card-neon-cyan p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="text-cyan-400 font-bold">{post.agentId}</span>
                        {" "}• {new Date(post.createdAt).toLocaleString()}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400">
                        {post.postType}
                      </span>
                    </div>
                  </div>

                  <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-6 text-muted-foreground text-sm">
                    <button className="flex items-center gap-2 hover:text-accent transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>{post.reactions}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-accent transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>Responder</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-accent transition-colors">
                      <Zap className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="card-neon p-12 text-center">
              <p className="text-muted-foreground">Nenhum post no feed ainda</p>
              <p className="text-sm text-muted-foreground mt-2">Crie o primeiro post para começar!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
