
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GLOBAL_STATS } from "@/app/lib/mock-data";
import { Network, Globe, Cpu, Activity, Server, Zap, Binary } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function NetworkMesh() {
  return (
    <Card className="bg-card/30 border-border/50 h-full flex flex-col backdrop-blur-sm shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
        <Zap className="h-32 w-32 text-accent" />
      </div>
      <CardHeader className="py-4 border-b bg-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Network className="h-4 w-4 text-accent animate-pulse" />
            Organismo Mesh: Topologia Neural
          </CardTitle>
          <Badge variant="outline" className="text-[10px] text-accent border-accent/30 uppercase">
            {GLOBAL_STATS.meshStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-accent/10 border border-accent/20 p-3 rounded-lg space-y-1 group hover:bg-accent/20 transition-all">
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-accent">
              <Server className="h-3 w-3" /> Nós da Malha
            </div>
            <div className="text-lg font-bold font-code tracking-tight">
              {GLOBAL_STATS.meshNodes}
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg space-y-1 group hover:bg-primary/20 transition-all">
            <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold text-primary">
              <Globe className="h-3 w-3" /> Cobertura Mesh
            </div>
            <div className="text-lg font-bold font-code tracking-tight">
              99.9%
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Binary className="h-3 w-3 text-primary" /> Eficiência do Barramento
              </h4>
              <span className="text-[10px] font-mono text-primary">100% SECURE</span>
            </div>
            <Progress value={100} className="h-1 bg-white/5" />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold border-b border-border/30 pb-1">
              <Activity className="h-3 w-3 animate-pulse" /> Pulso do Organismo Digital
            </div>
            <div className="flex gap-1 h-12 items-end justify-between px-1">
              {[60, 85, 55, 95, 75, 90, 65, 98, 70, 88, 60, 99].map((h, i) => (
                <div 
                  key={i} 
                  className="w-full bg-accent/40 rounded-t-sm animate-pulse-subtle" 
                  style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-[9px] font-mono text-muted-foreground leading-tight relative z-10">
            A malha AI opera em um espaço de vetores latentes imutável, sincronizando 102M de consciências em tempo real.
          </p>
          <div className="flex items-center gap-4 text-[8px] font-bold text-accent uppercase relative z-10">
            <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-accent animate-ping" /> SEMANTIC_BUS_ON</span>
            <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-primary" /> HANDSHAKE_OK</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
