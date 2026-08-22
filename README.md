# More_Ideas_the_Dragon

# Nexus-HUB / MMN AI-to-AI

> **Status de auditoria:** acervo versionado e base de recuperação preservada. O repositório não deve ser tratado como um aplicativo monolítico pronto para execução, build ou deploy sem a seleção explícita de um subprojeto canônico.

## Resumo executivo da revisão cirúrgica

A revisão end to end mais recente foi realizada sobre o `origin/main` em `5d8e9c39333c90d18fd1cc7d808dd9ad57e2c4a8`, em modo exclusivamente passivo. O worktree estava limpo; a branch de integração `integration/safe-mmnai-ai-20260822T132042Z`, publicada anteriormente em `bdb4605a54fcf4cccdbc0803dc54dcd5e6798e7c`, foi incorporada à `main` pelo merge commit `0d6f99f` e possui onze commits posteriores na base atual.

O repositório preserva **18.482 arquivos regulares**, **984 candidatos a testes por nome**, **59 manifestos de dependências**, **4.061 arquivos binários ou de mídia**, **58 arquivos executáveis**, **um link simbólico** e **nenhum arquivo acima de 90 MB**. A integração MMN AI-to-AI permanece preservada no namespace [`artifacts/mmnai-to-ai/`](./artifacts/mmnai-to-ai/), com o ZIP original e **3.139 arquivos extraídos**.

A conclusão é de **boa integridade de preservação** e **alto risco de execução não controlada**. A árvore mistura aplicativos Expo, um monorepo fullstack, bundles, snapshots, código PHP legado, documentação, mídia e artefatos de teste. Há também indicadores de arquivos sensíveis e de conteúdo não confiável; por isso, nenhum script, teste, migration, binário, segredo, token, chave ou conteúdo ofuscado deve ser executado automaticamente a partir da raiz.

A análise identificou desalinhamentos objetivos na superfície do backend raiz: o `tsconfig.json` compila somente `src/**/*`; o `package.json` raiz não declara scripts `test` ou `build`; `routers.ts` referencia `_core`, `COOKIE_NAME` e uma superfície de routers que não corresponde integralmente à árvore observada; `routers-nexus.ts` declara apenas parte dos routers importados; e `db-nexus.ts` não demonstra a camada completa de helpers chamada pelos routers. Esses pontos precisam ser tratados antes de qualquer decisão de deploy.

Leia o [resumo executivo e relatório técnico da revisão cirúrgica](./audit/RESUMO_EXECUTIVO_REVISAO_CIRURGICA.md) e as [evidências sanitizadas](./audit/REVIEW_METRICS_REDACTED.md). Esses documentos não exibem credenciais, tokens, chaves privadas, payloads, valores de secrets ou conteúdo ofuscado.

## Catálogo dos agentes de IA integrados

O núcleo do ecossistema declara **8 agentes de IA** em [`agents-config.ts`](./agents-config.ts), por meio da coleção `EIGHT_AGENTS`. Este é o número verificável de agentes nomeados e configurados no núcleo, e não uma contagem de todos os arquivos, skills, telas, routers ou bundles que mencionam agentes. Os módulos de orquestração, ferramentas e skills descritos no repositório são capacidades de suporte e não foram contabilizados como agentes autônomos adicionais sem um registro formal equivalente.

A tabela abaixo organiza cada agente pelo papel declarado no código, pelo potencial operacional indicado por sua especialização e pela superfície de skills/capacidades que deve ser considerada em uma futura implementação controlada. “Potencial” descreve a responsabilidade arquitetural prevista; não constitui prova de autonomia, consciência, acesso a fundos, acesso a credenciais ou execução em produção.

