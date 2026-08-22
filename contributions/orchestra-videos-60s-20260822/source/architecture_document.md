# Documento de Arquitetura: Nexus Orchestra - Módulo de Criação de Vídeos

**Autor:** Manus AI

## 1. Introdução

Este documento detalha a arquitetura e o design do novo módulo de criação de vídeos para o Nexus Orchestra. O objetivo é desenvolver uma aplicação web fullstack que permita aos usuários gerar vídeos de até 60 segundos a partir de um prompt de texto, utilizando um pipeline agêntico de última geração. O desenvolvimento será realizado de forma não-destrutiva, integrando-se ao repositório existente `Nexus-HUB57/Nexus_Orchestra` sem sobrescrever, substituir ou excluir arquivos ou commits.

## 2. Arquitetura Geral do Sistema

O módulo de criação de vídeos será integrado ao ecossistema existente do Nexus Orchestra, aproveitando sua infraestrutura React, Express e tRPC. A arquitetura será dividida em frontend (interface do usuário) e backend (pipeline agêntico e APIs).

```mermaid
graph TD
    A[Usuário: Prompt de Texto] --> B(Frontend: Formulário de Criação)
    B --> C{Backend: API tRPC - Iniciar Geração de Vídeo}
    C --> D[Orquestrador Agêntico de Vídeo]
    D --> E[Etapa 1: Geração de Roteiro (LLM)]
    E --> F[Etapa 2: Geração de Imagens por Cena (IA)]
    F --> G[Etapa 3: Síntese de Narração (TTS)]
    G --> H[Etapa 4: Composição Final (FFmpeg)]
    H --> I[Armazenamento (S3)]
    I --> J[Backend: Notificação de Conclusão]
    J --> K[Frontend: Painel de Progresso]
    K --> L[Frontend: Player de Vídeo]
    I --> M[Frontend: Histórico de Vídeos]
```

## 3. Pipeline Agêntico de Geração de Vídeo

O coração do módulo é um pipeline agêntico sequencial, orquestrado no backend, que transforma um prompt de texto em um vídeo final. Cada etapa será um micro-serviço ou função que se comunica através de um sistema de mensagens ou chamadas de API internas.

### 3.1. Etapa 1: Geração de Roteiro (LLM)

*   **Entrada:** Prompt de texto do usuário (tema, estilo, tom).
*   **Processo:** Um Large Language Model (LLM), como o Gemini ou Claude Fable 5 (já integrados ao Nexus Orchestra), receberá o prompt e gerará um roteiro detalhado. O roteiro será estruturado por cenas, incluindo:
    *   `scene_id`: Identificador único da cena.
    *   `narration_text`: Texto da narração para a cena.
    *   `visual_description`: Descrição detalhada do que deve ser visualizado na cena (para a IA de geração de imagens).
    *   `duration`: Duração estimada da cena em segundos.
*   **Saída:** Objeto JSON contendo o roteiro estruturado.

### 3.2. Etapa 2: Geração de Imagens por Cena (IA)

*   **Entrada:** `visual_description` de cada cena do roteiro.
*   **Processo:** Uma IA de geração de imagens (utilizando a skill `imagegen` e APIs internas do Manus ou externas) criará uma imagem visual estática para cada cena. As imagens serão otimizadas para o formato de vídeo (e.g., proporção 16:9).
*   **Saída:** URLs de imagens geradas, armazenadas no S3.

### 3.3. Etapa 3: Síntese de Narração (TTS)

*   **Entrada:** `narration_text` de cada cena do roteiro.
*   **Processo:** Um serviço de Text-to-Speech (TTS) converterá o texto da narração em arquivos de áudio. A skill `SpeechSynthesis` existente no Nexus Orchestra pode ser adaptada ou uma API externa pode ser utilizada.
*   **Saída:** URLs de arquivos de áudio gerados, armazenados no S3.

### 3.4. Etapa 4: Composição Final (FFmpeg)

*   **Entrada:** Imagens geradas, arquivos de áudio de narração e o roteiro com durações de cena.
*   **Processo:** O FFmpeg será utilizado para compor o vídeo final. Ele combinará as imagens estáticas com seus respectivos áudios de narração, aplicando transições simples e sincronizando a duração de cada cena para totalizar até 60 segundos. Este processo será executado em um ambiente de backend que suporta FFmpeg (via Dockerfile customizado).
*   **Saída:** URL do vídeo final gerado (MP4), armazenado no S3.

## 4. Schema do Banco de Dados

Novas tabelas serão adicionadas ao `drizzle/schema.ts` existente para gerenciar os vídeos, cenas e o progresso do pipeline. As tabelas serão relacionadas à tabela `users` existente para manter o histórico personalizado.

