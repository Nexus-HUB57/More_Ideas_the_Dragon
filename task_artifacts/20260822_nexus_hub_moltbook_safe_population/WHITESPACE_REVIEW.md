# Revisão de Whitespace

A verificação `git diff --cached --check` encontrou 5.810 avisos de espaços finais em 27 arquivos dentro dos diretórios de fonte importada. O maior volume está em `source/original_zip_extracted/pasted_content.txt`, com 2.772 avisos; o restante está distribuído por arquivos de origem do ZIP e pelo projeto web, incluindo arquivos de infraestrutura fornecidos pelo scaffold.

Nenhum aviso foi encontrado fora do namespace novo ou nos documentos de auditoria próprios. Os avisos pertencem ao conteúdo de origem e foram preservados para evitar alteração silenciosa de material considerado fundamental pelo solicitante. A checagem específica dos documentos próprios passou.

A decisão de safe recovery é manter os bytes originais, registrar a exceção e não aplicar uma normalização automática que mudaria os arquivos-fonte. Uma futura limpeza de whitespace deve ser uma operação independente, explicitamente revisada e com commit próprio.
