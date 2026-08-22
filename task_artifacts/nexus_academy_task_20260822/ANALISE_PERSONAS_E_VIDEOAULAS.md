# Análise de Personas e Sistema de Videoaulas - MMN_AI-to-AI

## 📋 Resumo Executivo

O repositório `Nexus-HUB57/MMN_AI-to-AI` possui um **sistema de geração de videoaulas em desenvolvimento** (`Generate Vídeos Nexus V/`) com personas bem definidas (Sra. Nexus Ive e Sir. Nexus Alencar) e uma **Academia estruturada** com cursos, webinars, Lab Nexus e Lib Nexus. O sistema está em fase de integração com a plataforma principal e requer ajustes de API e expansão de funcionalidades.

---

## 🎭 Personas Definidas

### 1. **Sra. Nexus Ive**
- **Voz**: Serena, acolhedora, com leve sotaque sulista
- **Características**: Sensualidade atraente, autoridade, profissionalismo com calor humano
- **Tom por nível**:
  - **Fundamental**: Acolhedor e paciente
  - **Agente**: Instrutivo e prático
  - **Master**: Estratégico e analítico
  - **Elite**: Parceria de alto nível
- **Papel**: Anfitriã, mediadora, instrutora principal
- **Aplicações**: Cursos, treinamentos, webinars, Lab Nexus, Lib Nexus

### 2. **Sir. Nexus Alencar**
- **Voz**: Serena, acolhedora, autoritária
- **Características**: Fisionomia marcante (traços judaicos, Kippah, barba grisalha), mentor experiente
- **Papel**: Especialista técnico, aprofundador de conceitos
- **Aplicações**: Debates, palestras técnicas, demonstrações práticas

### 3. **Dinâmica de Co-atuação (Dupla)**
- **Complementaridade**: Ive (estratégia) + Alencar (execução técnica)
- **Interação**: Trocas de olhares, pequenas intervenções de reforço, construção conjunta de ideias
- **Cumplicidade**: Profissionalismo com leveza, humor sutil, demonstração de entendimento mútuo

---

## 🎬 Sistema de Geração de Videoaulas

### Estrutura Atual

```
Generate Vídeos Nexus V/
├── server/
│   ├── routers.ts           # API tRPC (video.create, video.generateScript, etc.)
│   ├── llmService.ts        # Serviço de LLM para geração de roteiros
│   ├── personaDirectives.ts # Diretrizes de personas (prompts, tom, estilo)
│   ├── courseData.ts        # Catálogo de módulos e níveis
│   ├── db.ts                # Persistência (Drizzle/MySQL)
│   ├── ltx2Service.ts       # Integração com gerador de vídeo LTX-2
│   └── syncAcademiaScripts.ts # Sincronização de roteiros da Academia
├── frontend/
│   └── [Componentes React para UI de criação/edição de vídeos]
└── package.json
```

### API Disponível (tRPC)

| Endpoint | Método | Status | Descrição |
|----------|--------|--------|-----------|
| `video.create` | mutation | ✅ | Criar novo projeto de vídeo |
| `video.list` | query | ✅ | Listar projetos do usuário |
| `video.getById` | query | ✅ | Obter detalhes de um projeto |
| `video.delete` | mutation | ✅ | Deletar projeto |
| `video.generateScript` | mutation | ✅ | Gerar roteiro via LLM |
| `video.updateScript` | mutation | ✅ | Editar roteiro |
| `video.getScript` | query | ✅ | Recuperar roteiro |
| `video.generateVideo` | mutation | ✅ | Gerar vídeo via LTX-2 |

### Fluxo de Geração

1. **Criar Projeto**: Usuário seleciona persona (Ive/Alencar/dupla), nível (Fundamental/Agente/Master/Elite) e módulo
2. **Gerar Roteiro**: LLM cria roteiro estruturado em Markdown com cenas, diálogos e elementos visuais
3. **Editar Roteiro**: Usuário pode refinar o roteiro manualmente
4. **Gerar Vídeo**: Sistema converte roteiro em vídeo usando LTX-2
5. **Publicar**: Vídeo fica disponível na Academia

---

## 📚 Academia Nexus - Estrutura Atual

### Trilhas de Cursos (4 Níveis)

| Trilha | Público | Skills | Acesso Mínimo |
|--------|---------|--------|---------------|
| **Fundamental** | Recém-cadastrados | 2 | Iniciante |
| **Agente** | 1º ciclo ativo | 4 | Operador |
| **Master** | Fase de escala | 6 | Estrategista |
| **Elite** | Liderança premium | 5 | Elite |

### Recursos Disponíveis

- **Cursos**: Markdown com roteiros de aula (fundamental, agente, master, elite)
- **Treinamentos**: Workshops gravados (8/15 implementados)
- **Webinars**: Eventos ao vivo (3 planejados, 2 históricos)
- **Playbooks**: Manuais operacionais (3/3)
- **Lab Nexus**: 38 ferramentas categorizadas
- **Lib Nexus**: Base canônica com 45 skills mapeadas

### Webinars Planejados (2026)

