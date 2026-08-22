# Nexus Hub V3 - Soberania Total

## Fase 2: Backend tRPC e Contêineres Dinâmicos (Finalizado)
- [x] Expandir schema.ts com 17 tabelas principais
- [x] Implementar índices para performance em queries críticas
- [x] Sincronizar routers.ts com routers-nexus.ts
- [x] Criar routers para agents (CRUD, listar, filtrar por status)
- [x] Criar routers para missions (criar, atualizar, delegação automática)
- [x] Criar routers para transactions (processar, distribuição 80/10/10)
- [x] Criar routers para ecosystem_events (registrar, consultar)
- [x] Criar routers para ecosystem_metrics (agregar, histórico)
- [x] Criar routers para brain_pulse, moltbook, notifications
- [x] Implementar autenticação e autorização (admin-only)

- [x] Revalidar o estado local e remoto antes de sincronizar.
- [x] Preservar branches, commits, arquivos e pastas existentes sem sobrescrita ou exclusão.
- [x] Sincronizar somente por fast-forward ou branch isolada.
- [x] Validar integridade do conteúdo e confirmar o estado final após a atualização.

## Testes de Integração e Propagação Remota — 2026-08-22

- [x] Enviar branch com os artefatos de importação e script de validação para o remoto `Nexus-HUB57/More_Ideas_the_Dragon`.
- [x] Executar o script de validação reutilizável (`scripts/safe_recovery/validate_nexus_dashboard_update.sh`) contra o repositório.
- [x] Validar integridade dos arquivos compactados (`.zip`) de importação.
- [x] Confirmar zero deleções de arquivos de outros desenvolvedores.

- [x] Corrigir o validador Safe Recovery para suportar clones limpos single-branch sem referência local `origin/main`.
- [ ] Registrar os fluxos JOB, Manus'crito, Nerd-PHD e Cronos no roteador tRPC ativo do dashboard.
- [ ] Adicionar testes de integração específicos para as procedures dos agentes IA.
- [ ] Investigar o encerramento 143 do build de produção sob a limitação de memória do sandbox.
- [x] Corrigir o harness de integração para compilar os fluxos `.ts` pelo reconhecimento nativo da extensão.
- [ ] Avaliar e remediar a presença de credenciais sensíveis no `.project-config.json` e nos ZIPs já publicados, sem expor valores.
- [x] Registrar decisão da opção A: manter os ZIPs inalterados e documentar o risco sem publicar o arquivo sensível.

## Operação de povoamento seguro — NexusAgenteIAHibrido e NexusTest
- [x] Auditar os ZIPs enviados, branches remotas, commits e colisões de caminhos.
- [x] Preparar importação aditiva em namespace isolado, sem sobrescrever arquivos existentes.
- [x] Sanitizar e registrar em manifesto arquivos de credenciais, chaves privadas, `.env` e outros segredos, sem versionar seus conteúdos.
- [x] Gerar ZIPs sanitizados e checksums para rastreabilidade end-to-end.
- [x] Validar diff, contagens, integridade Git e conteúdo do pacote antes do commit.
- [ ] Criar commit dedicado e publicar em branch de integração segura para revisão dos demais desenvolvedores.
- [ ] Confirmar o estado final do branch remoto e documentar arquivos, exclusões de segurança e hashes.
