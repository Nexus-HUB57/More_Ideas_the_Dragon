# MINERVA Protocol — Relatório de Validação Mainnet

## Resultado executivo

A validação de software do MINERVA foi concluída com sucesso. A suíte automatizada passou com **8 testes em 3 arquivos**, a checagem TypeScript terminou sem erros e o build de produção foi gerado com sucesso. O processo de preparação foi atualizado para manter a operação em modo seguro: o código avalia readiness, mas não assina, transmite, cria genesis ou movimenta fundos.

## Evidências técnicas

| Verificação | Resultado | Observação |
|---|---:|---|
| `pnpm test` | PASS | 8 testes, incluindo auth, simulações e guardrails Mainnet |
| `pnpm check` | PASS | TypeScript sem erros |
| `pnpm build` | PASS | Vite + bundle do servidor gerados; aviso não bloqueante de chunk acima de 500 kB |
| Guardrail padrão | PASS | Sem configuração explícita, a ativação permanece bloqueada |
| Guardrail completo | PASS | Só retorna candidato quando todos os critérios explícitos passam |

## Estado da transição

A transição automática não foi ativada. O sistema permanece em `testnet-simulated` até que os operadores autorizados forneçam e validem os seguintes parâmetros de produção: `MINERVA_TESTNET_APPROVAL=100000/100000`, `MINERVA_MAINNET_GENESIS_HASH` com hash de 32 bytes, `MINERVA_MAINNET_CHAIN_ID` numérico e único, `MINERVA_VALIDATOR_QUORUM` com quorum mínimo de quatro, `MINERVA_OPERATOR_APPROVAL=APPROVED` e `MINERVA_MAINNET_ENABLED=true`.

Esses valores não devem ser inventados, expostos em código ou enviados ao repositório. A ativação efetiva também exige uma cerimônia operacional separada para genesis, distribuição de chaves e configuração dos validadores. Esta etapa é deliberadamente manual e deve ser executada pelos operadores responsáveis, em ambiente seguro, após revisão independente.

## Atualização do repositório

As alterações foram preparadas em `minerva-web` no branch isolado `feature/minerva-mainnet-readiness`. Nenhum arquivo rastreado fora desse subdiretório foi modificado. Artefatos locais de `node_modules` e `dist` foram removidos antes do staging. O branch contém o módulo de readiness, seus testes, o plano de transição e este relatório.
