# Auditoria Pré-Commit

## Resultado

| Verificação | Resultado |
|---|---|
| Base remota estável durante a auditoria | PASS — `origin/main` permaneceu em `edcc8f1ceeddbf99f144bc39ad9ab5d726f604c6` |
| Cobertura do manifesto antes deste relatório | PASS — 3.464 linhas e 3.464 arquivos fora do manifesto |
| Caminhos fora do namespace | PASS — zero |
| Arquivos staged fora do escopo permitido | PASS — somente `.gitattributes` e o namespace Jhon Riff's |
| Adições staged | PASS — somente novos arquivos |
| Deleções staged | PASS — zero |
| Renames staged | PASS — zero |
| ZIPs originais e bundles | PASS — `unzip -tqq` |
| Bundles grandes | PASS — Git LFS pointer configurado para os dois arquivos acima de 100 MB |
| Object database | PASS — `git fsck --full --no-reflogs` sem diagnóstico |

## Avisos preservados

`git diff --cached --check` sinalizou whitespace já presente em arquivos copiados do projeto moderno, incluindo linhas em branco finais e comentários com espaços. Esses bytes não foram normalizados para manter os arquivos da tarefa exatamente como recebidos. O aviso não indica alteração em arquivo preexistente do repositório.

A consulta opcional `git lfs ls-files --cached` não é suportada pela versão instalada do Git LFS. A validação equivalente foi feita verificando `git check-attr` e os ponteiros no índice, que começam com `version https://git-lfs.github.com/spec/v1` e correspondem aos SHA-256 registrados em `audit/BUNDLE_HASHES.tsv`.

## Condição de commit

O commit somente deve ser criado após regenerar o manifesto incluindo este relatório, executar `audit/verify_import.sh`, conferir novamente o SHA de `origin/main` e confirmar que não há deleções ou alterações fora do namespace. O push deverá ser normal e não forçado.
