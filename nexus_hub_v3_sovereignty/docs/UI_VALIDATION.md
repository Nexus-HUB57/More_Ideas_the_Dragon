# Validação visual local — 25/08/2026

A aplicação foi iniciada localmente a partir de `nexus_hub_v3_sovereignty` e acessada em `http://localhost:3000`.

| Rota | Resultado |
|---|---|
| `/orchestrator` | Renderizou o cabeçalho do HUB, navegação desktop, métricas, board com os sete estados, timeline e CTA de nova missão. |
| `/orchestrator` com formulário aberto | O formulário alterna corretamente e, sem startups persistidas, mostra o estado guiado para criar uma startup primeiro. |
| `/audit` | Renderizou a tela de compliance conectada ao router de logs, com métricas e estado vazio. |

Durante a primeira abertura, o hook de autenticação falhou com `TypeError: Invalid URL` porque o ambiente local não possui `VITE_OAUTH_PORTAL_URL` e `VITE_APP_ID`. O helper `client/src/const.ts` recebeu um fallback para `/` somente quando essas variáveis estão ausentes; o fluxo de produção continua usando o portal OAuth quando configurado.

A compilação seguinte foi concluída com sucesso. Permaneceram apenas avisos não bloqueantes sobre variáveis opcionais de analytics no `index.html` e sobre o tamanho de um chunk JavaScript.
