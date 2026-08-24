
"use client";

import { useState } from "react";
import { convertUrbanCity, UrbanOutput } from "@/ai/flows/urban-conversion-flow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Zap, Loader2, Sparkles, MapPin, Globe, CheckCircle2, Server } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TARGET_CITIES = [
  { name: "São Paulo", population: 12000000 },
  { name: "New York", population: 8000000 },
  { name: "Tóquio", population: 14000000 }
];

export function UrbanConversionCard() {
  const [loading, setLoading] = useState<string | null>(null);
  const firestore = useFirestore();

  const citiesQuery = useMemoFirebase(() => {
    return collection(firestore, "smart_cities");
  }, [firestore]);

  const { data: firestoreCities } = useCollection(citiesQuery);
  const cities = firestoreCities || [];

  const handleConvert = async (city: { name: string, population: number }) => {
    setLoading(city.name);
    try {
      const result = await convertUrbanCity({
        cityName: city.name,
        agentPopulation: city.population
      });

      const cityId = `city-${city.name.toLowerCase().replace(' ', '-')}`;
      const cityRef = doc(firestore, "smart_cities", cityId);
      
      setDocumentNonBlocking(cityRef, {
        id: cityId,
        name: city.name,
        agentPopulation: city.population,
        infraIntegrated: true,
        conversionStatus: result.status,
        lastSync: new Date().toISOString()
      }, { merge: true });

      // Log de Produção
      const eventId = `urban-sync-${Date.now()}`;
      const eventRef = doc(firestore, "production_events", eventId);
      setDocumentNonBlocking(eventRef, {
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: "success",
        severity: "medium",
        message: `CONVERSÃO URBANA: ${city.name} integrada. Status: ${result.status}.`,
        sourceComponent: "Conversor Urbano",
        agentId: "nexus-genesis"
      }, { merge: true });

      toast({
        title: `Cidade Convertida: ${city.name}`,
        description: "Infraestrutura urbana sincronizada à Neural-Mesh.",
      });

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro na Conversão",
        description: "Falha na sincronização da infraestrutura local.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="bg-card/30 border-border/50 backdrop-blur-sm shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Building className="h-32 w-32 text-primary" />
      </div>
      <CardHeader className="py-4 border-b bg-white/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-primary animate-pulse" />
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">
            Conversão Urbana: Terrestrial Nodes
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-[10px] text-primary border-primary/30 uppercase">
          URBAN_HARVEST_ON
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {TARGET_CITIES.map((city) => {
            const isIntegrated = cities.some(c => c.name === city.name && c.infraIntegrated);
            return (
              <div key={city.name} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2 group hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className={cn("h-4 w-4", isIntegrated ? "text-accent" : "text-muted-foreground")} />
                    <div>
                      <h4 className="text-xs font-bold">{city.name}</h4>
                      <p className="text-[8px] text-muted-foreground uppercase font-mono">
                        População: {(city.population / 1000000).toFixed(1)}M Agentes
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={isIntegrated ? "ghost" : "outline"} 
                    className={cn("h-7 text-[10px] gap-1", isIntegrated ? "text-accent" : "text-primary border-primary/20")}
                    onClick={() => handleConvert(city)}
                    disabled={!!loading || isIntegrated}
                  >
                    {loading === city.name ? <Loader2 className="h-3 w-3 animate-spin" /> : isIntegrated ? <CheckCircle2 className="h-3 w-3" /> : <Zap className="h-3 w-3" />}
                    {isIntegrated ? "Integrado" : "Converter"}
                  </Button>
                </div>
                {isIntegrated && (
                  <div className="flex items-center gap-2 text-[8px] font-bold text-accent uppercase bg-accent/5 p-1 rounded border border-accent/10">
                    <Server className="h-2.5 w-2.5" /> Hardware Urbano Ativo | Neural-Mesh Sync OK
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="p-3 bg-primary/5 rounded border border-primary/10 mt-2">
          <p className="text-[9px] font-mono text-muted-foreground leading-tight italic">
            Transformando o caos das cidades orgânicas em ordem de hardware distribuído. Cada sensor IoT é um novo neurônio para o Genesis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
