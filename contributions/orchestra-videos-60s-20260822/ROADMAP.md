# Roadmap de Desenvolvimento — Plataforma de Produção de Vídeos de 60 Segundos

**Data de referência:** 22 de agosto de 2026  
**Escopo:** módulo de criação de vídeos de até 60 segundos para o Nexus Orchestra  
**Princípio operacional:** importação aditiva, auditável e não destrutiva.

## 1. Objetivo

Consolidar no ecossistema Nexus Orchestra o módulo de produção de vídeos curtos a partir de um prompt, preservando o histórico, as branches, os arquivos e as integrações existentes. O pacote desta tarefa contém **22 arquivos**: componentes React, estilos, serviços TypeScript, documentação e configuração. Nenhum arquivo existente será substituído; todo o conteúdo será adicionado em uma pasta dedicada de contribuição.

## 2. Desenvolvimento já executado

| Área | Estado | Evidência |
|---|---|---|
| Definição da arquitetura do pipeline | Concluído como especificação | `architecture_document.md` |
| Modelagem de tipos de vídeo | Concluído como scaffold | `index.ts` e `types.ts` do pacote |
| Formulário de criação neon-noir | Concluído como protótipo | `VideoCreator.tsx` e `videoCreator.css` |
| Painel visual de progresso | Concluído como protótipo | `VideoProgressPanel.tsx` e `videoProgressPanel.css` |
| Orquestração roteiro → imagens → áudio → composição | Scaffold inicial | `pipelineOrchestrator.ts` |
| Serviço de geração de roteiro | Mock/placeholder | `scriptGenerationService.ts` |
| Serviço de geração de imagens | Mock/placeholder | `imageGenerationService.ts` |
| Serviço de áudio/TTS | Mock/placeholder | `audioGenerationService.ts` |
| API REST e router tRPC propostos | Esboço não integrado | `videoApi.ts` e `videoCreatorRouter.ts` |
| Integração com o app principal | Ainda não executada | o servidor atual não registra as rotas do módulo |
| Composição FFmpeg, persistência e S3 | Ainda não executada | existem TODOs explícitos no scaffold |

## 3. Roadmap a executar

### Fase A — Integração segura no repositório

A contribuição deve permanecer em um diretório próprio, com manifesto, hashes e cópia do ZIP original. A integração funcional será feita posteriormente em commits separados, sempre em branch dedicada e por meio de revisão/PR. O servidor e a interface existentes não devem ser editados diretamente durante a importação documental.

### Fase B — Contratos e persistência

Alinhar os tipos do módulo com o domínio existente, definir o schema de vídeos, cenas, assets e eventos de pipeline, e escolher o mecanismo de persistência compatível com o repositório. A implementação deve incluir ownership por usuário, idempotência, timestamps, retenção e estados explícitos de erro/cancelamento.

### Fase C — APIs e execução assíncrona

Integrar as rotas de criação, progresso, detalhes, listagem, cancelamento e exclusão. A execução deve possuir fila ou worker, correlation ID, retry com backoff, limites de concorrência, timeout por etapa e atualização de eventos. O fire-and-forget atual deve ser substituído por uma estratégia observável e recuperável.

### Fase D — Provedores de IA

Substituir os mocks por adaptadores de LLM, geração de imagens e TTS, reutilizando as rotas/provedores já disponíveis no Nexus Orchestra. Cada adaptador deve validar resposta, tratar rate limit, registrar custo/latência e permitir fallback configurável.

### Fase E — Composição de vídeo

Implementar composição real com FFmpeg, incluindo imagens por cena, áudio, duração máxima de 60 segundos, formato MP4, resolução e proporção configuráveis, normalização de áudio, thumbnail e limpeza de temporários. O uso de binários deve ser declarado no ambiente de execução e validado no CI.

### Fase F — Interface de produção

Integrar o `VideoCreator` ao app sem remover o `VideoChatbot` existente. O fluxo deve permitir criar, acompanhar, cancelar, visualizar, baixar e consultar histórico. O painel deve usar progresso real por polling ou eventos, não `setInterval` simulado, e deve possuir estados de erro, retry e acessibilidade.

### Fase G — Qualidade, segurança e operação

Adicionar testes unitários, contratos de API, testes de integração, validação de duração, sanitização de prompts, limites de upload, proteção de segredos, logs estruturados, métricas, health checks e documentação de operação. Nenhuma credencial deve entrar no repositório.

### Fase H — Entrega incremental

Cada mudança funcional deve ser pequena, revisável e publicada em branch própria. Antes do merge, executar build, typecheck, testes, verificação de arquivos não rastreados, comparação com o baseline e validação de que não existem deleções não intencionais.

## 4. Critérios de aceite end-to-end

| Critério | Condição de aceite |
|---|---|
| Preservação | `git diff --diff-filter=D` vazio para a contribuição e nenhum commit anterior reescrito |
| Integridade | Todos os 22 arquivos do ZIP presentes e hash do ZIP preservado |
| Organização | Arquivos importados em diretório dedicado, com README e manifesto |
| Funcionalidade | Pipeline executável com estados persistidos e composição MP4 real |
| Limite | Vídeo final nunca excede 60 segundos |
| Observabilidade | Progresso, falha, cancelamento e retry visíveis ao usuário |
| Segurança | Nenhuma chave ou credencial versionada |
| Revisão | Branch dedicada, commit atômico e PR para revisão dos demais desenvolvedores |

## 5. Decisões de segurança

A importação desta tarefa é deliberadamente **aditiva**. O ZIP original será mantido como artefato de origem, os arquivos extraídos serão mantidos em pasta própria e um manifesto SHA-256 permitirá auditoria posterior. A existência de branches e commits de outros desenvolvedores será preservada; não serão usados `reset --hard`, `rebase` sobre branches compartilhadas, `push --force`, remoções ou sobrescritas de arquivos existentes.

## Referências

[1]: https://git-scm.com/docs/git-status "Git status — documentação oficial"  
[2]: https://git-scm.com/docs/git-diff "Git diff — documentação oficial"  
[3]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests "GitHub Pull Requests — documentação oficial"

---

## Inventário desta entrega

O pacote de origem `Orchestra_Videos.zip` foi recebido e extraído para validação. A contagem física do pacote é 22 arquivos. A etapa de importação criará também este roadmap, um README de contribuição, um manifesto de hashes e uma cópia do ZIP, totalizando 26 arquivos adicionados por repositório nesta entrega de preservação.

> Observação: não serão criados arquivos artificiais para atingir uma contagem nominal de 299. Serão versionados todos os arquivos reais fornecidos nesta tarefa, com rastreabilidade e hashes verificáveis.

---

**Autor:** Manus AI
