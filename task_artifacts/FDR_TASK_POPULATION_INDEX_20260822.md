# Índice de Povoamento Seguro — FDR Wallet Dashboard

## Resultado da auditoria de escopo

O repositório `Nexus-HUB57/More_Ideas_the_Dragon` já contém bundles históricos de 001–299 e vários arquivos de manifesto. A main possui, entre outros, `nexus_phd_final_bundle_299` com 298 arquivos, `nexus_hub_phd_bundle_299` com 298 arquivos e `nexus_academia_phd_bundle_299` com 303 arquivos, além de arquivos ZIP 299 existentes. Esses conjuntos são tratados como patrimônio de outros desenvolvedores e não foram substituídos, removidos ou recriados.

A origem desta tarefa contém 130 arquivos locais, sendo 128 rastreados pelo Git. A comparação de hashes encontrou 87 correspondências exatas no bundle FDR anterior, 30 caminhos com conteúdo diferente e 13 arquivos ausentes naquele bundle. Para manter o histórico e evitar colisões de caminhos, os 128 arquivos rastreados foram empacotados em um namespace novo e exclusivo.

## Pacote adicionado

O novo namespace é `task_artifacts/fdr_wallet_dashboard_end_to_end_20260822/`. Ele contém 132 arquivos: 128 arquivos da origem, um README, um manifesto TSV com SHA-256, um manifesto `.sha256` e uma lista de exclusões. O arquivo `task_artifacts/fdr_wallet_dashboard_end_to_end_20260822.zip` é a cópia arquivística do namespace completo.

Três arquivos de origem que continham marcadores de senha de exemplo foram sanitizados antes da cópia, com nove substituições por `REDACTED_SECRET_PLACEHOLDER`. Nenhuma WIF, seed, chave privada, passphrase, token, API key, wallet plaintext ou arquivo de cofre cifrado foi incluído.

## Protocolo Safe Recovery

A integração foi criada a partir da main atual em branch isolado. O staging deve permanecer explícito e limitado ao namespace novo, ao índice e ao ZIP. Não deve haver merge direto na main, `git reset --hard`, remoção de branches ou exclusão de arquivos históricos. A pull request deve ser revisada por outro desenvolvedor antes do merge.

A validação consiste em conferir o manifesto SHA-256 a partir do diretório do pacote, listar o conteúdo do ZIP, executar a varredura redigida de segredos e confirmar que o diff contém apenas adições dentro de `task_artifacts/`.

> Este índice documenta povoamento de código, testes e documentação. Não autoriza operações financeiras, assinatura PSBT, broadcast Mainnet ou armazenamento de chaves privadas no Git.
