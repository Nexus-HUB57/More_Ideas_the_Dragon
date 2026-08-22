# Síntese Técnica das Discrepâncias — MMN_AI-to-AI

## Escopo

A análise do estado disponível do projeto indicou que existem funções de agentes, geração de conteúdo, pedidos, comissões e integrações de marketplaces, mas a documentação de intenção não equivale à comprovação de execução autônoma em produção.

## Constatações principais

| Área | Situação observada | Ajuste necessário |
|---|---|---|
| Agentes | Há inicialização, configuração, status e estratégia de conteúdo | Adicionar ciclo de execução, memória operacional, ferramentas e scheduler |
| Conteúdo | Existem operações de geração de texto, variações, hashtags, descrições e e-mails | Persistir drafts, validar políticas, publicar por worker e auditar resultado |
| Marketplaces | Há serviço de sincronização e rota protegida | Conectar a job real, scheduler, retries e histórico verificável |
| Pagamentos | Confirmação e cancelamento são administrativos | Manter human-in-the-loop e permitir apenas preparação automática de evidências |
| Comissões | Há cálculo de comissão, confirmação e atualização de totais | Acionar por eventos idempotentes e preservar regras fora do alcance do agente |
| Infraestrutura | A documentação menciona Redis/BullMQ, mas o código analisado não comprova workers ativos | Implementar filas, workers, health checks e scripts de execução |
| Modelos | O roteador prevê modelos futuros e usa fallback para modelo disponível | Monitorar disponibilidade, custo, qualidade e falha de provedor |
| Integrações externas | O código registra notificações internas, mas nem todos os canais externos estão conectados | Usar APIs oficiais, consentimento, rate limits e revogação de credenciais |

## Conclusão

O sistema possui uma base funcional para automação parcial, mas não se deve declarar autonomia operacional plena sem scheduler, workers, contratos de eventos, persistência de resultados, controles de consentimento e testes de falha. O roadmap anexo separa deliberadamente execução operacional de autoridade administrativa e financeira.

A fronteira recomendada é: agentes executam ações previamente autorizadas de marketing, publicação, prospecção, convite, follow-up, catálogo e reação a eventos comerciais; humanos aprovam metas, políticas, credenciais, exceções, pagamentos, saques, dados bancários, fornecedores e alterações de remuneração.

## Risco de interpretação

“100% sob responsabilidade dos agentes” deve ser entendido como execução autônoma dentro de um perímetro de autorização, e não como liberdade irrestrita. O agente continua sujeito a regras de negócio, segurança, legislação aplicável, políticas das plataformas, proteção de dados, consentimento e mecanismos de desligamento.
