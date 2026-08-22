# FDR Dashboard — Safe Population Package

Este diretório contém os artefatos produzidos nesta tarefa para o dashboard Bitcoin/FDR/PESBM, incorporados em uma área isolada e com nome exclusivo para evitar colisões com o trabalho de outros desenvolvedores.

## Conteúdo

O pacote inclui as implementações Flask e React, a documentação técnica e os relatórios produzidos, além dos inventários e hashes dos oito arquivos ZIP recebidos. O conteúdo foi copiado sem `.git`, ambientes virtuais, caches, bancos locais ou arquivos temporários.

## Política Safe Recovery

Nenhum arquivo ou commit existente do repositório foi sobrescrito ou excluído. A integração foi feita em uma branch própria e em um diretório novo dentro de `task_artifacts/`. Antes do commit, o estado da branch foi verificado contra o remoto.

## Tratamento de material sensível

Chaves privadas, WIF, xprv, seeds, passphrases e credenciais de API **não são material de versionamento**. Cópias sanitizadas substituem esses valores por marcadores `REDACTED_*`. Os arquivos ZIP que continham candidatos a material sensível não foram republicados como binários; seus nomes, contagens e hashes são preservados nos inventários para rastreabilidade.

A passphrase e credenciais anteriormente compartilhadas devem ser consideradas comprometidas e revogadas/rotacionadas imediatamente pelo proprietário. O dashboard deve receber somente endereços, xpubs ou credenciais injetadas por secret manager em ambiente de produção.

## Validação

A validação inclui contagem de arquivos, verificação de hashes, varredura de padrões de segredo e checagem sintática dos módulos Python/JavaScript. O arquivo `MANIFEST.sha256` registra o hash dos arquivos incorporados e o arquivo `source_archives_inventory/SHA256SUMS.txt` registra os hashes dos arquivos ZIP de origem.

## Escopo

Este pacote é uma integração de código e documentação. Ele não executa transações, não importa chaves privadas e não constitui prova de saldo ou de operação financeira real. Qualquer operação mainnet exige revisão independente, assinatura externa e aprovação operacional fora deste repositório.

**Autor:** Manus AI
**Data:** 2026-08-22

## Referências

Os nomes dos arquivos de origem são preservados em `source_archives_inventory/*.members.txt`, sem execução de nenhum conteúdo recebido.
