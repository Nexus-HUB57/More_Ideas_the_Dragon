# Import seguro — NexusAI-to-AI / Fase 7

Este pacote registra a importação não destrutiva dos artefatos da tarefa NexusAI-to-AI para o repositório `Nexus-HUB57/More_Ideas_the_Dragon`. A operação foi preparada em uma branch isolada baseada no HEAD mais recente de `origin/main` observado no preflight. Nenhum arquivo, pasta, branch ou commit existente foi removido ou sobrescrito.

| Item | Valor |
|---|---|
| Repositório | `Nexus-HUB57/More_Ideas_the_Dragon` |
| Branch de importação | `manus/nexus-ai-to-ai-fase7-safe-population-20260822-2338` |
| Diretório de importação | `_imports/nexus-ai-to-ai-fase7-20260822/` |
| Arquivo de origem | `NexusAI-to-AI.zip` |
| Integridade do ZIP de origem | validada com `unzip -t` |
| Estratégia | somente adicionar caminhos novos e isolados |

## Conteúdo

`source-archive/` contém os arquivos extraídos do pacote principal da tarefa, preservando os nomes e conteúdos não sensíveis. `web-project/` contém uma cópia rastreável do projeto web atual, sem o diretório Git, dependências vendorizadas, logs locais ou arquivos de ambiente. `nested-archives/` contém o pacote aninhado sanitizado e seus documentos de auditoria. O artefato `artifacts/nexus-ai-to-ai-fase7-20260822-end-to-end.zip` é uma cópia compactada do diretório de importação e inclui o manifesto de hashes. Para evitar duplicação desnecessária e manter o arquivo final abaixo do limite individual do GitHub, o ZIP end-to-end não repete os dois ZIPs internos que já estão preservados dentro de `source-archive/Booster_Nexus-Hibryd.SANITIZED.zip`; os conteúdos desses níveis internos permanecem disponíveis na árvore extraída em `nested-archives/`.

## Protocolo de recuperação segura

A importação não usa `git reset --hard`, force-push, remoção de branch, remoção de arquivo ou substituição de caminho existente. Antes do commit, a validação compara a lista de caminhos da base com a lista de caminhos pós-importação e exige que a diferença contenha apenas adições. O commit da importação será separado do histórico anterior para permitir revisão e rollback pelo próprio histórico Git.

## Observação operacional

O pacote original contém uma entrada de ambiente com potencial de credencial. Essa entrada não é publicada. Os nomes dos arquivos excluídos e o motivo estão documentados em `SECURITY_EXCLUSIONS.md`, sem expor valores secretos.
