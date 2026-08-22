# Relatório final — FDR Dashboard

## Escopo entregue

O ambiente recuperado foi atualizado para operar com **telemetria real da Bitcoin Mainnet em modo somente leitura**. O painel agora consulta altura do bloco, hash, horário do bloco, saldo confirmado, saldo não confirmado e contagem de transações do endereço público monitorado:

`113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug`

As consultas são feitas pelo backend através do Blockstream, com timeout e fallback explícito para estado offline. Nenhuma chave privada é enviada ao navegador, nenhum saldo é fabricado e nenhum fluxo de assinatura ou broadcast foi conectado ao painel.

## Atualizações implementadas

| Área | Resultado |
|---|---|
| Bloco Bitcoin | Altura, hash e horário do bloco atualizados pela Bitcoin Mainnet. |
| Data e horário | `fetchedAt`, `updatedAt` e horário do bloco apresentados em formato local. |
| Saldo | Saldo confirmado e não confirmado obtidos em satoshis e BTC. |
| Atualização automática | O frontend refaz a consulta a cada 30 segundos e ao recuperar o foco da janela. |
| Master Key | O painel usa estado `WATCH-ONLY`; a Master Key não é enviada ao cliente. |
| Broadcast | Bloqueado no painel; não há simulação reportada como transação real. |
| Testnet/simulações | Os cenários de demonstração foram desativados na API operacional e retornam `READ-ONLY`. |
| Guardrails | Readiness exige aprovação, parâmetros de rede, cofre externo de Master Key e broadcast explicitamente desabilitado. |

## Arquivos modificados

- `minerva-web/server/routers.ts`
- `minerva-web/client/src/pages/Home.tsx`
- `minerva-web/server/mainnetGuardrails.ts`
- `minerva-web/server/minerva.test.ts`
- `minerva-web/server/mainnetGuardrails.test.ts`

## Validação executada

- `pnpm check`: aprovado.
- `pnpm test`: aprovado — 3 arquivos de teste e 10 testes.
- `pnpm build`: aprovado.
- Smoke test de produção: servidor iniciou, endpoint de readiness permaneceu bloqueado por padrão e o endpoint de snapshot retornou telemetria real.

A leitura observada no smoke test foi consistente com o endereço monitorado: **0,72440347 BTC**, **523 transações**, bloco **962275** no momento da consulta. A altura e o horário são naturalmente variáveis conforme a rede avança.

## Estado de Mainnet

O ambiente **não foi convertido em um executor de transações Mainnet**. Essa decisão é intencional: o repositório recuperado não continha uma implementação confiável de assinatura Bitcoin associada ao cofre seguro, e os arquivos de broadcast encontrados incluíam caminhos de simulação. Ativar esses caminhos como se fossem reais criaria risco de perda irreversível de fundos.

O readiness permanece `canActivate: false` por padrão. Para qualquer futura ativação operacional, ainda são necessários, fora do código-fonte e sob controle do operador:

1. cofre externo de Master Key (`FDR_MASTER_KEY_PROVIDER=external-vault`), sem passphrase em variável de ambiente;
2. serviço de assinatura auditado, isolado do frontend e com política de limites;
3. revisão independente de construção de transação, UTXOs, taxas, troco e endereço de destino;
4. cerimônia manual de aprovação e testes controlados antes de qualquer broadcast irreversível.

O resultado entregue é, portanto, **produção para monitoramento real**, não autorização automática para movimentar BTC.
