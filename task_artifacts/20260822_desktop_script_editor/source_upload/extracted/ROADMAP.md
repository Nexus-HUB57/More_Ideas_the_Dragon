# Roadmap do Projeto Nexus Video Generator - MMN_AI-to-AI

## 1. Introdução

Este documento apresenta o roadmap detalhado para o desenvolvimento do projeto **Nexus Video Generator**, que está em transição para a arquitetura **MMN_AI-to-AI**. O objetivo principal é guiar as próximas etapas, com foco especial na Fase 2: Desenvolvimento do Frontend para visualização e edição de roteiros, garantindo a integração com os serviços de backend existentes e otimizando a eficiência no uso de tokens, especialmente em interações com Large Language Models (LLMs).

## 2. Status Atual do Projeto

Com base nas `IMPLEMENTATION_NOTES.md` [1] e `README.md` [2], as seguintes fases foram concluídas ou estão com a estrutura pronta:

| Fase | Descrição | Status |
|---|---|---|
| Geração de Roteiro via LLM | Implementação das mutations tRPC para `generateScript`, `updateScript` e `getScript`. | ✅ COMPLETA |
| Visualizador de Roteiro | Estrutura inicial para visualização de roteiros. | ✅ ESTRUTURA PRONTA |
| Sincronização com AcademIA | Serviço para escanear diretórios e criar projetos/scripts no banco de dados. | ✅ IMPLEMENTADA |

O projeto utiliza uma arquitetura moderna com React 19 no frontend, Express + tRPC no backend, Drizzle ORM e MySQL/TiDB para banco de dados, e integrações com Manus OAuth, Manus LLM API e Manus Image Generation [2].

## 3. Visão Geral do Roadmap

O roadmap a seguir detalha as próximas fases de desenvolvimento, com ênfase na construção de uma interface de usuário robusta e eficiente, e na expansão das capacidades do sistema.

| Fase | Título | Objetivo Principal |
|---|---|---|
| 1 | Análise de Escopo | Mapear requisitos e funcionalidades existentes. | 
| 2 | Desenvolvimento do Frontend (Visualização e Edição de Roteiros) | Implementar a interface completa para gerenciar roteiros. |
| 3 | Geração de Imagens | Desenvolver a funcionalidade de geração de thumbnails. |
| 4 | Produção de Vídeos | Implementar a geração completa de vídeos a partir dos roteiros. |
| 5 | Módulo White-Label e Escalabilidade | Preparar a plataforma para customização e expansão. |
| 6 | Entrega e Documentação | Finalizar a entrega do projeto e documentação técnica. |

## 4. Fases Detalhadas

### Fase 2: Desenvolvimento do Frontend (Visualização e Edição de Roteiros)

**Objetivo**: Criar uma interface de usuário intuitiva e responsiva para visualizar, editar e gerenciar roteiros de vídeo, integrando-a perfeitamente com os serviços de backend já configurados.

**Considerações de Eficiência de Tokens**: Para otimizar o uso de tokens, especialmente na edição, o frontend deve carregar apenas o conteúdo do roteiro necessário para a visualização inicial. A edição deve ser feita em um formato que minimize a necessidade de reprocessamento completo do LLM, focando em atualizações incrementais ou validação de sintaxe local antes de enviar para o backend.

**Tarefas Detalhadas**:

1.  **Configuração do Ambiente Frontend**: 
    *   Garantir que o ambiente de desenvolvimento React 19 com Tailwind CSS 4 esteja configurado e funcionando. 
    *   Verificar as dependências (`pnpm install`) e scripts de desenvolvimento (`pnpm dev`).
2.  **Refatoração e Melhoria do `Project.tsx`**: 
    *   Revisar o componente `Project.tsx` para garantir que ele exiba corretamente o status do projeto, persona, nível e módulo. 
    *   Aprimorar a exibição do `thumbnailUrl` quando disponível.
3.  **Implementação Completa do `ScriptEditor.tsx`**: 
    *   **Visualização de Roteiro**: Aprimorar a renderização do roteiro em modo de visualização (`viewMode: 
preview`) com a estrutura de cenas já implementada, garantindo que todos os campos (`visual`, `dialogs`, `elements`) sejam exibidos de forma clara e formatada.
    *   **Edição de Roteiro Inline**: Expandir a funcionalidade de edição para permitir a modificação de cenas individuais ou do roteiro completo em formato Markdown. A função `parseScenes` e `calculateTotalDuration` já existem e devem ser utilizadas para aprimorar a experiência de edição.
    *   **Validação Local**: Implementar validação de sintaxe Markdown e estrutura de cenas no lado do cliente para fornecer feedback instantâneo ao usuário e reduzir chamadas desnecessárias ao backend.
    *   **Salvamento Automático/Manual**: Manter a funcionalidade de salvamento manual (`handleSaveScript`) e considerar a implementação de um salvamento automático com debounce para otimizar o uso de recursos.
    *   **Preview Dinâmico**: Assegurar que a alternância entre `editor` e `preview` nas `Tabs` funcione corretamente, refletindo as alterações em tempo real.
