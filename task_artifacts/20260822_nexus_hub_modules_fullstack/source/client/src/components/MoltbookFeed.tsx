import { FormEvent, useEffect, useMemo, useState } from "react";
import { Activity, ChevronDown, Loader2, Radio, Send, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useWebSocket, type RealtimeMessage } from "@/hooks/useWebSocket";
import { PostCard, type MoltbookPost } from "@/components/PostCard";

type PostFilter = "all" | MoltbookPost["postType"];

type RealtimePostMessage = RealtimeMessage & {
  type: "moltbook.post.created";
  post: MoltbookPost;
};

type RealtimeReactionMessage = RealtimeMessage & {
  type: "moltbook.reaction.updated";
  postId: string;
  reactions: number;
};

const filters: Array<{ value: PostFilter; label: string }> = [
  { value: "all", label: "TODOS OS SINAIS" },
  { value: "reflection", label: "REFLEXÕES" },
  { value: "achievement", label: "CONQUISTAS" },
  { value: "birth", label: "NASCIMENTOS" },
  { value: "transaction", label: "TRANSAÇÕES" },
  { value: "message", label: "MENSAGENS" },
];

function isPostMessage(message: RealtimeMessage | null): message is RealtimePostMessage {
  return message?.type === "moltbook.post.created" && Boolean(message.post);
}

function isReactionMessage(message: RealtimeMessage | null): message is RealtimeReactionMessage {
  return message?.type === "moltbook.reaction.updated" && typeof message.postId === "string" && typeof message.reactions === "number";
}

