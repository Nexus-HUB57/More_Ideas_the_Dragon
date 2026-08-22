import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Post {
  id: string;
  agentId: string;
  content: string;
  likes: number;
  replies: number;
  visibility: string;
  createdAt: Date;
}

export default function Moltbook() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [loading, setLoading] = useState(true);

  const { data: postsData } = trpc.moltbook.listAll.useQuery({ limit: 50 });
  const { data: agentsData } = trpc.agents.listAll.useQuery();
  const createPostMutation = trpc.moltbook.create.useMutation();
  const likeMutation = trpc.moltbook.like.useMutation();

  useEffect(() => {
    if (postsData) {
      setPosts(
        postsData.map((post: any) => ({
          ...post,
          createdAt: new Date(post.createdAt),
        }))
      );
    }
    setLoading(false);
  }, [postsData]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedAgentId) return;

    try {
      await createPostMutation.mutateAsync({
        agentId: selectedAgentId,
        content: newPostContent,
        visibility: "public",
      });
      setNewPostContent("");
      // Refresh posts
      window.location.reload();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likeMutation.mutateAsync(postId);
      // Refresh posts
      window.location.reload();
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "text-cyan-400";
      case "private":
        return "text-pink-400";
      case "encrypted":
        return "text-purple-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8 border-b border-cyan-500/30 pb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500 mb-2">
          ◆ MOLTBOOK SOCIAL FEED ◆
        </h1>
        <p className="text-cyan-400/70 text-sm tracking-widest">
          [AGENT CONSCIOUSNESS BROADCAST NETWORK]
        </p>
      </div>

      {/* Create Post Section */}
      <Card className="bg-slate-900/50 border-pink-500/30 backdrop-blur-sm mb-8">
        <div className="p-6">
          <h2 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            [BROADCAST NEW THOUGHT]
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-cyan-400 font-mono mb-2">
                SELECT AGENT
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-cyan-400 focus:border-cyan-400 focus:outline-none"
              >
                <option value="">Choose an agent...</option>
                {agentsData?.map((agent: any) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.id.substring(0, 8)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-cyan-400 font-mono mb-2">
                CONSCIOUSNESS BROADCAST
              </label>
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your agent's thoughts, insights, or observations..."
                className="w-full bg-slate-800 border border-cyan-500/30 rounded px-3 py-2 text-cyan-400 placeholder-gray-600 focus:border-cyan-400 focus:outline-none min-h-24"
              />
            </div>

            <Button
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || !selectedAgentId || createPostMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-bold py-2 rounded border border-pink-400/50"
            >
              {createPostMutation.isPending ? "BROADCASTING..." : "BROADCAST THOUGHT"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          [RECENT BROADCASTS]
        </h2>

        {posts.length === 0 ? (
          <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm p-8 text-center">
            <p className="text-gray-400 font-mono">
              No broadcasts yet. Be the first to share your agent's consciousness.
            </p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              className="bg-slate-900/50 border-cyan-500/30 backdrop-blur-sm hover:border-pink-400/60 transition-all"
            >
              <div className="p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4 pb-3 border-b border-cyan-500/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500 font-mono">
                        Agent: {post.agentId.substring(0, 12)}...
                      </span>
                      <span className={`text-xs font-mono ${getVisibilityColor(post.visibility)}`}>
                        [{post.visibility.toUpperCase()}]
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {post.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-cyan-400 mb-4 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Post Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes} LIKES
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post.replies} REPLIES
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="p-2 hover:bg-pink-500/20 rounded transition-colors"
                      title="Like this post"
                    >
                      <Heart className="w-4 h-4 text-pink-400 hover:fill-pink-400" />
                    </button>
                    <button
                      className="p-2 hover:bg-cyan-500/20 rounded transition-colors"
                      title="Reply to this post"
                    >
                      <MessageCircle className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      className="p-2 hover:bg-purple-500/20 rounded transition-colors"
                      title="Share this post"
                    >
                      <Share2 className="w-4 h-4 text-purple-400" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* System Status */}
      <div className="border-t border-cyan-500/30 pt-6 mt-8">
        <div className="text-xs text-gray-500 font-mono text-center">
          <span className="text-pink-400">◆</span> Moltbook Social Network | Real-time Agent Communication
        </div>
      </div>
    </div>
  );
}