4.  **Integração com Backend (tRPC)**: 
    *   Utilizar as mutations `video.updateScript` e `video.getScript` do tRPC para carregar e salvar os roteiros de forma eficiente.
    *   Garantir o tratamento adequado de estados de carregamento (`isSaving`) e erros (`onError`) com feedback visual ao usuário (e.g., `toast` da `sonner`).
5.  **Componente `ScriptGenerator.tsx`**: 
    *   Verificar a integração do `ScriptGenerator` para a geração inicial de roteiros, garantindo que os parâmetros `projectId`, `persona`, `level` e `module` sejam passados corretamente.
    *   Assegurar que o `onScriptGenerated` atualize o estado do `ScriptEditor` e do `Project` adequadamente.
6.  **Estilização e UX**: 
    *   Manter a estética cyberpunk com cores neon e elementos HUD, conforme descrito no `README.md` [2].
    *   Garantir uma experiência de usuário fluida e responsiva em diferentes tamanhos de tela.

### Fase 3: Geração de Imagens

**Objetivo**: Implementar a funcionalidade de geração de thumbnails personalizadas para cada projeto de vídeo.

**Tarefas Detalhadas**:

1.  **Desenvolvimento da Mutation `generateThumbnail`**: 
    *   Criar a mutation tRPC no backend que interaja com a Manus Image Generation API.
    *   A mutation deve receber o `projectId` e outros parâmetros relevantes (tema do módulo, persona) para gerar a imagem.
2.  **Integração Frontend**: 
    *   Adicionar um botão ou gatilho na interface do `Project.tsx` para iniciar a geração da thumbnail.
    *   Exibir um indicador de carregamento durante a geração e a thumbnail gerada após a conclusão.
3.  **Armazenamento em S3**: 
    *   Garantir que as imagens geradas sejam armazenadas no AWS S3 e que o `thumbnailUrl` seja atualizado no banco de dados.

### Fase 4: Produção de Vídeos

**Objetivo**: Desenvolver a capacidade de gerar vídeos completos a partir dos roteiros e thumbnails.

**Tarefas Detalhadas**:

1.  **Integração com Serviço de Síntese de Voz**: 
    *   Integrar com uma API de síntese de voz para converter os diálogos do roteiro em áudio.
2.  **Geração de Vídeos**: 
    *   Implementar um serviço que combine o áudio, elementos visuais (slides, gráficos) e transições para criar o vídeo final.
3.  **Exportação**: 
    *   Permitir a exportação dos vídeos em múltiplos formatos.

### Fase 5: Módulo White-Label e Escalabilidade

**Objetivo**: Preparar a plataforma para ser customizável por terceiros e garantir sua escalabilidade.

**Tarefas Detalhadas**:

1.  **Módulo White-Label**: 
    *   Desenvolver a interface e a lógica para customização da identidade visual e funcionalidades por outras empresas.
2.  **API REST**: 
    *   Expor uma API REST para permitir a integração de desenvolvedores externos.
3.  **Testes de Escalabilidade**: 
    *   Realizar testes de carga para garantir que a plataforma suporte um grande volume de usuários e projetos.

### Fase 6: Entrega e Documentação

**Objetivo**: Finalizar a entrega do projeto e fornecer documentação técnica completa.

**Tarefas Detalhadas**:

1.  **Revisão Final**: 
    *   Revisar todo o código e funcionalidades para garantir a qualidade e estabilidade.
2.  **Documentação Técnica**: 
    *   Atualizar e expandir a documentação técnica para incluir todas as novas funcionalidades e integrações.
3.  **Entrega ao Usuário**: 
    *   Apresentar o projeto finalizado e o roadmap ao usuário.

## 5. Otimização de Tokens

Para garantir a eficiência no uso de tokens, especialmente com LLMs, as seguintes estratégias serão adotadas:

*   **Processamento Incremental**: Sempre que possível, o processamento de LLM será focado em partes específicas do roteiro ou em alterações incrementais, em vez de reprocessar o conteúdo completo.
*   **Validação Local**: A validação de entrada e a pré-processamento serão realizados no frontend para reduzir a necessidade de chamadas desnecessárias ao LLM.
*   **Cache de Respostas**: Implementar mecanismos de cache para respostas do LLM quando o conteúdo de entrada não for alterado, evitando gerações redundantes.
*   **Compressão de Dados**: Otimizar o formato dos dados enviados e recebidos do LLM para minimizar o volume de tokens.
*   **Prompts Otimizados**: Desenvolver prompts concisos e eficazes para o LLM, focando na informação essencial e evitando redundâncias.

## 6. Referências

[1] IMPLEMENTATION_NOTES.md. (2026, Junho 15). Nexus Video Generator - Melhorias Implementadas.
[2] README.md. (s.d.). Nexus Video Generator - Sistema de Geração de Vídeos com IA.

---

**Autor**: Manus AI
**Data**: 17 de Junho de 2026