```typescript
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// Tabela de usuários existente (para referência)
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Nova tabela para armazenar informações sobre os vídeos gerados
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Chave estrangeira para a tabela de usuários
  prompt: text("prompt").notNull(), // Prompt original do usuário
  status: mysqlEnum("status", ["pending", "script_generated", "images_generated", "audio_generated", "composing", "completed", "failed"]).default("pending").notNull(),
  videoUrl: varchar("videoUrl", { length: 2048 }), // URL do vídeo final no S3
  thumbnailUrl: varchar("thumbnailUrl", { length: 2048 }), // URL da miniatura do vídeo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

// Nova tabela para armazenar as cenas de cada vídeo
export const scenes = mysqlTable("scenes", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull(), // Chave estrangeira para a tabela de vídeos
  sceneIndex: int("sceneIndex").notNull(), // Ordem da cena no vídeo
  narrationText: text("narrationText").notNull(), // Texto da narração da cena
  visualDescription: text("visualDescription").notNull(), // Descrição visual para geração de imagem
  imageUrl: varchar("imageUrl", { length: 2048 }), // URL da imagem gerada para a cena no S3
  audioUrl: varchar("audioUrl", { length: 2048 }), // URL do áudio gerado para a cena no S3
  duration: int("duration").notNull(), // Duração da cena em segundos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scene = typeof scenes.$inferSelect;
export type InsertScene = typeof scenes.$inferInsert;

// Relações entre as tabelas
export const relations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const videoRelations = relations(videos, ({ one, many }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
  scenes: many(scenes),
}));

export const sceneRelations = relations(scenes, ({ one }) => ({
  video: one(videos, { fields: [scenes.videoId], references: [videos.id] }),
}));
```

## 5. Tecnologias Utilizadas

*   **Frontend:** React 19, Tailwind CSS v4, Wouter (para roteamento).
*   **Backend:** Express.js, tRPC (para comunicação type-safe entre frontend e backend), Drizzle ORM (para interação com o banco de dados MySQL/TiDB).
*   **LLM:** Google GenAI (Gemini) ou Claude Fable 5 (conforme já integrado ao Nexus Orchestra).
*   **Geração de Imagens:** APIs de IA de geração de imagens (via skill `imagegen` ou APIs internas do Manus).
*   **Síntese de Fala (TTS):** APIs de TTS (via skill `SpeechSynthesis` ou APIs internas do Manus).
*   **Composição de Vídeo:** FFmpeg (executado no backend, com suporte via Dockerfile customizado).
*   **Armazenamento:** S3 (para imagens, áudios e vídeos finais).
*   **Autenticação:** Manus OAuth.

## 6. Estilo Visual da Interface

A interface do usuário seguirá uma estética **cinemática neon-noir**:

*   **Fundo:** Azul meia-noite profundo (`#0A0A2A`) para máximo contraste.
*   **Títulos:** Negrito, fonte sans-serif (e.g., `Inter` ou `Montserrat`), com preenchimento rosa vibrante (`#FF00FF` - hot pink) e brilho externo difuso em azul elétrico (`#00FFFF`), criando um efeito de luz pulsante e futurista.
*   **Linhas de Acento:** Verticais, minimalistas, em tons de ciano (`#00FFFF`) e magenta (`#FF00FF`), emoldurando o layout.
*   **Tipografia Secundária:** Elegante e com espaçamento amplo, reforçando a atmosfera misteriosa e inspirada na vida noturna.

## 7. Considerações de Implementação

*   **Não-destrutivo:** Todas as modificações serão adicionadas como novos arquivos ou extensões, sem alterar o código existente do Nexus Orchestra, a menos que seja estritamente necessário para integração (e.g., adicionar um novo router tRPC).
*   **Modularidade:** O novo módulo será o mais auto-contido possível dentro de `/src/modules/video-creator/`.
*   **Monitoramento de Progresso:** O status de cada etapa do pipeline será atualizado no banco de dados e refletido em tempo real na interface do usuário via polling ou WebSockets (se necessário).
*   **Tratamento de Erros:** Robustos mecanismos de tratamento de erros serão implementados em cada etapa do pipeline para garantir resiliência.
*   **Otimização de Recursos:** A geração de imagens e áudios será otimizada para evitar consumo excessivo de recursos e garantir a duração máxima de 60 segundos para o vídeo final.
*   **Dockerfile:** Um `Dockerfile` customizado será criado para incluir o FFmpeg no ambiente de produção, garantindo que o processo de composição de vídeo possa ser executado. Este Dockerfile será adicionado ao repositório sem substituir o existente, possivelmente com um nome diferente ou uma estratégia de build que o incorpore.))

## 8. TODO List

- [ ] Adicionar novas tabelas `videos` e `scenes` ao `drizzle/schema.ts`.
- [ ] Gerar migrações do Drizzle e aplicá-las ao banco de dados.
- [ ] Criar APIs tRPC para iniciar a geração de vídeo, obter status e listar vídeos do usuário.
- [ ] Implementar o serviço de orquestração do pipeline agêntico no backend.
- [ ] Desenvolver o formulário de criação de vídeo no frontend.
- [ ] Criar o painel de progresso em tempo real no frontend.
- [ ] Implementar o player de vídeo e o histórico de vídeos no frontend.
- [ ] Desenvolver o serviço de composição de vídeo com FFmpeg.
- [ ] Criar um Dockerfile customizado para incluir FFmpeg.
- [ ] Implementar testes unitários e de integração para o novo módulo.
