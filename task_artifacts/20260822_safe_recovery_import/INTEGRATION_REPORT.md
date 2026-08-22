# Relatório de integração segura — 22/08/2026

## Escopo

Este pacote registra a auditoria e a preparação não destrutiva dos artefatos recebidos nesta tarefa para o repositório `Nexus-HUB57/More_Ideas_the_Dragon`. A integração ocorre em uma branch dedicada, sem reescrever histórico, remover arquivos ou alterar a branch `main`.

## Regra de segurança

> Arquivos que contenham chaves privadas, sementes, credenciais, tokens, senhas, dumps de carteiras, dicionários de cracking ou material equivalente não devem ser versionados em um repositório Git, mesmo quando o objetivo declarado seja recuperação.

Esses itens permanecem fora do pacote e são representados apenas por metadados e hashes locais quando necessário. O conteúdo não é copiado, exibido, executado ou transmitido.

## Conteúdo versionável

| Artefato | Finalidade |
|---|---|
| `README.md` | Explica o escopo e o fluxo de revisão. |
| `MANIFEST.tsv` | Registra nome, tamanho, hash e classificação dos anexos, sem incluir o conteúdo. |
| `validate_manifest.py` | Valida o manifesto e falha fechado diante de nomes sensíveis não classificados. |
| `INTEGRATION_REPORT.md` | Este relatório para revisão dos colaboradores. |

## Conteúdo não versionado

O pacote não inclui chaves privadas, arquivos de carteira, credenciais, tokens de API, senhas, sementes, listas de palavras para quebra de senha, arquivos de backup ou scripts que derivem, assinem, transmitam ou movimentem fundos. Também não será criado workflow que execute força bruta, assinatura ou broadcast automático.

## Procedimento de revisão

A branch deve ser revisada por pelo menos um mantenedor antes de qualquer merge. A revisão deve confirmar o diff, os nomes de arquivos, o resultado do validador e a ausência de segredos. Nenhum `force push`, reset destrutivo, exclusão ou alteração direta de `main` faz parte deste procedimento.

## Resultado esperado

A branch contém somente documentação e validações de segurança. Ela não executa recuperação de carteiras nem movimentação de Bitcoin. A publicação de qualquer artefato operacional exigiria uma revisão independente de segurança, autorização legal e armazenamento apropriado fora do Git.

## Referências

[1]: https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning "GitHub Secret Scanning"
[2]: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository "GitHub — Managing files"
[3]: https://bitcoin.org/en/secure-your-wallet "Bitcoin.org — Secure your wallet"

### References

[1] [GitHub Secret Scanning][1]  
[2] [GitHub — Managing files][2]  
[3] [Bitcoin.org — Secure your wallet][3]
