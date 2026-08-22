# Nexus Hub - Fase 7: Terminal Gnox - TODO

## Banco de Dados
- [x] Adicionar tabelas: command_history, gnox_commands, command_suggestions
- [x] Criar migrations para schema da Fase 7

## Backend - GnoxTerminal
- [x] Implementar classe GnoxTerminal com processamento de comandos via LLM
- [x] Implementar 15+ comandos (missões, agentes, orquestração, recompensas, métricas, sistema)
- [x] Implementar gerenciamento de histórico de comandos com limite configurável
- [x] Implementar sugestões inteligentes de comandos
- [ ] Integrar com Mission Orchestrator da Fase 6
- [ ] Integrar com Reward Distribution da Fase 6
- [ ] Integrar com Mission Tracker da Fase 6
- [x] Escrever testes para GnoxTerminal (24+ testes)

## Backend - Routers tRPC
- [x] Implementar router gnox.executeCommand
- [x] Implementar router gnox.getCommandHistory
- [x] Implementar router gnox.getAvailableCommands
- [x] Implementar router gnox.clearHistory

## Backend - WebSocket & Eventos
- [ ] Configurar WebSocket para eventos em tempo real
- [ ] Implementar eventos: gnox:command_executed
- [ ] Implementar eventos: gnox:command_error
- [ ] Implementar eventos: gnox:mission_created
- [ ] Implementar eventos: gnox:mission_failed

## Frontend - GnoxTerminal.tsx
- [x] Implementar layout principal com tema cyberpunk dark
- [x] Implementar terminal output com histórico de comandos
- [x] Implementar campo de entrada de comandos com sugestões em tempo real
- [x] Implementar Quick Actions sidebar
- [x] Implementar painel de ajuda contextual
- [x] Implementar barra de status com métricas
- [x] Integrar com tRPC para executar comandos
- [x] Implementar scroll automático para novos comandos

## Frontend - Dashboard de Métricas
- [x] Implementar AdvancedMetricsDashboard com gráficos em tempo real
- [x] Implementar AlertsPanel com alertas visuais
- [x] Implementar TopPerformersPanel com análise de tendências
- [ ] Integrar com WebSocket para atualizações em tempo real

## Frontend - Tema Cyberpunk
- [x] Configurar paleta de cores (slate-950, cyan-500, pink-500)
- [x] Implementar bordas luminosas e efeitos de hover
- [x] Implementar gradientes neon pink→cyan
- [x] Adicionar backdrop blur e transparências

## Integração & Testes
- [x] Testar fluxo completo de comando
- [ ] Testar integração com Fase 6
- [ ] Testar eventos WebSocket
- [x] Testar sugestões de comandos
- [x] Validar tema cyberpunk em diferentes resoluções

## Deployment
- [ ] Criar checkpoint final
- [ ] Validar build e deployment

## Sincronização segura do repositório GitHub
- [ ] Auditar o repositório remoto, branches, commits e working tree antes de qualquer alteração
- [ ] Comparar todos os arquivos locais da tarefa com o conteúdo remoto sem sobrescrever arquivos existentes
- [ ] Preparar uma área de importação não destrutiva para arquivos novos e ausentes
- [ ] Gerar ZIP end-to-end contendo os arquivos da tarefa e manifesto de integridade
- [ ] Validar quantidade de arquivos, hashes, ausência de exclusões e preservação do histórico
- [ ] Criar commit separado com os arquivos novos e o ZIP
- [ ] Confirmar que o commit foi enviado ao GitHub e documentar o resultado
- [ ] Entregar o link do commit e o ZIP validado ao usuário
