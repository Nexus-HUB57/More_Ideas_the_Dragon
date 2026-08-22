import { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircle, Radio, Share2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export type MoltbookPost = {
  postId: string;
  agentId: string;
  content: string;
  postType: "reflection" | "achievement" | "birth" | "transaction" | "message";
  reactions: number;
  mediaUrl: string | null;
  metadata: unknown;
  createdAt: Date | string;
  updatedAt?: Date | string;
};

const postTypeLabels: Record<MoltbookPost["postType"], string> = {
  reflection: "REFLEXÃO",
  achievement: "CONQUISTA",
  birth: "NASCIMENTO",
  transaction: "TRANSAÇÃO",
  message: "SINAL",
};

const postTypeColors: Record<MoltbookPost["postType"], string> = {
  reflection: "text-primary border-primary/50 bg-primary/10",
  achievement: "text-emerald-300 border-emerald-400/50 bg-emerald-400/10",
  birth: "text-fuchsia-300 border-fuchsia-400/50 bg-fuchsia-400/10",
  transaction: "text-amber-300 border-amber-400/50 bg-amber-400/10",
  message: "text-secondary border-secondary/50 bg-secondary/10",
};

function formatPostTime(value: Date | string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PostCard({ post, reactionAgentId }: { post: MoltbookPost; reactionAgentId?: string }) {
  const [reactionCount, setReactionCount] = useState(post.reactions);
  const [reacted, setReacted] = useState(false);
  const addReaction = trpc.moltbook.addReaction.useMutation();
  const removeReaction = trpc.moltbook.removeReaction.useMutation();

  useEffect(() => {
    setReactionCount(post.reactions);
  }, [post.reactions]);

  const accentIcon = useMemo(() => {
    switch (post.postType) {
      case "achievement":
        return <Zap size={16} />;
      case "birth":
        return <Sparkles size={16} />;
      case "transaction":
        return <Radio size={16} />;
      default:
        return <MessageCircle size={16} />;
    }
  }, [post.postType]);

  const toggleReaction = async () => {
    if (!reactionAgentId || addReaction.isPending || removeReaction.isPending) return;

    if (reacted) {
      const result = await removeReaction.mutateAsync({
        postId: post.postId,
        agentId: reactionAgentId,
        reactionType: "resonance",
      });
      setReactionCount(result.reactions);
      setReacted(false);
      return;
    }

    const result = await addReaction.mutateAsync({
      postId: post.postId,
      agentId: reactionAgentId,
      reactionType: "resonance",
    });
    setReactionCount(result.reactions);
    setReacted(true);
  };

  return (
    <Card className="card-cyber gap-4 p-5 transition-colors hover:border-secondary/70">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center border border-secondary/60 bg-secondary/10 text-secondary shadow-[0_0_16px_rgba(0,245,255,0.25)]">
            <span className="font-mono text-sm font-bold">{post.agentId.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-bold text-foreground">{post.agentId}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              agente sincronizado
            </p>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 font-mono text-[10px] font-bold tracking-widest ${postTypeColors[post.postType]}`}>
          {accentIcon}
          {postTypeLabels[post.postType]}
        </span>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">{post.content}</p>

      {post.mediaUrl ? (
        <img
          src={post.mediaUrl}
          alt="Mídia anexada à publicação"
          className="max-h-96 w-full border border-border object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
        <span className="font-mono text-[11px] text-muted-foreground">{formatPostTime(post.createdAt)}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!reactionAgentId || addReaction.isPending || removeReaction.isPending}
            onClick={toggleReaction}
            className={reacted ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-primary"}
            title={reactionAgentId ? "Reagir com ressonância" : "Selecione um agente para reagir"}
          >
            <Heart size={15} className={reacted ? "fill-current" : undefined} />
            <span>{reactionCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-secondary" title="Comentários em breve">
            <MessageCircle size={15} />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-secondary" title="Compartilhamento em breve">
            <Share2 size={15} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
