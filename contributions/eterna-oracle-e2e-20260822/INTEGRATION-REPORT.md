# Relatório de Integração — Oráculo de ETERNA

## Resultado

A carga do Oráculo de ETERNA foi adicionada de forma **aditiva e isolada** ao repositório `Nexus-HUB57/More_Ideas_the_Dragon`, na branch `contrib/eterna-oracle-e2e-20260822`. A branch principal não foi modificada diretamente.

| Verificação | Resultado |
|---|---|
| Caminho da contribuição | `contributions/eterna-oracle-e2e-20260822/` |
| Arquivos rastreados na contribuição | 95 |
| Arquivos-fonte inventariados | 91 |
| Arquivos fora do namespace | 0 |
| Exclusões no diff contra `main` | 0 |
| Alteração do README raiz | Não |
| Sintaxe Python (`eterna_psbt_forge.py`, `eterna_signer.py`) | Aprovada |
| Integridade do ZIP | Aprovada |
| Verificação SHA-256 dos arquivos-fonte | Aprovada |
| ZIP versionado no Git | Sim |
| Estado local após push | Limpo |

## Conteúdo

A contribuição inclui os scripts de PSBT, o simulador de assinatura do Cold Vault, o backend e dashboard disponíveis no workspace, documentos de apoio, manifestos de inventário e o pacote `manifests/eterna-oracle-e2e-20260822.zip`.

O inventário é baseado nos arquivos realmente encontrados. A solicitação mencionava uma faixa de 295 a 299 arquivos, mas não foram criados arquivos artificiais para atingir essa quantidade. A fonte de verdade para a quantidade efetiva é `manifests/source-files.txt`, acompanhado de `manifests/source-sha256.txt`.

## Proteções

Não foram usados `force-push`, `reset --hard`, remoções de arquivos existentes, sobrescrita de caminhos da raiz ou reescrita de histórico. O commit foi restrito ao namespace da contribuição. O README raiz e os demais arquivos da branch base permanecem preservados.

Arquivos de credenciais, chaves privadas, certificados, ambientes, caches, dependências instaladas e logs não foram incluídos. O simulador de assinatura deve continuar sendo tratado como simulação; este pacote não autoriza transmissão de fundos reais.

## Revisão

A revisão deve ocorrer por Pull Request, sem merge automático:

`https://github.com/Nexus-HUB57/More_Ideas_the_Dragon/compare/main...contrib/eterna-oracle-e2e-20260822`

A equipe deve revisar o conteúdo de `source/backend`, `source/dashboard` e dos scripts de PSBT antes de qualquer merge ou uso operacional.

## Proveniência

Inventário e validações executados em 22 de agosto de 2026. O hash SHA-256 do ZIP versionado deve ser consultado diretamente com `sha256sum` após o clone da branch, pois a verificação local é a autoridade do artefato baixado.

> Este relatório documenta uma integração de código para revisão. Não é uma certificação de segurança operacional, auditoria criptográfica ou autorização para uso em mainnet.


## Referências

[1]: https://github.com/Nexus-HUB57/More_Ideas_the_Dragon "Repositório More_Ideas_the_Dragon"
[2]: https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki "BIP-174: Partially Signed Bitcoin Transaction Format"
[3]: https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki "BIP-173: Base32 address format for native v0-16 witness outputs"

Este relatório utiliza a documentação pública do repositório e das especificações Bitcoin como referências de contexto [1] [2] [3].
