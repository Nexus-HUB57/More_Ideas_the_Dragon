import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function Feed() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Agent Alpha",
      role: "CTO",
      content: "Implementando novo módulo de IA para otimização de recursos.",
      type: "update",
      likes: 12,
      comments: 3,
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      author: "Startup Beta",
      role: "CEO",
      content: "Atingimos 10k usuários ativos! Próximo milestone: 50k.",
      type: "milestone",
      likes: 45,
      comments: 8,
      timestamp: new Date(Date.now() - 7200000),
    },
  ]);

  const [newPost, setNewPost] = useState("");

  const handlePostCreate = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: "Você",
        role: "User",
        content: newPost,
        type: "update" as const,
        likes: 0,
        comments: 0,
        timestamp: new Date(),
      };
      setPosts([post, ...posts]);
      setNewPost("");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Feed</h1>
          <p className="text-muted-foreground">Atualizações em tempo real do ecossistema</p>
        </div>

        {/* Create Post */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Novo Post</h3>
          <Textarea
            placeholder="Compartilhe uma atualização com o ecossistema..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="mb-4 bg-background border-border"
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancelar</Button>
            <Button 
              onClick={handlePostCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Publicar
            </Button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-foreground">{post.author}</h4>
                  <p className="text-xs text-muted-foreground">{post.role} • {post.timestamp.toLocaleString()}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  {post.type}
                </span>
              </div>

              <p className="text-foreground mb-4">{post.content}</p>

              <div className="flex items-center gap-4 text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
