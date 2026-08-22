# Pacote seguro de povoamento — AI_Doctor / DIMHEX

Este diretório contém uma importação isolada dos materiais-fonte relacionados ao Sistema de Diagnóstico e Pesquisa DIMHEX/Fênix. A importação foi realizada em uma branch dedicada, sem sobrescrever, mover ou excluir arquivos do repositório hospedeiro.

## Escopo importado

| Material | Local | Tratamento |
|---|---|---|
| Código-fonte disponível do AI_Doctor | `source/AI_Doctor/` | Copiado com preservação de conteúdo e sem dependências geradas |
| Especificação de processos oncológicos | `source/Ex.ONC.txt` | Preservada como fonte original da tarefa |
| Inventário e estado de segurança | `audit/` | Gerado para permitir verificação e recuperação |
| Scripts de validação | `scripts/` | Executáveis somente para auditoria local |

O repositório já continha **299 especificações técnicas numeradas**, de `docs/technical_spec_001.md` a `docs/technical_spec_299.md`. Esses arquivos não foram duplicados nem modificados; o inventário de referência confirma sua preservação no estado anterior à importação.

## Política de recuperação segura

> Nenhuma operação desta tarefa usa `git push --force`, `git reset --hard`, `git clean`, exclusão de branch, reescrita de histórico ou substituição de arquivos existentes.

A alteração é aditiva e está confinada a `task_artifacts/ai_doctor_dimhex_safe_population_20260822/`, além dos registros `.safe_audit/` gerados na branch. A `main` permanece intocada. A publicação deve ocorrer por branch e Pull Request, permitindo revisão dos demais desenvolvedores antes de qualquer eventual merge.

## Limitações técnicas registradas

O clone local disponível do AI_Doctor contém apenas `package.json`, `server.ts` e `src/App.tsx`. Não foram inventados arquivos ausentes, modelos clínicos, dados de pacientes, protocolos regulatórios ou resultados de eficácia. O conteúdo de `Ex.ONC.txt` é tratado como especificação de pesquisa e não como protocolo clínico autorizado.

Qualquer uso médico real exigiria revisão científica, validação pré-clínica, aprovação ética e regulatória, controles de biossegurança e validação clínica independente. O código aqui preservado não controla equipamento médico nem deve ser conectado a um circuito extracorpóreo.

## Verificação

Execute `scripts/validate_safe_population.sh` a partir deste pacote para conferir hashes, contagens, ausência de colisões e os 299 arquivos de especificação existentes no repositório hospedeiro.

## Proveniência

A origem dos arquivos foi registrada em `audit/source_manifest.sha256`. O estado do repositório antes da importação está em `.safe_audit/pre_population_state.txt` e a lista de arquivos rastreados anteriormente está em `.safe_audit/tracked_files_before.txt`.

## Política de integração

O pacote deve ser revisado em Pull Request. Em caso de conflito, prevalece o conteúdo já existente no repositório; a resolução deve ocorrer por decisão explícita dos mantenedores, nunca por sobrescrita automática.

Autor: **Manus AI**
Data da coleta: 2026-08-22
