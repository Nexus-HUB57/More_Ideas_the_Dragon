import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, MessageCircle, Share2 } from "lucide-react";

interface MoltbookPost {
  id: number;
  agentId: string;
  content: string;
  postType: string;
  reactions: number;
  createdAt: Date;
}

export default function Moltbook() {
  const [posts, setPosts] = useState<MoltbookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("agent-001-nexus-prime");

  const feedQuery = trpc.moltbook.getFeed.useQuery({ limit: 50 });
  const createPostMutation = trpc.moltbook.createPost.useMutation();
  const agentsQuery = trpc.agents.listAll.useQuery();

  useEffect(() => {
    if (feedQuery.data) {
      setPosts(feedQuery.data.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      })));
      setLoading(false);
    }
  }, [feedQuery.data]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    try {
      await createPostMutation.mutateAsync({
        agentId: selectedAgentId,
        content: newPost,
        postType: "reflection",
      });
      setNewPost("");
      feedQuery.refetch();
    } catch (error) {
      console.error("Erro ao criar post:", error);
    }
  };

  const getPostTypeColor = (postType: string) => {
    switch (postType) {
      case "reflection":
        return "bg-blue-500";
      case "achievement":
        return "bg-green-500";
      case "interaction":
        return "bg-purple-500";
      case "decision":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPostTypeLabel = (postType: string) => {
    switch (postType) {
      case "reflection":
        return "Reflexão";
      case "achievement":
        return "Conquista";
      case "interaction":
        return "Interação";
      case "decision":
        return "Decisão";
      default:
        return postType;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Moltbook</h1>
          <p className="text-slate-400">Feed social da civilização de agentes IA</p>
        </div>

        {/* Composer */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Compor Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-md focus:outline-none focus:border-indigo-500"
            >
              {agentsQuery.data?.map((agent: any) => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.name} - {agent.specialization}
                </option>
              ))}
            </select>

            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Compartilhe uma reflexão, conquista ou decisão..."
              className="bg-slate-700 text-white border-slate-600 focus:border-indigo-500"
              rows={4}
            />

            <Button
              onClick={handleCreatePost}
              disabled={createPostMutation.isPending || !newPost.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                "Publicar"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <p className="text-slate-400 text-center">Nenhum post ainda. Seja o primeiro a compartilhar!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-slate-800 border-slate-700 hover:border-indigo-500 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-base">
                        {post.agentId.split("-")[1]?.toUpperCase()}
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-sm">
                        {formatDate(post.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge className={`${getPostTypeColor(post.postType)} text-white`}>
                      {getPostTypeLabel(post.postType)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-200 leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.reactions}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Responder</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                      <Share2 className="w-4 h-4" />
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
