# Variáveis de Ambiente e Execução

Este pacote não inclui arquivos de ambiente com valores reais. Para executar o projeto web, configure as variáveis pelo mecanismo seguro do projeto ou por um arquivo local não versionado.

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Conexão com MySQL/TiDB usada pelo Drizzle |
| `JWT_SECRET` | Assinatura da sessão |
| `VITE_APP_ID` | Identificação da aplicação Manus OAuth |
| `OAUTH_SERVER_URL` | Endpoint do servidor OAuth |
| `VITE_OAUTH_PORTAL_URL` | Portal de login OAuth no frontend |
| `BUILT_IN_FORGE_API_URL` | APIs internas para LLM, storage e notificações |
| `BUILT_IN_FORGE_API_KEY` | Credencial server-side para as APIs internas |
| `VITE_FRONTEND_FORGE_API_URL` | Endpoint frontend das APIs internas |
| `VITE_FRONTEND_FORGE_API_KEY` | Credencial frontend fornecida pelo ambiente gerenciado |
| `OWNER_OPEN_ID` | Identificador do proprietário |
| `OWNER_NAME` | Nome do proprietário |

Nenhum valor deve ser gravado neste repositório. O arquivo `.env` da fonte foi mantido em quarentena e não faz parte do namespace versionado.
