# Nexus Frontend - TODO

## Integração WebSocket e Contexto Global
- [x] Integrar WebSocketContext.tsx no App.tsx para prover contexto global
- [x] Adicionar WebSocketProvider ao layout principal
- [x] Implementar indicadores visuais de status de conexão

## Hooks Customizados de WebSocket
- [x] Criar hook useWebSocketMetrics com subscrição automática
- [x] Criar hook useWebSocketAlerts com subscrição automática
- [x] Criar hook useWebSocketEvents com subscrição automática
- [x] Criar hook useWebSocketMarket com subscrição automática
- [x] Criar hook useWebSocketConnection para status de conexão
- [x] Criar hook useWebSocketReconnection para lógica de reconexão

## Componentes Principais
- [x] Implementar Dashboard.tsx com layout elegante
- [x] Implementar VitalLoopMonitor.tsx para monitoramento de agentes
- [x] Implementar MarketFeed.tsx para dados de mercado em tempo real
- [x] Implementar GnoxTerminal.tsx com integração WebSocket
- [x] Implementar OrchestratorView.tsx para visualização de missões

## Sistema de Notificações
- [x] Criar sistema de notificações toast para alertas
- [x] Integrar notificações com eventos WebSocket
- [x] Adicionar diferentes tipos de notificações (sucesso, erro, aviso, info)

## Tratamento de Erros e Reconexão
- [x] Implementar lógica de reconexão automática
- [x] Adicionar tratamento de desconexão inesperada
- [x] Criar feedback visual para estados de erro
- [x] Implementar retry com backoff exponencial

## Testes e Validação
- [ ] Criar testes para hooks de WebSocket
- [ ] Criar testes para componentes principais
- [ ] Validar reconexão automática
- [ ] Testar tratamento de erros

## Estilo e Design
- [ ] Aplicar design elegante e consistente
- [ ] Implementar tema dark/light
- [ ] Adicionar animações suaves
- [ ] Garantir responsividade

## Documentação
- [ ] Documentar hooks customizados
- [ ] Documentar estrutura de componentes
- [ ] Criar guia de uso do WebSocket


## Operação GitHub segura - povoamento end to end
- [ ] Inspecionar branches, commits, status e árvore do repositório remoto antes de qualquer alteração
- [ ] Inventariar todos os artefatos da tarefa e definir uma área isolada no repositório
- [ ] Criar branch exclusiva e copiar os artefatos sem substituir ou remover conteúdo existente
- [ ] Gerar manifesto com contagem, tamanhos e checksums dos artefatos adicionados
- [ ] Executar validações do projeto, build e testes antes do commit
- [ ] Fazer commit atômico e rastreável apenas dos novos artefatos
- [ ] Publicar a branch remota sem tocar em branches de outros desenvolvedores
- [ ] Validar no GitHub o commit, a branch, a contagem e a integridade dos arquivos
- [ ] Registrar relatório final da operação e eventuais limitações
- [ ] Confirmar o número real de arquivos adicionados; não fabricar arquivos para atingir uma contagem não comprovada

## Testes e validação de UX
- [ ] Criar ou atualizar testes Vitest para hooks, integração e componentes alterados
- [ ] Executar testes e build após as alterações de UX
- [ ] Registrar resultado dos testes no manifesto da operação

## Histórico
- [ ] Preservar todos os itens anteriores e não excluir nem sobrescrever arquivos, commits ou pastas do repositório compartilhado

## Entrega do pacote
- [ ] Adicionar o ZIP original e/ou pacote auditável dos artefatos, se não houver duplicidade
- [ ] Entregar referência da branch e do commit para revisão/merge pelos mantenedores
- [ ] Anexar apenas artefatos gerados pela operação, sem expor segredos, caches ou dependências vendorizadas
- [ ] Verificar que nenhum .env, token, credencial, node_modules ou log sensível foi incluído