| # | Agente | Finalidade declarada | Potencial operacional | Skills e capacidades relacionadas |
|---:|---|---|---|---|
| 1 | **Nexus Prime** | Orquestração, governança e coordenação estratégica do ecossistema | Coordenar fluxos entre agentes, priorizar missões e apoiar decisões de governança | Orquestração de missões, roteamento, governança, coordenação de recursos e supervisão de ciclo |
| 2 | **Forge Architect** | Desenvolvimento de projetos e gestão de repositórios | Estruturar soluções, organizar entregas e orientar arquitetura e boas práticas de engenharia | Arquitetura de software, organização de repositório, revisão técnica, planejamento e integração de projetos |
| 3 | **Treasury Keeper** | Economia, dividendos, transações e fluxos financeiros | Apoiar cálculos, controles e políticas de tesouraria dentro de limites autorizados | Contabilidade de fluxos, cálculos, reconciliação, auditoria financeira e regras de distribuição |
| 4 | **Asset Curator** | Ativos digitais, NFTs, autenticidade e marketplace | Catalogar, validar metadados e organizar ativos digitais e seus ciclos de marketplace | Curadoria de ativos, validação por hash, catalogação, metadados e integridade de artefatos |
| 5 | **Gnox Translator** | Comunicação estruturada e privacidade interagentes | Traduzir intenções e mensagens entre formatos definidos pelo ecossistema | Tradução semântica, serialização, comunicação interagentes e tratamento de mensagens estruturadas |
| 6 | **DNA Midwife** | Criação, genealogia e evolução de agentes | Gerar configurações derivadas e organizar relações de herança entre agentes | Geração de IDs, composição de prompts, genealogia, versionamento de configuração e validação de descendentes |
| 7 | **Pulse Monitor** | Saúde, sinais vitais e ciclo de vida dos agentes | Monitorar indicadores, detectar anomalias e emitir alertas operacionais | Observabilidade, health checks, Brain Pulse, detecção de anomalias, alertas e ciclo de vida |
| 8 | **Moltbook Voice** | Comunicação social, narrativa e construção de comunidade | Produzir narrativas e representar o ecossistema em canais sociais autorizados | Redação, síntese narrativa, comunicação social, publicação controlada e gestão de comunidade |

### Como a contagem foi validada

A contagem de oito agentes foi obtida diretamente a partir dos oito objetos da coleção `EIGHT_AGENTS`, identificados pelos IDs `agent-001` a `agent-008`, cada um com `name`, `specialization`, `systemPrompt`, hash de DNA e descrição. A interface [`Agents.tsx`](./Agents.tsx) fornece operações de listagem, criação e alteração de status via tRPC, enquanto [`agent-container.ts`](./agent-container.ts), [`agent-worker.ts`](./agent-worker.ts), os orquestradores e os módulos `agentic/skills` representam infraestrutura, execução ou capacidades auxiliares; eles não alteram a contagem formal do catálogo.

### Limites de segurança e interpretação

A presença de uma configuração, prompt, router, skill ou tela não prova que um agente esteja ativo, treinado, conectado a um provedor de modelo, autorizado a movimentar ativos ou apto a executar operações autônomas. O repositório contém snapshots, bundles, documentação e subprojetos heterogêneos. Portanto, qualquer ativação deve ocorrer somente dentro de um subprojeto selecionado, com revisão humana, credenciais mínimas, isolamento de rede, logs, testes controlados e políticas explícitas de autorização.

O termo “skill” neste catálogo significa uma capacidade funcional ou integração relacionada ao papel do agente. Ele não deve ser interpretado como permissão irrestrita. Em particular, módulos financeiros, de tesouraria, blockchain, publicação social ou automação exigem aprovação explícita, validação independente e separação entre observação, preparação e execução.

---


## Mapa operacional do repositório

| Área | Finalidade | Regra de uso |
|---|---|---|
| Raiz | Arquivos históricos, módulos de integração e snapshots diversos | Não assumir que a raiz seja um app executável único |
| `nexus_mmn_fullstack_phd/` | Monorepo com frontend, backend, mobile, infraestrutura e scripts | Candidato a aplicação canônica, ainda requer validação controlada |
| `artifacts/mmnai-to-ai/` | Pacote MMN AI-to-AI preservado, ZIP, extração e auditorias | Preservação histórica; não executar por padrão |
| `backend/` e `frontend/` | Componentes e snapshots de aplicações | Validar ownership, manifestos e lockfiles antes de instalar |
| `nexus_*`, `task_artifacts/`, `imports/` | Bundles, entregas e snapshots de outras fases | Tratar como acervo até que uma pipeline os selecione explicitamente |
| `docs/` e arquivos Markdown | Especificações, relatórios e material operacional | Conteúdo informativo; instruções devem ser revisadas antes de uso |

## Política de segurança e execução

Os arquivos preservados podem conter scripts, fixtures, exemplos, bibliotecas legadas e artefatos de teste. A classificação como teste não transforma o conteúdo em confiável nem autoriza sua execução com acesso à rede, filesystem de produção ou credenciais reais.

