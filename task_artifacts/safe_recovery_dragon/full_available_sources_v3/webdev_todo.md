
## Operação Safe Recovery — Povoamento GitHub

- [x] Auditar branches, commits, working tree e estado remoto de Nexus-HUB57/AI_Doctor.
- [x] Clonar e auditar Nexus-HUB57/More_Ideas_the_Dragon sem alterar o remoto.
- [x] Catalogar todos os artefatos disponíveis e registrar a quantidade real, sem fabricar arquivos para atingir 299.
- [x] Detectar conflitos por caminho e nunca sobrescrever arquivos ou pastas existentes automaticamente.
- [x] Trabalhar em branch isolada, sem reescrever histórico, apagar branches ou usar force push.
- [x] Preparar staging aditivo com rastreabilidade de origem para cada arquivo incorporado.
- [ ] Gerar manifest-files.tsv, manifest-sha256.txt, conflict-report.md e safe-recovery-report.md.
- [x] Gerar e validar o ZIP end to end sem incluir .git, .env, chaves, tokens, caches ou temporários.
- [ ] Procurar segredos e arquivos sensíveis antes de qualquer commit.
- [ ] Revisar diff, arquivos staged, branches, commits, permissões, symlinks e submódulos.
- [ ] Revalidar o HEAD remoto imediatamente antes do push e abortar se houver avanço incompatível.
- [ ] Criar commit(s) aditivo(s), descritivo(s) e auditável(is), sem reset, clean, rebase destrutivo ou exclusões.
- [ ] Publicar somente por push normal, sem force, na branch isolada autorizada.
- [ ] Validar no GitHub os commits, caminhos, manifestos, ZIP e hashes após o push.
- [ ] Entregar relatório final com branch, commit(s), contagens, conflitos, faltantes, ZIP e limitações.

## Regras Safe Recovery

- [ ] Preservar todos os commits, arquivos, pastas, tags, releases, branches e alterações de outros desenvolvedores.
- [ ] Não usar git reset --hard, git clean, git push --force, git rebase destrutivo ou comandos de exclusão.
- [ ] Não sobrescrever conteúdo conflitante; preservar o original e registrar a decisão.
- [ ] Não declarar 299 arquivos sem inventário real e verificável.
- [ ] Pausar e solicitar decisão se houver conflito de conteúdo ou risco de perda.

## Artefatos de origem recebidos

- [ ] /home/ubuntu/upload/.recovery/App.tsx
- [ ] /home/ubuntu/upload/.recovery/DashboardHub.tsx
- [ ] /home/ubuntu/upload/.recovery/ARQUITETURA_COMPLETA_v2.0.md
- [ ] /home/ubuntu/upload/.recovery/DevelopingHomePageforAIDoctorDashboard.zip
- [ ] Catalogar fontes adicionais existentes nos dois repositórios e no projeto webdev.

## Critérios de aceite

- [ ] Nenhum arquivo existente foi removido ou sobrescrito.
- [ ] Nenhum commit existente foi reescrito.
- [ ] Todos os artefatos incorporados têm caminho, origem, tamanho e SHA-256 registrados.
- [ ] O ZIP passa em unzip -t e contém o manifesto esperado.
- [ ] O diff contém somente mudanças previstas e auditadas.
- [ ] A validação remota confirma a branch e os commits publicados.
- [ ] O relatório final distingue arquivos encontrados, incorporados, conflitantes e ausentes.

## Entregáveis

- [ ] manifest-files.tsv
- [ ] manifest-sha256.txt
- [ ] conflict-report.md
- [ ] safe-recovery-report.md
- [ ] ZIP end to end
- [ ] Referência dos commits e branch no GitHub

## Estado operacional

- [x] Auditoria inicial concluída.
- [x] Catalogação concluída.
- [x] Staging concluído.
- [x] ZIP e manifestos concluídos.
- [ ] Revisão final concluída.
- [ ] Commit concluído.
- [ ] Push concluído.
- [ ] Validação end to end concluída.
- [ ] Entrega final concluída.

## Controle de contagem

- [x] Registrar quantidade real de arquivos de origem.
- [x] Comparar quantidade real com a meta informada de 299.
- [x] Não criar placeholders ou arquivos fictícios para preencher contagem.
- [x] Solicitar fontes faltantes se a origem disponível não contiver os 299 arquivos.