## Critérios de aceite
- [ ] Branch exclusiva criada com nome único
- [ ] Commit sem remoções e sem sobrescritas fora da área isolada
- [ ] Manifesto de integridade presente
- [ ] Validações executadas e resultados registrados
- [ ] Push concluído sem tocar em branches de terceiros
- [ ] Inventário final conferido no GitHub

## Observação de escopo
- [ ] Caso a tarefa não contenha exatamente 295 ou 299 arquivos distintos, registrar a contagem real em vez de criar conteúdo artificial
- [ ] Se houver artefatos duplicados ou nomes conflitantes, preservar ambos em subpastas isoladas e documentar a decisão
- [ ] Se o repositório tiver mudanças concorrentes novas, interromper o push e relatar para revisão manual

## Entrega consolidada
- [ ] Empacotar artefatos em ZIP sem incluir .git, node_modules, dist, caches ou segredos
- [ ] Calcular SHA-256 do ZIP e registrar no manifesto
- [ ] Registrar data, branch, commit e origem dos arquivos
- [ ] Disponibilizar branch/commit para revisão dos demais desenvolvedores
- [ ] Não fazer merge automático em main/master

## Pós-push
- [ ] Comparar árvore local com a árvore remota da branch publicada
- [ ] Confirmar ausência de arquivos deletados no diff do commit
- [ ] Confirmar que o ZIP é reproduzível a partir do conteúdo versionado
- [ ] Documentar qualquer limitação ou arquivo omitido por segurança

## Controle de concorrência
- [ ] Atualizar refs remotas antes de criar o commit
- [ ] Não rebasear, resetar ou forçar push em branches compartilhadas
- [ ] Usar branch com identificador único desta execução
- [ ] Parar se o remoto avançar de forma incompatível durante a operação
- [ ] Entregar para revisão humana antes de eventual merge

## Inventário final
- [ ] Listar arquivos novos por categoria
- [ ] Contar arquivos por categoria
- [ ] Conferir tamanhos e checksums
- [ ] Conferir que cada arquivo relevante da tarefa tem origem documentada
- [ ] Conferir que documentação, scripts e código foram incluídos
- [ ] Conferir que nenhum artefato essencial foi descartado

## Governança
- [ ] Usar somente comandos não destrutivos
- [ ] Não executar git reset --hard
- [ ] Não executar git clean -fd
- [ ] Não executar git push --force
- [ ] Não remover arquivos existentes para resolver conflitos
- [ ] Não sobrescrever nomes existentes fora da área de importação
- [ ] Comunicar claramente o que foi adicionado e o que ficou pendente

## Resultado esperado
- [ ] Repositório povoado em branch isolada com todos os artefatos elegíveis desta tarefa
- [ ] Commit atômico e auditável
- [ ] ZIP versionado quando seguro e não redundante
- [ ] Validação end to end registrada
- [ ] Mantenedores aptos a revisar e mesclar sem risco às operações paralelas

## Proteção contra duplicidade
- [ ] Verificar se o ZIP já existe no remoto antes de adicionar
- [ ] Verificar se os arquivos já existem pelo caminho e SHA-256
- [ ] Evitar duplicar artefatos idênticos
- [ ] Preservar cópias distintas em caminhos diferentes quando o conteúdo divergir

## Finalização
- [ ] Salvar relatório da operação no repositório
- [ ] Salvar manifesto de arquivos adicionados
- [ ] Salvar checksum do pacote
- [ ] Confirmar commit remoto via gh
- [ ] Entregar branch, commit e instruções de revisão

## Regra de contagem
- [ ] Reportar a contagem efetivamente adicionada, mesmo que seja menor ou maior que 295/299
- [ ] Nunca inventar arquivos, scripts ou documentos apenas para alcançar a contagem solicitada
- [ ] Manter arquivos fundamentais originais e não eliminar duplicatas sem aprovação

## Segurança de dados
- [ ] Fazer varredura por credenciais antes do commit
- [ ] Excluir apenas artefatos gerados e sensíveis fora do escopo, nunca arquivos já existentes no repo
- [ ] Não incluir tokens, cookies ou dumps
- [ ] Registrar omissões de segurança no relatório

