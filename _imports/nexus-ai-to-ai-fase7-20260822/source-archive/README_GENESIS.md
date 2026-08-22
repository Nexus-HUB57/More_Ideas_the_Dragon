
\&nbsp;  (useWebSocket\\\*)       (Dashboard, etc)  (Canto superior)

```



\## Tratamento de Erros e Reconexão



\### Estratégia de Reconexão



1\. \*\*Detecção:\*\* Monitora eventos `disconnect` e `connect\\\_error`

2\. \*\*Tentativa:\*\* Implementa retry automático com delay exponencial

3\. \*\*Feedback:\*\* Exibe toast com status de reconexão

4\. \*\*Limite:\*\* Máximo de 5 tentativas antes de falha permanente



\### Estados de Erro



\- \*\*Erro de Conexão:\*\* Exibido no badge de status e em notificações

\- \*\*Falha de Reconexão:\*\* Toast com mensagem de erro

\- \*\*Timeout:\*\* Tratado automaticamente pelo Socket.IO



\## Integração com Backend



\### Canais WebSocket



O frontend subscreve aos seguintes canais:


