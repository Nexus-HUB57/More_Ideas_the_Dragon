
"use client";

import { useState } from "react";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { GITHUB_PRODUCTION } from "@/app/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, GitBranch, GitCommit, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, User, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGithubRepoMetadata } from "@/ai/flows/github-sync-flow";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RepoMonitor() {
  const [refreshing, setRefreshing] = useState(false);
  const firestore = useFirestore();
  
  const repoDoc = useMemoFirebase(() => {
    return doc(firestore, "repository_status", "nexus-hub");
  }, [firestore]);

  const { data: repoStatus, isLoading } = useDoc(repoDoc);

  const stats = repoStatus || {
    repositoryName: GITHUB_PRODUCTION.repo,
    buildStatus: GITHUB_PRODUCTION.buildStatus,
    branches: GITHUB_PRODUCTION.branches,
    openIssues: GITHUB_PRODUCTION.openIssues,
    latestCommitMessage: GITHUB_PRODUCTION.latestCommit.message,
    latestCommitHash: GITHUB_PRODUCTION.latestCommit.hash,
    commitTimestamp: new Date().toISOString(),
    author: GITHUB_PRODUCTION.latestCommit.author,
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const metadata = await getGithubRepoMetadata();
      
      const statusRef = doc(firestore, "repository_status", "nexus-hub");
      setDocumentNonBlocking(statusRef, {
        ...metadata,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Log de Produção
      const eventId = `repo-refresh-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "info",
        severity: "low",
        message: `GITHUB_ACCESS: Repositório ${metadata.repositoryName} acessado. Último commit: ${metadata.latestCommitHash.substring(0, 7)}`,
        sourceComponent: "GitHub Monitor",
        agentId: "lucas-nexus"
      }, { merge: true });

      toast({
        title: "Repositório Sincronizado",
        description: "Dados reais obtidos via GitHub API.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro de Acesso",
        description: "Não foi possível conectar à GitHub API.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card className="bg-card/30 border-border/50 h-full flex flex-col shadow-xl">
      <CardHeader className="py-4 border-b flex flex-row items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-foreground animate-pulse" />
          <CardTitle className="text-sm font-semibold">
            GitHub Health Monitor
          </CardTitle>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 hover:bg-white/10" 
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
        >
          {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-6">
        {isLoading && !repoStatus ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary font-code truncate max-w-[150px]">
                  {stats.repositoryName}
                </span>
                <Badge variant="outline" className="text-[10px] h-5 border-accent text-accent uppercase font-bold tracking-tighter">
                  {stats.buildStatus === 'passing' ? 'Mainnet Ready' : stats.buildStatus}
                </Badge>
              </div>
              <a 
                href={`https://github.com/${stats.repositoryName}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                  <GitBranch className="h-3 w-3 text-primary" /> Branches
                </div>
                <div className="text-xl font-bold font-code">{stats.branches}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 group hover:border-destructive/20 transition-all">
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase font-black tracking-widest">
                  <AlertCircle className="h-3 w-3 text-destructive" /> Issues
                </div>
                <div className="text-xl font-bold font-code">{stats.openIssues}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  <GitCommit className="h-3 w-3" /> Latest Commit
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-mono">
                  #{stats.latestCommitHash?.substring(0, 7)}
                </Badge>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex flex-col gap-3 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5">
                  <GitCommit className="h-12 w-12 text-primary" />
                </div>
                <p className="text-xs font-medium leading-tight line-clamp-2 italic text-foreground/90">
                  "{stats.latestCommitMessage}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold uppercase">
                    <User className="h-2.5 w-2.5 text-accent" /> {stats.author || "Nexus-HUB"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {stats.commitTimestamp ? formatDistanceToNow(new Date(stats.commitTimestamp), { addSuffix: true, locale: ptBR }) : "Recent"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
