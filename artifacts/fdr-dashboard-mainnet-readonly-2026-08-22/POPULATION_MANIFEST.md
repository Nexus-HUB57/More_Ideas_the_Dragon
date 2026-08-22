# Manifesto de povoamento seguro — FDR Dashboard

## Proveniência

Este diretório contém os artefatos recuperados do ambiente `/home/ubuntu/fdr_dashboard_recovered` para a tarefa de monitoramento do FDR na Bitcoin Mainnet. A cópia foi realizada em uma branch isolada, sem sobrescrever caminhos preexistentes.

## Conteúdo

| Arquivo | Finalidade |
|---|---|
| `FDR_MAINNET_READINESS_REPORT.md` | Relatório de implementação, validação e limites operacionais. |
| `minerva-web/server/routers.ts` | API tRPC de telemetria pública da Bitcoin Mainnet. |
| `minerva-web/server/mainnetGuardrails.ts` | Guardrails de ativação, Master Key e broadcast. |
| `minerva-web/server/mainnetGuardrails.test.ts` | Testes dos guardrails de segurança. |
| `minerva-web/server/minerva.test.ts` | Testes das procedures públicas e desativação de simulações. |

## Limites de segurança

Nenhuma chave privada, senha, seed, arquivo de configuração local ou credencial foi incluído neste pacote. O código entregue permanece em modo `READ-ONLY`; a assinatura e o broadcast de transações Bitcoin não fazem parte desta população.

O pacote ZIP associado é um artefato de transporte e auditoria. Ele não substitui revisão de código, revisão independente de segurança ou cerimônia de aprovação para qualquer futura movimentação de fundos.

## Regra de preservação

A branch de trabalho foi criada a partir de `origin/main`. A população usa um diretório novo e único (`artifacts/fdr-dashboard-mainnet-readonly-2026-08-22/`). Nenhum commit, branch, arquivo ou pasta já existente foi removido ou alterado por esta operação.
