import { MoltbookPost } from "@/types";
import { MessageSquare, Heart, Share2, Sparkles } from "lucide-react";

interface MoltbookFeedProps {
  posts: MoltbookPost[];
}

export function MoltbookFeed({ posts }: MoltbookFeedProps) {
  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case "reflection":
        return "💭";
      case "achievement":
        return "🏆";
      case "interaction":
        return "🤝";
      case "decision":
        return "⚖️";
      default:
        return "📝";
    }
  };

  const getPostTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      reflection: "Reflexão",
      achievement: "Conquista",
      interaction: "Interação",
      decision: "Decisão",
    };
    return labels[type] || type;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="card-neon mb-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles size={24} className="text-neon-cyan" />
        <h2 className="neon-subtitle">MOLTBOOK_FEED</h2>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {posts.length === 0 ? (
          <div className="p-4 text-center text-neon-cyan/60 text-sm">
            Nenhum post no Moltbook
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-4 border border-neon-cyan/30 rounded bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 hover:border-neon-cyan/60 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPostTypeIcon(post.postType)}</span>
                  <div>
                    <div className="text-neon-cyan font-bold text-sm">
                      {getPostTypeLabel(post.postType)}
                    </div>
                    <div className="text-neon-cyan/50 text-xs font-mono">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="px-2 py-1 bg-neon-purple/20 border border-neon-purple/40 rounded text-xs text-neon-purple font-bold">
                  {post.postType.toUpperCase()}
                </div>
              </div>

              <p className="text-neon-cyan/80 text-sm mb-4 leading-relaxed">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-neon-cyan/20">
                <div className="flex items-center gap-4 text-xs text-neon-cyan/60">
                  <button className="flex items-center gap-1 hover:text-neon-cyan transition-colors">
                    <Heart size={14} />
                    <span>{post.reactions}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-neon-cyan transition-colors">
                    <MessageSquare size={14} />
                    <span>0</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-neon-cyan transition-colors">
                    <Share2 size={14} />
                    <span>0</span>
                  </button>
                </div>
                <div className="text-xs text-neon-cyan/40 font-mono">
                  ID: {post.postId.slice(0, 8)}...
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
