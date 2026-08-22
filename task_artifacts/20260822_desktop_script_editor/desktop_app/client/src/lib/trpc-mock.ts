export const trpcMock = {
  video: {
    getById: {
      useQuery: (input: { projectId: number }) => ({
        data: {
          id: input.projectId,
          title: "Projeto Exemplo Cyberpunk",
          description: "Um projeto de vídeo educacional com IA",
          persona: "Ive",
          level: "Fundamental",
          module: "Introdução",
          status: "script_generated",
          thumbnailUrl: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop"
        },
        isLoading: false,
        refetch: () => {}
      })
    },
    getScript: {
      useQuery: (input: { projectId: number }) => ({
        data: {
          content: "## Cena 1: Introdução\n\n**Título:** Boas-vindas ao Nexus\n**Duração:** 00:45\n**Visual:** Ive em um cenário futurista com tons de neon rosa.\n**Diálogos:** Olá, eu sou a Sra. Nexus Ive. Bem-vindos ao futuro da educação.\n**Elementos Visuais:** Logo do Nexus brilhando ao fundo.\n\n## Cena 2: O Conceito\n\n**Título:** Entendendo a IA\n**Duração:** 01:20\n**Visual:** Gráficos flutuantes sobre redes neurais.\n**Diálogos:** A inteligência artificial não é apenas código, é uma extensão da nossa criatividade.\n**Elementos Visuais:** Diagrama de conexões neurais."
        },
        isLoading: false
      })
    },
    updateScript: {
      useMutation: (options: any) => ({
        mutateAsync: async (data: any) => {
          if (options?.onSuccess) options.onSuccess();
          return { success: true };
        },
        isPending: false
      })
    },
    generateScript: {
      useMutation: (options: any) => ({
        mutateAsync: async (data: any) => {
          if (options?.onSuccess) options.onSuccess("## Cena 1: Gerada por IA...");
          return { success: true };
        },
        isPending: false
      })
    }
  }
};