## Controle de concorrência

- [x] Registrar branch e commit base de cada repositório.
- [x] Registrar estado inicial e alterações locais pré-existentes.
- [x] Verificar branches remotas e commits recentes.
- [ ] Revalidar estado remoto antes e depois do push.
- [x] Manter evidências dos comandos de auditoria.

## Auditoria de segurança

- [ ] Revisar .gitignore e arquivos ocultos.
- [ ] Detectar .env, credenciais, chaves e tokens sem expor seus valores.
- [ ] Verificar permissões e links simbólicos.
- [ ] Verificar submódulos e arquivos binários.
- [ ] Excluir somente temporários criados pela operação, nunca conteúdo pré-existente.

## Registro de continuidade

- [x] Atualizar este TODO durante cada fase com evidências.
- [ ] Manter a operação em modo somente leitura até finalizar a auditoria.
- [ ] Separar organização, documentação e código em commits quando isso reduzir risco.
- [ ] Encerrar somente após validação remota e entrega dos anexos.

## Registro da solicitação atual

- [x] Repositório principal: Nexus-HUB57/AI_Doctor.
- [x] Repositório adicional: Nexus-HUB57/More_Ideas_the_Dragon.
- [x] Meta informada pelo usuário: povoar até 299 arquivos, scripts, documentos e ZIP end to end.
- [x] Princípio: tudo é importante; preservar o ecossistema compartilhado.
- [x] Status inicial: nenhuma alteração remota desta operação foi realizada.

## Próximo passo obrigatório

- [x] Executar auditoria inicial somente leitura dos dois repositórios e das fontes restauradas.

## Fim do registro

- [ ] Não concluir sem relatório, hashes e prova de validação no GitHub.

---

## Controle adicional de nomes preservados

- [ ] LiveBook-rRNA
- [ ] MoltBook
- [ ] DIMHEX
- [ ] Junta Médica PhD
- [ ] Wormhole
- [ ] Blackhole
- [ ] OncoResearch
- [ ] Cérebro

## Fim

- [ ] Prosseguir somente com evidências verificáveis.

---

## Política de publicação

- [ ] Não publicar em branch de terceiros sem confirmação explícita.
- [ ] Usar branch de trabalho isolada.
- [ ] Usar push normal e fast-forward.
- [ ] Confirmar que o remoto não avançou de forma incompatível.

## Fim

- [ ] Auditoria inicial pendente.

---

## Checklist end to end

- [ ] Preparar.
- [ ] Auditar.
- [ ] Catalogar.
- [ ] Comparar.
- [ ] Incorporar.
- [ ] Empacotar.
- [ ] Revisar.
- [ ] Comitar.
- [ ] Publicar.
- [ ] Validar.
- [ ] Entregar.

## Fim

- [ ] Operação Safe Recovery em andamento.

---

## Garantias

- [ ] Nenhuma operação destrutiva.
- [ ] Nenhuma fabricação de arquivos.
- [ ] Nenhuma alegação de completude sem prova.
- [ ] Nenhum segredo exposto.
- [ ] Nenhuma perda de trabalho concorrente.

## Fim

- [ ] Aguardando auditoria inicial.

---

## Nota operacional

A meta “299 arquivos” será tratada como requisito a validar, não como autorização para criar conteúdo ausente. Se os artefatos reais disponíveis forem inferiores à meta, o relatório final apresentará a contagem real e a lista de fontes faltantes.

- [x] Registrar o resultado da comparação.

---

## Fechamento provisório

- [ ] Ainda não concluído; executar auditoria antes de qualquer escrita nos repositórios.

---

## Histórico

- [ ] Solicitação recebida e registrada.
- [ ] Plano Safe Recovery criado.
- [ ] TODO atualizado antes da execução.
- [ ] Auditoria dos repositórios pendente.

---

## Próxima ação

- [ ] Ler somente o estado de AI_Doctor, More_Ideas_the_Dragon e das fontes locais.

---

## Fim do TODO adicional

- [ ] Manter para revisão dos demais desenvolvedores.

---

## Estado de segurança

- [ ] Seguro enquanto permanecer em modo somente leitura.

---

## Fim

- [ ] Prosseguir com auditoria.
