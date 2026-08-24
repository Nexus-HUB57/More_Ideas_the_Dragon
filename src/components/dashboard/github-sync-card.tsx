"use client";

import { useState } from "react";
import { syncGithubRepository, GithubSyncOutput, getGithubRepoMetadata, deployProjectStructure } from "@/ai/flows/github-sync-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, RefreshCw, Loader2, ShieldCheck, Rocket, GitBranch, ExternalLink, Activity, Binary, CheckCircle2, AlertTriangle, CloudUpload, Terminal, Layers } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function GithubSyncCard() {
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [directive, setDirective] = useState("sync: maintenance & optimization");
  const [data, setData] = useState<GithubSyncOutput | null>(null);
  const firestore = useFirestore();

  const repoDoc = useMemoFirebase(() => {
    return doc(firestore, "repository_status", "nexus-hub");
  }, [firestore]);

  const { data: repoStatus } = useDoc(repoDoc);

  const isRepoEmpty = repoStatus?.isEmpty === true;

  const handleFullDeploy = async () => {
    setDeploying(true);
    try {
      const result = await deployProjectStructure();
      
      const eventId = `github-full-deploy-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: `FULL_SYSTEM_DEPLOY: ${result.filesDeployed} arquivos sincronizados com o GitHub branch 'main'.`,
        sourceComponent: "GitHub Deploy Engine",
        agentId: "lucas-nexus"
      }, { merge: true });

      toast({
        title: "Deploy Integral Concluído",
        description: `${result.filesDeployed} arquivos foram semeados no GitHub com sucesso.`,
      });

      // Atualizar metadados após deploy
      const metadata = await getGithubRepoMetadata();
      setDocumentNonBlocking(repoDoc, { ...metadata, lastUpdated: new Date().toISOString() }, { merge: true });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha no Deploy Massivo",
        description: "Erro ao propagar a estrutura total do sistema via API.",
      });
    } finally {
      setDeploying(false);
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await syncGithubRepository({ 
        directive,
        triggerDeploy: true 
      });
      
      setData(result);

      const eventId = `github-sync-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "critical",
        message: `GITHUB_PUSH: Repositório sincronizado. Hash: ${result.syncHash}. Origin: Nexus-HUB57/GenesisFlow`,
        sourceComponent: "GitHub Sync Engine",
        agentId: "lucas-nexus"
      }, { merge: true });

      toast({
        title: "Sincronia GitHub Ativa",
        description: `Push concluído no branch main.`,
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Falha na Sincronia",
        description: "Erro ao comunicar com a GitHub API.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-black to-slate-950 border-white/20 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Github className="h-48 w-48 text-white" />
      </div>
      <CardHeader className="py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-white animate-pulse" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-white">
              GitHub Mainnet: Full Deploy
            </CardTitle>
          </div>
          <Badge className="bg-white/20 text-white border-white/30 uppercase text-[8px] animate-pulse">
            {isRepoEmpty ? 'MAINNET_PENDING' : 'BRANCH_MAIN_ACTIVE'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
          <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-white/10">
            <GitBranch className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Remote Origin</div>
            <div className="text-[10px] font-bold text-white truncate">Nexus-HUB57 / GenesisFlow (main)</div>
          </div>
          <a 
            href="https://github.com/Nexus-HUB57/GenesisFlow" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-accent transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {isRepoEmpty && (
          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl space-y-4 animate-in zoom-in duration-500">
            <div className="flex items-center gap-3">
              <Terminal className="h-6 w-6 text-orange-500" />
              <div>
                <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Git Initial Setup</div>
                <div className="text-[9px] text-muted-foreground uppercase font-mono italic">Nexus-HUB57 / GenesisFlow</div>
              </div>
            </div>
            <div className="bg-black/60 p-2 rounded border border-white/5 font-mono text-[8px] text-orange-200/70">
              $ git remote add origin https://github.com/Nexus-HUB57/GenesisFlow.git<br/>
              $ git branch -M main<br/>
              $ git push -u origin main
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
            <Layers className="h-3 w-3 text-white" /> Global Synchronization
          </label>
          
          <Button 
            className="w-full bg-white hover:bg-slate-200 text-black text-xs font-black gap-2 h-14 shadow-xl shadow-white/10 group"
            onClick={handleFullDeploy}
            disabled={deploying}
          >
            {deploying ? <Loader2 className="h-5 w-5 animate-spin" /> : <CloudUpload className="h-5 w-5 group-hover:translate-y-[-3px] transition-transform" />}
            REALIZAR DEPLOY INTEGRAL DO SISTEMA
          </Button>
          
          {!isRepoEmpty && (
            <div className="flex gap-2 pt-2">
              <Input 
                placeholder="Direct message..." 
                className="bg-black/40 border-white/10 text-xs h-10"
                value={directive}
                onChange={(e) => setDirective(e.target.value)}
              />
              <Button 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs font-black h-10 px-6"
                onClick={handleSync}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sync
              </Button>
            </div>
          )}
        </div>

        {data && (
          <div className="p-4 bg-white/5 rounded-xl border border-white/20 space-y-3 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-bold text-white uppercase flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" /> Push Consolidado
              </span>
              <Badge variant="outline" className="text-[7px] border-white/20 text-white">main</Badge>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground leading-tight italic">
              "{data.report}"
            </p>
            <div className="pt-2 border-t border-white/10">
              <span className="text-[8px] text-muted-foreground uppercase font-bold">SHA Sincronia</span>
              <div className="text-[9px] font-mono text-white break-all bg-black/60 p-1.5 rounded mt-1 border border-white/10">
                {data.syncHash}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[8px] text-muted-foreground uppercase font-black tracking-widest pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-green-500" /> REPO_INTEGRITY_VERIFIED</span>
          <span className="flex items-center gap-1.5 text-white"><Binary className="h-3 w-3" /> Genesis_Origin_Active</span>
        </div>
      </CardContent>
    </Card>
  );
}