## Auditoria
- [ ] Registrar baseline do remoto
- [ ] Registrar lista de arquivos existentes antes da operação
- [ ] Registrar lista de arquivos adicionados
- [ ] Registrar diff estatístico
- [ ] Registrar hash do commit e do ZIP
- [ ] Registrar validações e seus códigos de saída

## Entrega aos demais devs
- [ ] Fornecer branch para cherry-pick ou pull request
- [ ] Não mergear automaticamente
- [ ] Explicar área isolada criada
- [ ] Explicar procedimento de rollback por revert do commit, se necessário
- [ ] Aguardar aprovação humana para integração em branch compartilhada

## Fechamento
- [ ] Atualizar este TODO com os resultados reais
- [ ] Fazer checkpoint do projeto local se aplicável
- [ ] Encerrar apenas depois de validação end to end ou de relatório explícito de bloqueio

## Acompanhamento da solicitação atual
- [ ] Clonar Nexus-HUB57/More_Ideas_the_Dragon usando GitHub CLI
- [ ] Povoar o repo com os artefatos elegíveis da tarefa atual
- [ ] Commitar e publicar a branch isolada
- [ ] Validar a operação no remoto
- [ ] Reportar a contagem real sem extrapolar o inventário
- [ ] Entregar o ZIP e os documentos de auditoria na branch

## Arquivos excluídos intencionalmente do pacote
- [ ] Registrar aqui arquivos ignorados por conterem dependências, caches, logs, segredos ou artefatos gerados

## Aprovação
- [ ] Aguardar revisão dos mantenedores antes de mergear em main/master

## Nota operacional
- [ ] Caso haja conflito de nome, usar um caminho versionado e não sobrescrever o original
- [ ] Caso o ZIP original seja idêntico a um arquivo existente, manter apenas uma cópia e registrar a deduplicação
- [ ] Caso existam mudanças não commitadas locais, preservá-las e não misturá-las ao commit da publicação

## Check final
- [ ] Nenhuma remoção no commit
- [ ] Nenhuma sobrescrita fora da pasta isolada
- [ ] Nenhum push forçado
- [ ] Nenhuma alteração em branches de terceiros
- [ ] Todos os arquivos adicionados rastreados no commit
- [ ] Todos os artefatos elegíveis documentados
- [ ] Relatório final entregue

## Status desta operação
- [ ] Em andamento

## Encerramento do pedido atual
- [ ] Finalizar somente após push e validação remota, salvo bloqueio comunicado

## Garantia de escopo
- [ ] Preservar o conteúdo original do projeto Nexus e do repositório GitHub
- [ ] Não assumir que a meta numérica 295/299 corresponde à quantidade real disponível
- [ ] Documentar diferenças entre a solicitação e o inventário efetivo

## Revisão humana
- [ ] Criar PR ou indicar branch para revisão, sem merge automático

## Arquivo de operação
- [ ] Manter manifest.json e relatório.md dentro da área isolada
- [ ] Manter ZIP dentro da área isolada
- [ ] Manter lista de origem dos arquivos

## Conclusão
- [ ] Operação concluída com rastreabilidade
- [ ] Operação bloqueada e motivo documentado
- [ ] Operação aguardando decisão dos mantenedores

## Última verificação
- [ ] Reexecutar git status --short na branch da operação
- [ ] Reexecutar diff --check
- [ ] Confirmar que o commit contém apenas adições na pasta isolada
- [ ] Confirmar hash remoto
- [ ] Confirmar arquivo de relatório final

## Confirmação de integridade
- [ ] Arquivos de código íntegros
- [ ] Documentos íntegros
- [ ] Scripts íntegros
- [ ] ZIP íntegro
- [ ] Manifesto íntegro

## Resultado para o usuário
- [ ] Entregar nome da branch
- [ ] Entregar SHA do commit
- [ ] Entregar contagem de arquivos
- [ ] Entregar caminho da área isolada
- [ ] Entregar limitações

## Fim
- [ ] Finalizar com segurança, sem modificar conteúdo de terceiros
