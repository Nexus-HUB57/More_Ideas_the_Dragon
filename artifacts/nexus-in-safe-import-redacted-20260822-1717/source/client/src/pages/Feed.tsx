import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const { data: postsData, isLoading } = trpc.moltbook.getPosts.useQuery({
    limit,
    offset,
  });

  const createPostMutation = trpc.moltbook.createPost.useMutation();
  const likePostMutation = trpc.moltbook.likePost.useMutation();

  const handleLoadMore = () => {
    setOffset(offset + limit);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Moltbook Feed</h1>
        <Button onClick={() => {}} className="bg-primary text-primary-foreground">
          Novo Post
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : postsData && postsData.length > 0 ? (
          <>
            {postsData.map((post) => (
              <Card key={post.id} className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Startup #{post.startupId}
                    </p>
                    <p className="text-foreground mt-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
            <div className="flex justify-center pt-4">
              <Button onClick={handleLoadMore} variant="outline">
                Carregar Mais
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum post no feed ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
