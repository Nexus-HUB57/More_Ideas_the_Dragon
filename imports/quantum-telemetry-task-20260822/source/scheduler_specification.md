# Especificação do Agendador de Telemetria e Auditoria

Este documento formaliza a arquitetura do workflow agendado a cada 60 minutos, limitado estritamente a 20 workers por ciclo para processamento paralelo de telemetria, análise de blocos e auditoria somente leitura, garantindo idempotência e encerramento controlado.

## Parâmetros Operacionais

- **Intervalo**: A cada 60 minutos (`3.600.000 ms`).
- **Concorrência Máxima**: Até 20 workers sucessivos por ciclo.
- **Escopo**: Restrito a telemetria, análise de blocos e auditoria de mempool. Nenhuma operação de cunhagem, emissão, custódia ou movimentação de moedas é executada.
- **Resiliência**: Tratamento de exceções por worker, timeout por tarefa e preservação de estado no PostgreSQL.
