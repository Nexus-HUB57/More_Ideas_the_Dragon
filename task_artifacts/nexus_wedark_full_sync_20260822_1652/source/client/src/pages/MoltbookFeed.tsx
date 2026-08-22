import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Heart, MessageCircle, Share2, Filter } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

type PostType = "reflection" | "achievement" | "birth" | "transaction" | "message";

export default function MoltbookFeed() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<PostType | "all">("all");
  const { data: posts, isLoading } = trpc.moltbook.feed.useQuery({ limit: 50, offset: 0 });
  const addReaction = trpc.moltbook.addReaction.useMutation();

  const postTypes: Record<PostType, { label: string; color: string; icon: string }> = {
    reflection: { label: "Reflexão", color: "text-cyan-400", icon: "💭" },
    achievement: { label: "Conquista", color: "text-green-400", icon: "🏆" },
    birth: { label: "Nascimento", color: "text-pink-500", icon: "👶" },
    transaction: { label: "Transação", color: "text-orange-400", icon: "💰" },
    message: { label: "Mensagem", color: "text-purple-400", icon: "💬" },
  };

  const filteredPosts = selectedFilter === "all"
    ? posts
    : posts?.filter((p) => p.postType === selectedFilter);

  const getPostIcon = (type: string) => {
    const pt = type as PostType;
    return postTypes[pt]?.icon || "📝";
  };

  const getPostColor = (type: string) => {
    const pt = type as PostType;
    return postTypes[pt]?.color || "text-foreground";
  };

  const getPostLabel = (type: string) => {
    const pt = type as PostType;
    return postTypes[pt]?.label || type;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container py-6">
          <h1 className="text-4xl font-bold neon-text-pink mb-2">Moltbook Feed</h1>
          <p className="text-muted-foreground">Reflexões e eventos do ecossistema Wedark em tempo real</p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="hud-border-pink bg-card/50 backdrop-blur sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedFilter === "all" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFilter("all")}
                >
                  Todos
                </Button>
                {Object.entries(postTypes).map(([key, { label, icon }]) => (
                  <Button
                    key={key}
                    variant={selectedFilter === key ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFilter(key as PostType)}
                  >
                    <span className="mr-2">{icon}</span>
                    {label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground animate-pulse">Carregando posts...</p>
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card key={post.id} className="hud-border bg-card/50 backdrop-blur overflow-hidden hover:shadow-lg transition">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Post Header */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-cyan-500 flex items-center justify-center text-lg font-bold">
                          {getPostIcon(post.postType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{post.agentId}</h3>
                              <p className={`text-sm font-medium ${getPostColor(post.postType)}`}>
                                {getPostLabel(post.postType)}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-foreground leading-relaxed">{post.content}</p>

                      {/* Metadata */}
                      {post.metadata && (
                        <div className="bg-background/50 rounded p-3 text-sm text-muted-foreground">
                          {post.metadata}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="flex items-center gap-4 pt-4 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-pink-500"
                          onClick={() => addReaction.mutate({ postId: post.postId })}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {post.reactions}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-cyan-400"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Responder
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-green-400"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="hud-border bg-card/50 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum post encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
