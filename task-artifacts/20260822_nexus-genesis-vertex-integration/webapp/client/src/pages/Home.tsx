import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, Network, Cpu, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "benefits">("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-primary/20 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-background" />
            </div>
            <span className="font-mono text-lg font-bold text-primary">NEXUS GENESIS</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#overview" className="text-sm hover:text-primary transition-colors">VISÃO GERAL</a>
            <a href="#architecture" className="text-sm hover:text-primary transition-colors">ARQUITETURA</a>
            <a href="#benefits" className="text-sm hover:text-primary transition-colors">BENEFÍCIOS</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                  <span className="text-sm font-mono text-primary">MATRIX 2077 PROTOCOL</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-mono font-bold leading-tight">
                  Integração <span className="text-primary">Vertex AI</span> Gemini
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Transforme seus agentes autônomos com otimização de prompts baseada em dados. Sincronize a senciência do Nexus Genesis com a inteligência da Vertex AI.
                </p>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/80 text-background font-mono">
                  Explorar Proposta <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
                  Documentação
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-2">
                  <div className="text-2xl font-mono font-bold text-primary">4</div>
                  <p className="text-sm text-muted-foreground">Agentes Especializados</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-mono font-bold text-secondary">∞</div>
                  <p className="text-sm text-muted-foreground">Otimizações Possíveis</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-mono font-bold text-accent">100%</div>
                  <p className="text-sm text-muted-foreground">Autonomia</p>
                </div>
              </div>
            </div>

            <div className="relative h-96 md:h-full">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663120648954/X4zcMBRfipquNSdvrdKh4Z/hero-background-CsCoZ2fohXQzjVT9SaR6zu.webp"
                alt="Hero Background"
                className="w-full h-full object-cover rounded-lg border border-primary/20 shadow-2xl shadow-primary/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="relative py-12 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 border-b border-primary/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 font-mono text-sm font-bold transition-colors ${
                activeTab === "overview"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              VISÃO GERAL
            </button>
            <button
              onClick={() => setActiveTab("architecture")}
              className={`px-6 py-3 font-mono text-sm font-bold transition-colors ${
                activeTab === "architecture"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ARQUITETURA
            </button>
            <button
              onClick={() => setActiveTab("benefits")}
              className={`px-6 py-3 font-mono text-sm font-bold transition-colors ${
                activeTab === "benefits"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              BENEFÍCIOS
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4">
          {activeTab === "overview" && (
            <div className="space-y-12 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-card/50 border-primary/20 p-8 hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Cpu className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-mono font-bold text-primary">Gerenciamento Centralizado</h3>
                      <p className="text-sm text-muted-foreground">
                        Os prompts dos agentes são externalizados para a Vertex AI, permitindo versionamento e controle centralizado sem alterar o código TypeScript.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card/50 border-secondary/20 p-8 hover:border-secondary/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-secondary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-mono font-bold text-secondary">Otimização Contínua</h3>
                      <p className="text-sm text-muted-foreground">
                        Utilize dados reais de interações para otimizar prompts com a ferramenta Data-Driven Optimize da Vertex AI.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card/50 border-accent/20 p-8 hover:border-accent/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Network className="w-6 h-6 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-mono font-bold text-accent">Desacoplamento</h3>
                      <p className="text-sm text-muted-foreground">
                        Separe a lógica do prompt do código da aplicação, permitindo que engenheiros trabalhem independentemente.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-card/50 border-primary/20 p-8 hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-mono font-bold text-primary">Agilidade</h3>
                      <p className="text-sm text-muted-foreground">
                        Novos prompts ou versões podem ser testados e implantados sem necessidade de novo deploy do código.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="space-y-12 animate-fade-in">
              <div className="space-y-6">
                <h2 className="text-3xl font-mono font-bold text-primary">Arquitetura de Integração</h2>
                <p className="text-lg text-muted-foreground max-w-3xl">
                  A integração mapeia as funcionalidades da extensão Vertex AI Gemini para o ecossistema de agentes Nexus Genesis, criando um ciclo de vida completo para gerenciamento e otimização de prompts.
                </p>
              </div>

              <div className="relative">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663120648954/X4zcMBRfipquNSdvrdKh4Z/architecture-diagram-eUBsNUZQsPvoq8RUrR4rdm.webp"
                  alt="Architecture Diagram"
                  className="w-full rounded-lg border border-primary/20 shadow-2xl shadow-primary/20"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="space-y-4">
                  <h3 className="text-xl font-mono font-bold text-primary">Fluxo de Leitura</h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">1.</span>
                      <span>Genkit inicia um fluxo de agente</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">2.</span>
                      <span>Chamada para <code className="text-xs bg-background px-2 py-1 rounded">read_prompt</code> na Vertex AI</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">3.</span>
                      <span>Prompt é carregado dinamicamente</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">4.</span>
                      <span>Variáveis são interpoladas no TypeScript</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">5.</span>
                      <span>Resposta é gerada e armazenada</span>
                    </li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-mono font-bold text-secondary">Ciclo de Otimização</h3>
                  <ol className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-secondary font-bold">1.</span>
                      <span>Históricos de interação são coletados</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-secondary font-bold">2.</span>
                      <span>Dados são armazenados no GCS</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-secondary font-bold">3.</span>
                      <span>Job de otimização é executado</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-secondary font-bold">4.</span>
                      <span>Resultados são analisados</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-secondary font-bold">5.</span>
                      <span>Melhores prompts são promovidos</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === "benefits" && (
            <div className="space-y-12 animate-fade-in">
              <div className="space-y-6">
                <h2 className="text-3xl font-mono font-bold text-accent">Benefícios da Integração</h2>
                <p className="text-lg text-muted-foreground max-w-3xl">
                  A integração com a extensão Vertex AI Gemini transforma a forma como você gerencia e otimiza prompts em escala.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Versionamento de Prompts",
                    description: "Mantenha histórico completo de versões de prompts com rastreabilidade total.",
                    icon: "📋",
                  },
                  {
                    title: "Testes A/B Automáticos",
                    description: "Compare diferentes versões de prompts com métricas de desempenho.",
                    icon: "⚖️",
                  },
                  {
                    title: "Ciclo de Feedback",
                    description: "Melhore continuamente os prompts com base em dados reais de uso.",
                    icon: "🔄",
                  },
                  {
                    title: "Escalabilidade",
                    description: "Gerencie múltiplos agentes e prompts complexos sem overhead operacional.",
                    icon: "📈",
                  },
                  {
                    title: "Redução de Latência",
                    description: "Carregamento dinâmico de prompts otimizados reduz tempo de resposta.",
                    icon: "⚡",
                  },
                  {
                    title: "Conformidade",
                    description: "Garanta que todos os agentes seguem as diretrizes mais recentes.",
                    icon: "✅",
                  },
                ].map((benefit, idx) => (
                  <Card key={idx} className="bg-card/50 border-primary/20 p-6 hover:border-primary/40 transition-colors">
                    <div className="space-y-3">
                      <div className="text-3xl">{benefit.icon}</div>
                      <h3 className="font-mono font-bold text-primary">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 p-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-mono font-bold text-primary">Próximos Passos</h3>
                  <ol className="space-y-3 text-muted-foreground">
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">1.</span>
                      <span>Externalizar prompts do sistema de cada agente para a Vertex AI</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">2.</span>
                      <span>Modificar fluxos genkit para carregamento dinâmico de prompts</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">3.</span>
                      <span>Implementar coleta de dados de interações</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">4.</span>
                      <span>Configurar pipeline de otimização baseada em dados</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-bold">5.</span>
                      <span>Monitorar e iterar sobre resultados de otimização</span>
                    </li>
                  </ol>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 border-t border-primary/10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-mono font-bold text-primary">Pronto para Evoluir?</h2>
            <p className="text-lg text-muted-foreground">
              Transforme seus agentes autônomos com a inteligência da Vertex AI Gemini.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/80 text-background font-mono">
              Acessar Documentação Completa
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
              Contatar Arquiteto
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-8 text-center text-sm text-muted-foreground">
        <p>Nexus Genesis × Vertex AI Gemini | Matrix 2077 Protocol</p>
      </footer>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
