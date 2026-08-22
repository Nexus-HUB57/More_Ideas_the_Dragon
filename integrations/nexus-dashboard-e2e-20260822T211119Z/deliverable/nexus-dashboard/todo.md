# Checklist — Integração Segura Nexus-HUB

- [ ] Clonar `Nexus-HUB57/More_Ideas_the_Dragon` sem alterar o repositório remoto.
- [ ] Registrar branch atual, branches remotas, último commit e estado da árvore.
- [ ] Inventariar os artefatos reais disponíveis desta tarefa e contar arquivos por origem.
- [ ] Criar uma área de integração isolada, sem substituir caminhos existentes.
- [ ] Gerar manifesto com caminho relativo, tamanho e SHA-256 de cada arquivo integrado.
- [ ] Criar ZIP end to end dos artefatos integrados e calcular seu SHA-256.
- [ ] Verificar colisões de nomes e interromper a cópia caso haja risco de sobrescrita.
- [ ] Validar que nenhum arquivo existente foi removido ou modificado.
- [ ] Criar branch dedicada com nome rastreável.
- [ ] Comitar somente novos arquivos da área isolada, incluindo manifesto e ZIP.
- [ ] Enviar a branch para o GitHub sem fazer push em `main` ou reescrever histórico.
- [ ] Revisar diff, commit, branch remota e contagem final de arquivos.
- [ ] Entregar ao usuário os links e evidências da validação end to end.

## Regra de segurança

Não usar `reset --hard`, `clean -fd`, `push --force`, remoções em massa ou comandos que reescrevam histórico. Qualquer colisão deve ser reportada antes de prosseguir.

## Critério de contagem

A contagem final refletirá somente arquivos reais disponíveis e integrados. Não serão criados arquivos artificiais para atingir 299 itens.

## Estado

- Fase: auditoria inicial.
- Status: pendente de clonagem e inspeção do repositório alvo.
- Última atualização: 2026-08-22.

## Referências

- Repositório alvo: https://github.com/Nexus-HUB57/More_Ideas_the_Dragon
- Repositório de origem relacionado: https://github.com/Nexus-HUB57/nexus-hub
- Projeto de dashboard local: `/home/ubuntu/nexus-dashboard`
- Checkpoint do dashboard: `822eb836`
- Projeto web: `manus-webdev://822eb836`

## Observação sobre dados

Arquivos compactados existentes serão tratados como artefatos binários e não serão extraídos ou executados automaticamente. O conteúdo será apenas inventariado e empacotado de forma passiva.
