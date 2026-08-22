# Security Scan — Resultado

## Resultado consolidado

| Verificação | Resultado |
|---|---:|
| Cabeçalhos de chave privada no staging | 0 |
| Padrões de chaves AWS no staging | 0 |
| Arquivos materializados com nome sensível, excluindo o exemplo | 0 |
| Cabeçalhos de chave privada materializados | 0 |
| Padrões de chaves AWS materializados | 0 |
| Nomes sensíveis no ZIP externo sanitizado, excluindo o exemplo | 0 |
| Nomes sensíveis no ZIP interno sanitizado, excluindo o exemplo | 0 |
| Integridade do ZIP externo sanitizado | PASS |
| Integridade do ZIP interno sanitizado | PASS |

A verificação encontrou três candidatos de atribuição de configuração: o arquivo de exemplo de ambiente e duas documentações técnicas. Eles foram classificados como exemplos/documentação, não como credenciais reais; nenhum valor de segredo foi incluído no relatório.

## Política aplicada

O arquivo de configuração local privado e a árvore `PrivateKey_WIF/` não foram copiados. O pacote sanitizado mantém apenas material técnico, documentação e o arquivo de exemplo sem valores secretos. O arquivo original recebido não deve ser adicionado ao Git.

A varredura foi executada antes do commit sobre o namespace `imports/council_of_architects_7_agents_20260822/`. O resultado deve ser repetido após qualquer alteração no payload e antes de um eventual merge na branch principal.
