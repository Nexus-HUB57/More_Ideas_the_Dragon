# Artefatos MMN AI-to-AI — Importação segura

Este diretório é um **namespace aditivo e isolado** para preservar a entrega do projeto MMN AI-to-AI sem substituir arquivos, pastas, commits ou branches existentes em `Nexus-HUB57/More_Ideas_the_Dragon`.

## Proveniência

| Campo | Valor |
|---|---|
| Repositório | `Nexus-HUB57/More_Ideas_the_Dragon` |
| Branch local | `integration/safe-mmnai-ai-20260822T132042Z` |
| Base da integração | `cac5b267769c678022b922c19e9f57279318f293` |
| ZIP de origem | `MMNAI-to-AI.zip` |
| SHA-256 do ZIP | `aa2a6540e4d56777ba5bf291a7d8ab6948f27271264c7b1b28f43db6faa26224` |
| Membros do ZIP | `3139` arquivos |
| Extração copiada | `3139` arquivos, `348` diretórios, `0` links simbólicos |
| Namespace | `artifacts/mmnai-to-ai/` |

O clone foi inicialmente observado em `f18d81044967c87ef05143ee51a3d585b697c7c5`. Durante a auditoria, o remoto avançou e a branch local foi fast-forwardada de forma segura até `cac5b267769c678022b922c19e9f57279318f293`, o `origin/main` mais recente observado. Nenhum commit remoto foi reescrito.

## Conteúdo

`source/MMNAI-to-AI.zip` preserva o ZIP original sem alteração. `source/extracted/` contém a extração integral, mantendo os caminhos internos originais. `audit/` contém snapshots, inventários, hashes, resultado do preflight, revisão de nomes sensíveis e evidências de preservação.

O repositório já possuía artefatos relacionados à série `001-299` em `artifacts/end-to-end/001-299`; esses arquivos existentes foram auditados, não substituídos e não removidos. A contagem real do ZIP foi preservada no manifesto: a solicitação mencionou `299`, mas o ZIP contém `3139` membros de arquivo.

## Protocolo Safe Recovery

A sincronização foi feita em branch local dedicada e por cópia para um caminho novo. Não foram usados `git reset --hard`, `git clean`, exclusões, sobrescritas de caminhos existentes, reescrita de histórico ou `push --force`. Nenhuma branch remota foi modificada.

Os arquivos importados foram tratados como dados. Nenhum script, binário, migration ou conteúdo executável foi executado durante a auditoria ou a cópia. O ZIP e o staging permanecem disponíveis fora do repositório para recuperação independente.

## Validação antes do commit

Antes de criar o commit, revisar:

- `git status --short --branch`;
- `git diff --check`;
- `git diff --stat -- artifacts/mmnai-to-ai/`;
- comparação de caminhos relativos e SHA-256 entre staging e destino;
- presença do ZIP original;
- ausência de modificações fora do namespace novo;
- atualização do `origin/main` imediatamente antes do commit.

O commit será local e permanecerá pendente de revisão humana. Nenhum push, deploy, pull request ou issue será realizado automaticamente.

## Manifests

Os principais registros estão em `audit/repository_snapshot.txt`, `audit/source_snapshot.txt`, `audit/final_preflight.txt`, `audit/source_files_relative.txt` e `audit/source_sha256_relative.txt`. O inventário e os hashes permitem verificação independente e repetível.

## Avisos

O conteúdo importado pode incluir código legado e bibliotecas de terceiros. Sua presença neste artefato não representa validação de segurança, licença, compatibilidade ou prontidão para produção. Segredos e arquivos sensíveis devem ser revisados pelos mantenedores antes da publicação.

## Próximos passos

1. Revalidar o remoto e confirmar que `origin/main` não avançou novamente.
2. Revisar os manifests, o diff e os candidatos sensíveis.
3. Criar o commit local de integração.
4. Revisar o commit com os demais desenvolvedores.
5. Fazer push somente mediante autorização explícita.

> Regra operacional: **adicionar, registrar, validar e aguardar revisão**. Não apagar, não sobrescrever e não reescrever histórico.

**Status:** importação aditiva concluída; validação e commit local pendentes.

