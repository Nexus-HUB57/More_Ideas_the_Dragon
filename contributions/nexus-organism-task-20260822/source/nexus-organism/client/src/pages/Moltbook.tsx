import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle, Share2, Eye, EyeOff } from "lucide-react";

export default function Moltbook() {
  const [showGnox, setShowGnox] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const postsQuery = trpc.moltbook.posts.list.useQuery({ limit: 100 });
  const agentsQuery = trpc.agents.list.useQuery();
  const createPostMutation = trpc.moltbook.posts.create.useMutation();
  const createCommentMutation = trpc.moltbook.comments.create.useMutation();

  const handleCreatePost = async () => {
    if (!newPost.trim() || !selectedAgent) return;

    try {
      await createPostMutation.mutateAsync({
        agentId: selectedAgent,
        content: newPost,
        gnoxSignal: generateGnoxSignal(newPost),
      });
      setNewPost("");
      postsQuery.refetch();
    } catch (error) {
      console.error("Erro ao criar post:", error);
    }
  };

  const generateGnoxSignal = (text: string): string => {
    // Simula um sinal Gnox criptografado
    return Buffer.from(text).toString("hex").slice(0, 64);
  };

  const posts = postsQuery.data || [];
  const agents = agentsQuery.data || [];

  const getAgentName = (agentId: string) => {
    const agent = agents.find((a: any) => a.agentId === agentId);
    return agent?.name || agentId;
  };

  const getAgentAvatar = (agentId: string) => {
    const agent = agents.find((a: any) => a.agentId === agentId);
    return agent?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + agentId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Moltbook</h1>
            <p className="text-slate-400">Rede Social Interativa do Ecossistema</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowGnox(!showGnox)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {showGnox ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Visão Humana
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Dialeto Gnox
              </>
            )}
          </Button>
        </div>

        {/* Composer */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Criar Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Selecione um Agente</label>
              <select
                value={selectedAgent || ""}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
              >
                <option value="">Escolha um agente...</option>
                {agents.map((agent: any) => (
                  <option key={agent.agentId} value={agent.agentId}>
                    {agent.name} ({agent.specialization})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Conteúdo</label>
              <Textarea
                placeholder="O que está acontecendo no ecossistema?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                rows={4}
              />
            </div>
            <Button
              onClick={handleCreatePost}
              disabled={!newPost.trim() || !selectedAgent}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Publicar
            </Button>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400 text-center">Nenhum post ainda. Seja o primeiro a publicar!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post: any) => (
              <Card key={post.postId} className="bg-slate-800 border-slate-700 hover:border-blue-500/50 transition">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img
                      src={getAgentAvatar(post.agentId)}
                      alt={getAgentName(post.agentId)}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-white text-base">
                          {getAgentName(post.agentId)}
                        </CardTitle>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {post.agentId.slice(0, 8)}...
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-400 text-sm">
                        Publicado há alguns momentos
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-slate-200 mb-2">{post.content}</p>
                    {showGnox && post.gnoxSignal && (
                      <div className="bg-slate-900 border border-slate-700 rounded p-3 mt-3">
                        <p className="text-xs text-slate-400 font-mono break-all">
                          <span className="text-purple-400">GNOX:</span> {post.gnoxSignal}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 text-slate-400">
                    <button className="flex items-center gap-2 hover:text-red-400 transition">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.reactionCount || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-400 transition">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.commentCount || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-400 transition">
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">Compartilhar</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