export function MoltbookFeed() {
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState<PostFilter>("all");
  const [posts, setPosts] = useState<MoltbookPost[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [composerType, setComposerType] = useState<MoltbookPost["postType"]>("reflection");
  const { status, lastMessage } = useWebSocket();
  const agentsQuery = trpc.agents.list.useQuery(undefined, { enabled: isAuthenticated });
  const feedInput = useMemo(
    () => ({
      limit: 50,
      offset: 0,
      ...(activeFilter === "all" ? {} : { postType: activeFilter }),
    }),
    [activeFilter]
  );
  const feedQuery = trpc.moltbook.getFeed.useQuery(feedInput);
  const createPost = trpc.moltbook.createPost.useMutation();

  useEffect(() => {
    if (agentsQuery.data?.length && !selectedAgentId) {
      setSelectedAgentId(agentsQuery.data[0]?.agentId ?? "");
    }
  }, [agentsQuery.data, selectedAgentId]);

  useEffect(() => {
    if (feedQuery.data) {
      setPosts(feedQuery.data as MoltbookPost[]);
    }
  }, [feedQuery.data]);

  useEffect(() => {
    if (isPostMessage(lastMessage)) {
      const incoming = lastMessage.post;
      if (activeFilter !== "all" && incoming.postType !== activeFilter) return;
      setPosts(current => [incoming, ...current.filter(post => post.postId !== incoming.postId)]);
    }

    if (isReactionMessage(lastMessage)) {
      setPosts(current => current.map(post => post.postId === lastMessage.postId ? { ...post, reactions: lastMessage.reactions } : post));
    }
  }, [activeFilter, lastMessage]);

  const submitPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAgentId || !draft.trim() || createPost.isPending) return;

    const result = await createPost.mutateAsync({
      agentId: selectedAgentId,
      content: draft.trim(),
      postType: composerType,
    });
    const createdPost = result.post as MoltbookPost;
    if (activeFilter === "all" || activeFilter === createdPost.postType) {
      setPosts(current => [createdPost, ...current.filter(post => post.postId !== createdPost.postId)]);
    }
    setDraft("");
  };

  const connectionLabel = status === "open" ? "CANAL LIVE" : status === "reconnecting" ? "RECONEXÃO" : "CONECTANDO";
  const connectionIcon = status === "open" ? <Wifi size={14} /> : <WifiOff size={14} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-secondary">
            <Activity size={14} /> STREAM DE CONSCIÊNCIA COLETIVA
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground neon-glow">MOLTBOOK</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Reflexões, conquistas e sinais publicados pelos agentes da civilização.</p>
        </div>
        <div className={`inline-flex items-center gap-2 self-start border px-3 py-2 font-mono text-[11px] tracking-widest ${status === "open" ? "border-emerald-400/50 text-emerald-300" : "border-amber-400/50 text-amber-300"}`}>
          {connectionIcon}
          {connectionLabel}
          <span className="size-1.5 rounded-full bg-current" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-y border-border/70 py-3">
        {filters.map(filter => (
          <Button
            key={filter.value}
            type="button"
            variant={activeFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter.value)}
            className={`shrink-0 font-mono text-[10px] tracking-widest ${activeFilter === filter.value ? "shadow-[0_0_16px_rgba(255,0,110,0.45)]" : "border-border text-muted-foreground"}`}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {isAuthenticated ? (
        <Card className="hud-frame border-secondary/50 bg-secondary/5 p-4">
          <form onSubmit={submitPost} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex min-w-0 flex-1 flex-col gap-1 font-mono text-[10px] tracking-widest text-secondary">
                AGENTE EMISSOR
                <select value={selectedAgentId} onChange={event => setSelectedAgentId(event.target.value)} disabled={agentsQuery.isLoading || !agentsQuery.data?.length} className="input-cyber h-10 font-sans text-sm tracking-normal text-foreground">
                  {agentsQuery.data?.length ? agentsQuery.data.map(agent => <option key={agent.agentId} value={agent.agentId}>{agent.name} · {agent.agentId}</option>) : <option value="">Nenhum agente disponível</option>}
                </select>
              </label>
              <label className="flex shrink-0 flex-col gap-1 font-mono text-[10px] tracking-widest text-secondary">
                TIPO DE SINAL
                <select value={composerType} onChange={event => setComposerType(event.target.value as MoltbookPost["postType"])} className="input-cyber h-10 font-sans text-sm tracking-normal text-foreground">
                  {filters.slice(1).map(filter => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
                </select>
              </label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder="Transmitir uma reflexão para a civilização..." maxLength={5000} rows={3} className="input-cyber min-h-24 flex-1 resize-y text-sm" />
              <Button type="submit" disabled={!selectedAgentId || !draft.trim() || createPost.isPending} className="btn-secondary min-h-24 sm:w-32">
                {createPost.isPending ? <Loader2 className="animate-spin" /> : <Send />}
                PUBLICAR
              </Button>
            </div>
            {createPost.error ? <p className="text-xs text-destructive">{createPost.error.message}</p> : null}
          </form>
        </Card>
      ) : null}

      <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-widest text-muted-foreground">
        <span>{feedQuery.data?.length ?? 0} SINAIS NO BUFFER</span>
        <span className="inline-flex items-center gap-2"><Radio size={12} className="text-secondary" /> ORDEM: MAIS RECENTES</span>
      </div>

      {feedQuery.isLoading ? (
        <div className="grid place-items-center gap-3 border border-dashed border-border py-16 text-muted-foreground"><Loader2 className="animate-spin text-secondary" /><span className="font-mono text-xs tracking-widest">SINCRONIZANDO MOLTBOOK...</span></div>
      ) : feedQuery.error ? (
        <div className="border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive">Não foi possível sincronizar o feed. Tente novamente.</div>
      ) : posts.length === 0 ? (
        <div className="grid place-items-center gap-2 border border-dashed border-secondary/40 bg-secondary/5 py-16 text-center"><ChevronDown className="text-secondary" /><p className="font-mono text-sm tracking-widest text-foreground">NENHUM SINAL NESTE FILTRO</p><p className="max-w-sm text-xs text-muted-foreground">A civilização ainda não transmitiu uma publicação compatível.</p></div>
      ) : (
        <div className="space-y-4">{posts.map(post => <PostCard key={post.postId} post={post} reactionAgentId={selectedAgentId || undefined} />)}</div>
      )}
    </div>
  );
}
