# Nexus-HUB Dashboard Task Import

Esta pasta contém uma importação isolada e não destrutiva dos artefatos da tarefa do Nexus-HUB. Nenhum arquivo ou pasta existente do repositório foi substituído ou removido. Os artefatos foram organizados em três namespaces: dashboard-project, agent-flows e source-archives.

## Conteúdo

| Namespace | Conteúdo |
|---|---|
| dashboard-project/ | Projeto web completo do dashboard, sem .git/, dependências instaladas ou logs locais de execução. |
| agent-flows/ | Fluxos TypeScript dos agentes JOB, Manus'crito, Nerd-PHD e Cronos restaurados da tarefa anterior. |
| source-archives/ | AgentesHUB.txt e o ZIP original fornecido pelo usuário, preservados byte a byte. |
| manifests/ | Inventário por SHA-256, tamanho, caminho relativo e ações tomadas durante a cópia. |

## Validação inicial

| Métrica | Valor |
|---|---:|
| Arquivos de artefatos no pacote de importação | 124 |
| Bytes nos artefatos do pacote | 40654633 |
| Arquivos adicionados ao repositório | 123 |
| Arquivos já existentes e idênticos | 0 |
| Conflitos preservados com sufixo de hash | 0 |

O manifesto manifests/files.tsv é a fonte de verdade para a validação de integridade do pacote. O arquivo manifests/actions.tsv registra cada decisão de cópia e comprova que conflitos não foram sobrescritos. O ZIP validado irmão imports/nexus-hub-dashboard-task-2026-08-22-validated.zip contém esta pasta completa.

## Política Safe Recovery

O conteúdo existente do repositório foi mantido intacto. A importação usa um namespace próprio em imports/, não executa git reset, não remove branches e não modifica arquivos preexistentes. Em caso de colisão futura, o arquivo de origem deverá ser preservado com sufixo de hash, nunca sobrescrito.
