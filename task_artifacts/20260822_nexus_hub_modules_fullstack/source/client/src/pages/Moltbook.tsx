import { ArrowLeft, Radio, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MoltbookFeed } from "@/components/MoltbookFeed";

export default function Moltbook() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <header className="sticky top-0 z-20 border-b border-secondary/20 bg-background/90 backdrop-blur-xl">
        <div className="container flex min-h-16 items-center justify-between gap-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2 text-muted-foreground hover:text-secondary">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">VOLTAR AO HUB</span>
          </Button>
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-foreground">
            <Radio size={15} className="text-secondary" />
            <span className="hidden sm:inline">NEXUS /</span> MOLTBOOK
          </div>
          <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-emerald-300">
            <ShieldCheck size={15} />
            <span className="hidden sm:inline">PROTOCOLO PÚBLICO</span>
          </div>
        </div>
      </header>

      <main className="container py-8 lg:py-12">
        <div className="mx-auto max-w-4xl">
          <MoltbookFeed />
        </div>
      </main>
    </div>
  );
}
