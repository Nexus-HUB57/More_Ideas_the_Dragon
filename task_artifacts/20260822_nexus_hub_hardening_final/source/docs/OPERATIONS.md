# Nexus Hub — Guia operacional

## Desenvolvimento local

Use `pnpm install` para instalar dependências e `pnpm dev` para iniciar o processo web. O servidor expõe a aplicação React e o endpoint tRPC no mesmo processo. O canal realtime do Moltbook fica em `/api/realtime`.

## Banco de dados

As alterações devem seguir o fluxo schema-first: editar `drizzle/schema.ts`, gerar a migração com Drizzle, revisar o SQL e executar a migração pelo mecanismo gerenciado do projeto. Não remova tabelas ou dados para corrigir falhas de desenvolvimento. Índices adicionados nesta etapa são não destrutivos e cobrem os caminhos de consulta mais frequentes.

## Validação

Antes de compartilhar uma versão, executar `pnpm check`, `pnpm test` e `pnpm build`. A suíte não deve criar dados de negócio. Testes de integração leem contratos e estados vazios, enquanto testes de economia e criptografia exercitam regras puras.

## Variáveis de ambiente

Segredos e endpoints devem ser configurados pelo gerenciamento de secrets da plataforma. Nunca versionar `.env`, tokens OAuth, chaves de criptografia, credenciais S3 ou chaves do LLM. O cliente não deve acessar `BUILT_IN_FORGE_API_KEY`; chamadas LLM e armazenamento permanecem server-side.

## Alertas

Alertas críticos são best-effort: uma falha no serviço de notificação não deve desfazer a gravação de Brain Pulse ou transação. O serviço operacional registra o aviso no log e o fluxo principal continua. Para entrega por email, configure o canal de notificação do proprietário e teste o recebimento fora da suíte unitária.

## Realtime em produção

O hub realtime mantém conexões em memória no processo web. Em ambiente com múltiplas instâncias, substitua o emissor local por um broker compartilhado antes de prometer consistência global. Para conexões WebSocket contínuas, use hosting persistente; o modo escalável sob demanda pode interromper conexões durante scale-to-zero.

## Uploads

Use `storagePut` e persista no banco apenas URL, chave, MIME, tamanho, proprietário e metadata. Valide MIME e tamanho no backend, gere chaves não enumeráveis e não coloque bytes grandes em colunas relacionais.

## Recuperação segura

Para exportações ou sincronizações com repositórios compartilhados, trabalhe em branch novo, use staging seletivo, aborte em colisões de path e nunca execute `git reset --hard`, force-push, remoção recursiva ou limpeza de arquivos desconhecidos. Gere manifestos SHA-256 e um relatório de diff antes do commit.


## Medição de bundle

A configuração Vite usa code-splitting para separar React, Radix, dados tRPC, ícones e as rotas Moltbook/Modules. Na validação final, o chunk de entrada ficou em 45,09 kB, o chunk `Modules` em 73,91 kB, o vendor de dados em 74,37 kB e o vendor React em 498,18 kB. O build não emitiu o aviso anterior de chunk acima de 500 kB. O smoke test confirmou 11 rotas frontend e 3 contratos tRPC públicos.
