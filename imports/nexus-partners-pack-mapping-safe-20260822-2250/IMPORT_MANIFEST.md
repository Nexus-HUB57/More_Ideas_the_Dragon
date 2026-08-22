# Nexus Partners Pack — Importação segura

**Identificador da operação:** `nexus-partners-pack-mapping-safe-20260822-2250`

**Objetivo:** preservar e disponibilizar, em área isolada, os artefatos do Nexus Partners Pack e o mapeamento NPP → XP/MMN, sem substituir ou remover arquivos do repositório-alvo.

## Protocolo aplicado

A importação foi criada em um diretório novo dentro de `imports/`. Nenhum arquivo existente foi editado, removido ou substituído. O conteúdo foi copiado como snapshot de referência, mantendo a estrutura relativa dos domínios Partners, XP, Event Bus, documentação do Partners Pack e material de packs.

O repositório-alvo já possuía um pacote validado de população 001–299 (`task_artifacts/population_01_299_20260822.zip`), com **305 entradas ZIP**. Esse pacote permanece intacto e é referenciado como artefato pré-existente; não foi sobrescrito.

## Conteúdo desta importação

| Área | Conteúdo |
|---|---|
| `input/` | Arquivo original fornecido nesta tarefa (`pasted_content.txt`) |
| `source_snapshot/nexus-partners-pack-dev/` | Especificações, roadmap, status, releases e relatórios do Nexus Partners Pack |
| `source_snapshot/packs/` | Documentação de packs |
| `source_snapshot/backend/src/domains/partners/` | Tipos, eventos, serviço, repositório, router e subscribers do domínio Partners |
| `source_snapshot/backend/src/domains/xp/` | Eventos, router e exports do domínio XP |
| `source_snapshot/backend/src/_core/events/` | Event Bus e subscriber de auditoria |
| `end-to-end/` | Pacote ZIP auto-contido da importação |

## Contagem registrada

- Arquivos copiados inicialmente para a área isolada: **25**.
- Pacote 001–299 pré-existente validado no alvo: **305 entradas ZIP**.
- Estado do alvo antes da operação: branch `main`, working tree limpo.

## Validação

Após a criação do ZIP, `SHA256SUMS.txt` deve conter o checksum de cada arquivo da importação. A conferência recomendada é executar `sha256sum -c SHA256SUMS.txt` a partir deste diretório.

## Commit e branch

A publicação deve ocorrer em branch dedicada, com commit único e descritivo. A branch `main` não deve ser alterada diretamente. O commit deve conter apenas o diretório desta operação e seus artefatos de auditoria.

## Nota de segurança

Este diretório é um snapshot de integração e não substitui automaticamente os arquivos ativos do sistema. Qualquer merge funcional deve ser revisado por outro desenvolvedor e feito em commit separado, com testes e revisão de diff.

## Origens auditadas

- Repositório-alvo: `Nexus-HUB57/More_Ideas_the_Dragon`
- Repositório-fonte: `Nexus-HUB57/MMN_AI-to-AI`
- Arquivo de entrada: `/home/ubuntu/upload/pasted_content.txt`
- Pacote 001–299 preexistente: `task_artifacts/population_01_299_20260822.zip`

> **Resultado esperado:** uma importação rastreável, reversível e não destrutiva, apta para revisão por outros desenvolvedores.

---

## Registro da operação

Este manifesto deve ser acompanhado por `REPO_AUDIT.txt`, `SHA256SUMS.txt` e pelo ZIP end-to-end gerado no mesmo diretório.

