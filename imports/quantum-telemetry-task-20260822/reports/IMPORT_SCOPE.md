# Escopo da importação segura

A importação desta tarefa foi organizada em um namespace novo para preservar integralmente os caminhos existentes do repositório. Os quatro arquivos de implementação do workflow de telemetria foram copiados como artefatos de código e documentação. O arquivo grande fornecido na sessão foi particionado em segmentos menores no diretório `archive_parts/`; os hashes permitem reconstrução e verificação fora do GitHub sem inserir um blob individual superior ao limite regular.

O manifesto `MANIFEST_001_299.tsv` possui exatamente 299 posições numeradas. As posições marcadas como `AVAILABLE` correspondem a arquivos efetivamente recuperados e hashados. As posições `NOT_AVAILABLE` não são arquivos vazios nem conteúdo inventado; registram explicitamente que o artefato não estava disponível no workspace desta sessão. Portanto, a contagem de 299 no manifesto não deve ser interpretada como 299 arquivos reais disponíveis.

Nenhum arquivo ou diretório existente foi sobrescrito ou removido. A sincronização deve ocorrer pela branch isolada criada para esta importação, sem `push --force` e sem merge automático em `main`.
