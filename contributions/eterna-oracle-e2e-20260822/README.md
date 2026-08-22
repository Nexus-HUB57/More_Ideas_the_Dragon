# ETERNA — Pacote End-to-End Isolado

Esta pasta contém os artefatos disponíveis do **Oráculo de ETERNA** reunidos para revisão e integração no ecossistema `More_Ideas_the_Dragon`. O conteúdo está em um namespace próprio para evitar colisões com arquivos, pastas e documentação de outros desenvolvedores.

## Escopo

O pacote reúne os scripts de forja e assinatura simulada de PSBT, os artefatos recuperados do backend Flask, o projeto frontend do dashboard e os documentos técnicos disponíveis no workspace. O inventário completo está em `manifests/source-files.txt`, e os hashes SHA-256 estão em `manifests/source-sha256.txt`.

O pacote ZIP correspondente é `manifests/eterna-oracle-e2e-20260822.zip`. Ele é uma distribuição de revisão e não substitui o conteúdo já existente na raiz do repositório.

## Proteções aplicadas

Nenhum arquivo existente da branch principal foi substituído ou removido. Não foi utilizado `force-push`, reescrita de histórico ou operação destrutiva. Arquivos de credenciais, ambientes, chaves privadas, certificados e logs foram excluídos da carga. O inventário reflete os arquivos realmente encontrados no workspace; nenhum arquivo artificial foi criado para atingir uma contagem predeterminada.

## Validação

Antes do commit, serão executadas validações de sintaxe dos scripts Python, geração local da PSBT de teste, verificação de leitura do ZIP e conferência dos hashes. A branch de integração é `contrib/eterna-oracle-e2e-20260822`; a branch `main` não será alterada diretamente.

> A assinatura presente em `eterna_signer.py` é uma simulação de fluxo. Não deve ser tratada como assinatura criptográfica de produção nem usada para transmitir fundos reais.

## Revisão recomendada

A aprovação deve ocorrer por Pull Request. A equipe deve revisar principalmente `source/backend`, `source/dashboard` e os scripts de PSBT antes de qualquer merge. O pacote deve permanecer separado até que a equipe confirme a destinação e a política de retenção dos artefatos.

## Arquivos deliberadamente não incluídos

O pacote não inclui `.git`, `node_modules`, caches, logs, bancos locais, arquivos `.env`, `credentials.json`, chaves privadas, certificados ou artefatos equivalentes. Esses itens não são necessários para a revisão do código e poderiam expor material sensível ou gerar ruído no repositório.

## Observação sobre a contagem solicitada

A solicitação menciona uma faixa de 295 a 299 arquivos. A quantidade efetiva deve ser baseada no inventário verificável dos artefatos da tarefa, não em preenchimento artificial. Nesta carga, o inventário será a fonte de verdade e ficará versionado junto com seus hashes.

---

**Proveniência:** workspace local desta tarefa, inventariado em 22 de agosto de 2026.  
**Branch:** `contrib/eterna-oracle-e2e-20260822`  
**Política:** integração aditiva e reversível.


## Referências

[1]: https://github.com/Nexus-HUB57/More_Ideas_the_Dragon "Repositório More_Ideas_the_Dragon"
[2]: https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki "BIP-174: Partially Signed Bitcoin Transaction Format"
[3]: https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki "BIP-173: Base32 address format for native v0-16 witness outputs"

> Este documento descreve o pacote de integração; não constitui autorização para operar ou transmitir fundos reais.