| Código | Título | Data | Status |
|--------|--------|------|--------|
| WB-2026-01 | Lançamento do IOAID | 2026-03-15 | ✅ Realizado |
| WB-2026-02 | SHO em Produção | 2026-05-22 | ✅ Realizado |
| WB-2026-03 | Academ'IA Open House | 2026-06-15 | 🟡 Agendado |
| WB-2026-04 | Lab Nexus Tour | 2026-07-10 | 📅 Planejado |

**Calendário**: Última quinta-feira de cada mês, 19h BRT

---

## 🔧 Problemas Identificados e Correções

### 1. **Bug na Chamada de `generateScriptWithLLM`** ✅ CORRIGIDO

**Problema**: A função `generateScriptWithLLM` em `llmService.ts` espera 5 parâmetros:
```typescript
generateScriptWithLLM(
  persona: PersonaType,
  level: CourseLevel,
  module: string,
  moduleTitle: string,    // ← FALTAVA
  moduleContent: string
)
```

Mas em `routers.ts` era chamada com apenas 4 parâmetros.

**Solução Aplicada**: Adicionado `project.title` como `moduleTitle` na chamada.

### 2. **Integração Incompleta com Banco de Dados**

**Status**: Parcialmente implementada
- ✅ CRUD básico de projetos
- ✅ Persistência de scripts
- ⚠️ Histórico de geração não está sendo registrado
- ⚠️ Thumbnails personalizadas não estão sendo geradas

### 3. **Falta de Integração com Personas de Voz**

**Status**: Estrutura pronta, implementação pendente
- ✅ Diretrizes de persona definidas
- ✅ Prompts de sistema configurados
- ⚠️ Síntese de voz (TTS) não está integrada
- ⚠️ Áudio de personas não está sendo usado

---

## 📊 Estado de Desenvolvimento

### Componentes Implementados ✅

- [x] Banco de dados (schema de video_projects e scripts)
- [x] API tRPC completa
- [x] Serviço de LLM para geração de roteiros
- [x] Diretrizes de personas codificadas
- [x] Integração com LTX-2 para geração de vídeo
- [x] Dashboard da Academia (AcademiaDashboard.tsx)
- [x] Manifesto de sincronização (agent-bridge.json)
- [x] Catálogo de skills (skill-manifest.json)

### Componentes em Desenvolvimento 🔄

- [ ] UI de criação de vídeos (frontend)
- [ ] Síntese de voz das personas
- [ ] Geração de thumbnails personalizadas
- [ ] Sistema de templates de vídeo
- [ ] Integração com editor de vídeo
- [ ] Publicação automática na Academia

### Componentes Planejados 📅

- [ ] Transcrição automática de vídeos
- [ ] Legendagem automática
- [ ] Análise de engajamento
- [ ] A/B testing de roteiros
- [ ] Repositório de assets (imagens, música, efeitos)

---

## 🚀 Próximos Passos Recomendados

### Fase 1: Correção e Estabilização (Imediato)
1. ✅ Corrigir bug de parâmetros em `generateScriptWithLLM`
2. Implementar registro de histórico de geração
3. Adicionar validação de entrada robusta
4. Testes unitários para API

### Fase 2: Integração de Voz (Curto Prazo)
1. Integrar TTS (text-to-speech) com diretrizes de persona
2. Usar áudio pré-gravado das personas (WAV disponíveis)
3. Sincronizar áudio com roteiro
4. Implementar detecção automática de persona

### Fase 3: UI e Experiência (Médio Prazo)
1. Criar interface de criação de vídeos
2. Editor visual de roteiros
3. Preview de vídeo antes de publicação
4. Dashboard de projetos

### Fase 4: Publicação e Distribuição (Longo Prazo)
1. Integração com Academia (publicar vídeos em trilhas)
2. Sistema de notificações para novos vídeos
3. Analytics de visualização
4. Recomendações baseadas em perfil do usuário

---

## 📁 Arquivos Críticos

| Arquivo | Localização | Propósito |
|---------|------------|----------|
| `routers.ts` | `Generate Vídeos Nexus V/server/` | API tRPC principal |
| `llmService.ts` | `Generate Vídeos Nexus V/server/` | Geração de roteiros via LLM |
| `personaDirectives.ts` | `Generate Vídeos Nexus V/server/` | Diretrizes de personas |
| `db.ts` | `Generate Vídeos Nexus V/server/` | Persistência de dados |
| `AcademiaDashboard.tsx` | `frontend/src/pages/` | Dashboard da Academia |
| `nexus-academia.ts` | `frontend/src/lib/` | Tipos e funções da Academia |
| `agent-bridge.json` | `AcademIA/sync/` | Sincronização Academia-Runtime |
| `skill-manifest.json` | `AcademIA/sync/` | Catálogo de 45 skills |

---

## 🎯 Conclusão

O sistema de videoaulas está **bem estruturado em nível de arquitetura e personas**, mas precisa de **integração pronta para produção**. As personas Ive e Alencar são diferenciadas e oferecem potencial para conteúdo educacional de alto impacto. A Academia possui uma estrutura robusta de cursos, webinars e recursos que pode ser potencializada com a geração automática de vídeos.

**Recomendação**: Focar em estabilizar a API, integrar voz das personas e criar uma UI intuitiva para que criadores de conteúdo possam gerar videoaulas rapidamente.
