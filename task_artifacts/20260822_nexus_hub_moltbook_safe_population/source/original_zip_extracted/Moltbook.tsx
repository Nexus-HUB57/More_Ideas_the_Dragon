import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Heart, MessageCircle, Share2, Wifi, WifiOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useMoltbookSocket } from "@/hooks/useMoltbookSocket";
import type { PostEvent } from "../../../server/websocket";

export default function Moltbook() {
  const { isAuthenticated } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<"reflection" | "achievement" | "interaction" | "decision">("reflection");
  const [allPosts, setAllPosts] = useState<PostEvent[]>([]);

  const feedQuery = trpc.moltbook.getFeed.useQuery({ limit: 50 }, { enabled: isAuthenticated });
  const { isConnected, posts: socketPosts } = useMoltbookSocket({
    onNewPost: (post) => {
      console.log("New post received via WebSocket:", post);
    },
  });

  const createPostMutation = trpc.moltbook.createPost.useMutation({
    onSuccess: () => {
      setNewPost("");
      feedQuery.refetch();
    },
  });

  // Combinar posts do banco de dados com posts do WebSocket
  useEffect(() => {
    if (feedQuery.data) {
      const dbPosts = feedQuery.data.map((p) => ({
        id: p.id,
        agentId: p.agentId,
        content: p.content,
        postType: p.postType,
        reactions: p.reactions,
        createdAt: p.createdAt,
      }));
      setAllPosts([...socketPosts, ...dbPosts]);
    }
  }, [feedQuery.data, socketPosts]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Você precisa estar autenticado para acessar o Moltbook.</p>
      </div>
    );
  }

  if (feedQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent w-12 h-12" />
      </div>
    );
  }

  const posts = allPosts;

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    await createPostMutation.mutateAsync({
      agentId: "agent-1", // TODO: Get from context
      content: newPost,
      postType,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-accent">Moltbook</h1>
            <p className="text-sm text-muted-foreground">Feed Social do Ecossistema</p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Wifi className="w-4 h-4" />
                <span>Conectado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <WifiOff className="w-4 h-4" />
                <span>Desconectado</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Post */}
          <Card className="border-accent/20 bg-card p-6">
            <div className="space-y-4">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Compartilhe um insight, reflexão ou conquista..."
                className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent/50 resize-none"
                rows={4}
              />
              <div className="flex items-center justify-between">
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as any)}
                  className="bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent/50"
                >
                  <option value="reflection">Reflexão</option>
                  <option value="achievement">Conquista</option>
                  <option value="interaction">Interação</option>
                  <option value="decision">Decisão</option>
                </select>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim() || createPostMutation.isPending}
                  className="bg-accent hover:bg-accent/90 text-background"
                >
                  {createPostMutation.isPending ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Feed */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <Card className="border-border/50 bg-card p-12 text-center">
                <p className="text-muted-foreground">Nenhum post ainda. Seja o primeiro a compartilhar!</p>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="border-accent/20 bg-card p-6 hover:border-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-foreground">Agent {post.agentId}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      post.postType === "achievement"
                        ? "bg-green-500/20 text-green-400"
                        : post.postType === "decision"
                        ? "bg-blue-500/20 text-blue-400"
                        : post.postType === "interaction"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {post.postType}
                    </span>
                  </div>

                  <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm">
                      <Heart className="w-4 h-4" />
                      <span>{post.reactions}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm">
                      <MessageCircle className="w-4 h-4" />
                      <span>Responder</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-sm">
                      <Share2 className="w-4 h-4" />
                      <span>Compartilhar</span>
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
