# Segurança de produção — autenticação e adapters HTTPS

## Princípio

A aplicação não recebe credenciais pelo frontend. O servidor valida o ambiente antes de subir quando `NODE_ENV=production`; se autenticação, OAuth, banco ou política de adapters estiverem incompletos, o processo falha rapidamente em vez de iniciar em estado ambíguo.

## Variáveis obrigatórias

| Variável | Regra | Onde configurar |
|---|---|---|
| `NODE_ENV` | Deve ser `production`. | Configuração do processo. |
| `JWT_SECRET` | Mínimo de 32 caracteres; use valor aleatório gerado pelo secret manager. | Secret manager. |
| `OAUTH_SERVER_URL` | URL absoluta HTTPS do portal OAuth confiável. | Configuração do processo. |
| `DATABASE_URL` | URL `mysql://` ou `mysql2://` para o banco de produção. | Secret manager. |
| `VITE_APP_ID` | Identificador da aplicação no ambiente de produção. | Configuração do processo/build. |
| `OWNER_OPEN_ID` | Identidade do proprietário operacional, quando usada pelo scaffold. | Secret/configuração protegida. |

O arquivo `.env.production.example` contém somente placeholders. Não copie credenciais reais para `.env`, Git, logs, tickets ou mensagens.

## Ativação de adapters

O default é seguro: `NEXUS_EXTERNAL_ADAPTERS_ENABLED=false`. Nesse modo, a rota de dispatch continua registrada, mas rejeita qualquer tentativa de chamada externa.

Para habilitar webhooks, defina ambos:

```bash
NEXUS_EXTERNAL_ADAPTERS_ENABLED=true
NEXUS_WEBHOOK_ALLOWLIST=hooks.example.com,events.example.com
```

A allowlist é de **hosts exatos**, separados por vírgulas. Não use wildcard, caminho, porta ou protocolo. O adapter ainda rejeita:

| Controle | Comportamento |
|---|---|
| HTTPS | `http://` é recusado. |
| Credenciais | URLs com usuário ou senha são recusadas. |
| SSRF básico | `localhost`, loopback, RFC1918, IPv6 privado e link-local são recusados. |
| Allowlist | Host ausente na lista é recusado. |
| Timeout | A chamada termina após 8 segundos por padrão. |
| Payload | Resposta é truncada a 8.000 caracteres antes de persistência. |
| Idempotência | Claim único é criado antes do efeito externo. |
| Auditoria | Sucesso e falha geram log sanitizado sem segredo ou corpo completo. |

O `idempotencyKey` deve ser estável para a mesma intenção de negócio. Repetições com a mesma chave recebem `deduplicated=true` e não executam nova chamada.

## Autenticação de operador

As operações de criação, transição, execução manual de jobs e dispatch de webhook usam `protectedProcedure`. O contexto tRPC deve receber uma sessão válida emitida pelo OAuth configurado; sem sessão, a mutation é rejeitada. A autenticação não deve ser substituída por uma flag no cliente.

Antes do rollout, valide o fluxo com um usuário operacional de menor privilégio, confirme expiração/renovação de sessão e mantenha `JWT_SECRET` fora do bundle frontend. A área de leitura não concede permissão para executar efeitos externos.

## Rollout recomendado

Primeiro aplique as migrations em uma janela controlada e inicie com `NEXUS_EXTERNAL_ADAPTERS_ENABLED=false`. Valide login, criação de missão, Harness e execução local dos jobs. Em seguida, cadastre apenas um host HTTPS conhecido na allowlist, teste o adapter com uma chave de idempotência de staging e observe `orchestrator_adapter_dispatches` e `audit_logs`.

Somente após confirmar timeout, resposta, auditoria e deduplicação habilite destinos adicionais. Em ambiente autoscale, escolha entre scheduler HTTP em uma única instância ou worker de cron dedicado; não habilite ambos sem necessidade operacional.

## Falha segura

O servidor HTTP e o worker separado chamam `assertProductionConfiguration()` no bootstrap. Com `NEXUS_EXTERNAL_ADAPTERS_ENABLED=true` e allowlist vazia, ambos falham antes de aceitar tráfego ou executar jobs. O processo não tenta inferir hosts seguros, não consulta DNS para ampliar permissões e não usa fallback permissivo.
