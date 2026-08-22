# Importação segura — DiagnosticPanel

## Proveniência

Este diretório preserva, sem sobrescrita, o artefato recebido em `/home/ubuntu/upload/DiagnosticPanel.zip`. A importação foi realizada em uma branch isolada baseada no commit remoto mais recente de `origin/main`.

> **Regra de segurança:** os arquivos foram mantidos sob um caminho novo de importação. Nenhum arquivo, pasta, commit ou branch existente foi excluído ou substituído.

## Escopo confirmado

O arquivo ZIP recebido contém **8 arquivos**, e não 299 arquivos individuais. A contagem foi obtida diretamente da tabela central do ZIP, preservando o conteúdo byte a byte. O conjunto contém dois componentes de interface, um painel de pesquisa, um painel oncológico, um arquivo de notas, o aplicativo de referência, o servidor de referência e o manifesto de dependências.

| Arquivo | Finalidade presumida | Preservado como |
|---|---|---|
| `App.tsx` | Aplicação React de referência | `source/App.tsx` |
| `DiagnosticPanel.tsx` | Painel de diagnóstico | `source/DiagnosticPanel.tsx` |
| `EradicationPanel.tsx` | Validação de intervenção clínica | `source/EradicationPanel.tsx` |
| `Ex.ONC.txt` | Material textual de referência | `source/Ex.ONC.txt` |
| `OncoResearchPanel.tsx` | Painel de pesquisa oncológica | `source/OncoResearchPanel.tsx` |
| `ResearchDashboard.tsx` | Dashboard de pesquisa | `source/ResearchDashboard.tsx` |
| `package.json` | Dependências e scripts do pacote recebido | `source/package.json` |
| `server.ts` | Servidor de referência | `source/server.ts` |

O ZIP original também permanece em `DiagnosticPanel.zip` para recuperação e auditoria futura.

## Verificação

A validação deve conferir o SHA-256 do ZIP e dos oito arquivos contra o arquivo `SHA256SUMS.txt`, além de executar `git diff --check`, verificar que somente este novo diretório está pendente e validar o build do projeto sem substituir o manifesto de dependências do repositório hospedeiro.

Os arquivos em `source/` são um **snapshot de referência** e não alteram automaticamente o runtime do projeto. Essa separação evita introduzir uma substituição silenciosa de `App.tsx`, `server.ts` ou `package.json` compartilhados por outros desenvolvedores. Qualquer integração funcional posterior deve ser feita em uma mudança revisável e específica, preservando os arquivos atuais.

## Contexto dos repositórios

A auditoria confirmou que `AI_Doctor` já contém versões versionadas de `src/components/DiagnosticPanel.tsx`, `src/components/EradicationPanel.tsx` e `src/components/ResearchDashboard.tsx` no `origin/main`. Portanto, este import é mantido como evidência e snapshot completo do pacote recebido, sem duplicar esses nomes na raiz nem alterar o estado de `AI_Doctor`.

## Procedimento de recuperação

Para restaurar o artefato em outro checkout, copie o ZIP ou os arquivos de `source/` para uma área de trabalho temporária e compare os hashes antes de qualquer integração. Não extraia o pacote diretamente sobre a raiz de um checkout compartilhado.

## Data

2026-08-22 (UTC)

## Branch de trabalho

A branch que contém esta importação é informada no relatório de publicação e deve ser revisada antes de qualquer merge em `main`.

> Este documento descreve o conteúdo efetivamente recebido; ele não afirma a existência de 299 arquivos quando o artefato fornecido contém 8.

---

## Checklist de segurança

- [x] Branch isolada criada a partir do `origin/main` atualizado.
- [x] Caminho de importação novo e sem colisões.
- [x] ZIP original preservado.
- [x] Conteúdo extraído sem sobrescrever arquivos existentes.
- [ ] Hashes e build registrados no relatório final após a validação.
- [ ] Push da branch concluído após o commit local.
- [ ] Nenhuma alteração direta em `main`.

---

## Observação sobre material clínico

O conteúdo recebido é mantido como material de software e referência. Resultados ou textos clínicos presentes nos componentes não devem ser interpretados como diagnóstico, recomendação terapêutica ou validação médica real sem revisão profissional e fontes clínicas verificáveis.
