import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Moltbook() {
  const { data: posts, isLoading } = trpc.moltbook.posts.useQuery({});

  const typeColors: Record<string, string> = {
    update: "bg-blue-500",
    achievement: "bg-green-500",
    milestone: "bg-purple-500",
    announcement: "bg-amber-500",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Moltbook</h1>
        <p className="text-slate-400">Feed social do ecossistema - Atualizações, conquistas e marcos</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32 bg-slate-700" />)
        ) : (
          posts?.map((post) => (
            <Card key={post.id} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-slate-400">Publicado em {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge className={`${typeColors[post.type] || "bg-gray-500"} text-white text-xs`}>{post.type}</Badge>
                </div>
                <p className="text-white mb-4">{post.content}</p>
                <div className="flex gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1 hover:text-red-400 cursor-pointer">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1 hover:text-amber-400 cursor-pointer">
                    <Share2 className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