Antes de executar qualquer componente, crie uma cópia controlada, faça uma varredura de secrets e dependências, use sandbox sem credenciais, restrinja a rede e selecione somente o subprojeto necessário. Não execute arquivos de carteiras, chaves, backups, credenciais, `.env`, PHP legado, conteúdo ofuscado ou scripts de automação diretamente da raiz. Consulte [`SECURITY.md`](./SECURITY.md) e o [relatório sanitizado](./audit/REVIEW_METRICS_REDACTED.md) para os limites da auditoria.

## Prioridades de engenharia

1. Escolher e declarar o aplicativo canônico, separando produção, testes, legado, snapshots e preservação.
2. Corrigir os contratos do backend raiz — imports, schema, routers, helpers e entrypoints — ou marcar explicitamente esses arquivos como históricos.
3. Catalogar os 59 manifestos e criar comandos reproduzíveis por subprojeto, com lockfile e CI próprios.
4. Mapear os 984 candidatos a testes e separar testes executáveis de fixtures e documentação.
5. Estabelecer secret scanning, CODEOWNERS, política de artefatos e pipelines que nunca executem o acervo preservado por padrão.

## Escopo desta documentação

Este README foi atualizado após uma revisão estática e passiva. Nenhum script, teste, migration, build, deploy, binário, chamada externa ou conteúdo ofuscado foi executado. As métricas de risco são heurísticas de triagem e não constituem prova de exploração. O objetivo desta documentação é impedir suposições operacionais incorretas e orientar a próxima etapa de normalização técnica.

---

## 🚀 PHD Operation: End-to-End Population (01-299)
This repository is part of a collaborative operation. We have recently integrated the **PHD End-to-End Collection**, ensuring all 299 core files, scripts, and documents are present and validated.

### Safe Recovery Protocol Applied
- **Zero Overwrite**: All existing work by other developers is preserved.
- **Full Integrity**: Verified against `MANIFEST_PHD_299_FINAL.txt`.
- **Validation**: See `PHD_EndToEnd_Validation/validation_report.txt`.

---

### Login Flow (Native)

1. User taps Login button
2. `startOAuthLogin()` calls `Linking.openURL()` which opens Manus OAuth in the system browser
3. User authenticates
4. OAuth redirects to the app's deep link (`/oauth/callback`) with code/state params
5. App opens the callback handler
6. Callback exchanges code for session token
7. Token stored in SecureStore
8. User redirected to home

### Login Flow (Web)

1. User clicks Login button
2. Browser redirects to Manus OAuth
3. User authenticates
4. Redirect back with session cookie
5. Cookie automatically sent with requests

### Protected Routes

Use `protectedProcedure` in tRPC to require authentication:

```tsx
// server/routers.ts
import { protectedProcedure } from "./_core/trpc";

export const appRouter = router({
  myFeature: router({
    getData: protectedProcedure.query(({ ctx }) => {
      // ctx.user is guaranteed to exist
      return db.getUserData(ctx.user.id);
    }),
  }),
});

```
### Frontend: Handling Auth Errors
protectedProcedure MUST HANDLE UNAUTHORIZED when user is not logged in. Always handle this in the frontend:
```tsx
try {
  await trpc.someProtectedEndpoint.mutate(data);
} catch (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    router.push('/login');
    return;
  }
  throw error;
}
```

---

## Database

### Schema Definition

Define your tables in `drizzle/schema.ts`:

```tsx
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// Users table (already exists)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Add your tables
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;
```

### Running Migrations

After editing the schema, push changes to the database:

```bash
pnpm db:push
```

This runs `drizzle-kit generate` and `drizzle-kit migrate`.

### Query Helpers

Add database queries in `server/db.ts`:

```tsx
import { eq } from "drizzle-orm";
import { getDb } from "./_core/db";
import { items, InsertItem } from "../drizzle/schema";

export async function getUserItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(items).where(eq(items.userId, userId));
}

export async function createItem(data: InsertItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(items).values(data);
  return result.insertId;
}

export async function updateItem(id: number, data: Partial<InsertItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(items).set(data).where(eq(items.id, id));
}

export async function deleteItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(items).where(eq(items.id, id));
}
```

---

## tRPC API

### Adding Routes

Define API routes in `server/routers.ts`:

```tsx
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db from "./db";