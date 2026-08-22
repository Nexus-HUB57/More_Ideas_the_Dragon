# Reconstrução do arquivo de origem particionado

Os segmentos `archive_parts/FileConsolidationandImplementationOverview.zip.part-*` foram gerados com `split` a partir do arquivo de origem. Para reconstruir o ZIP em um ambiente controlado, concatene os segmentos em ordem lexicográfica e compare o resultado com `manifest/source_archive.sha256`. Esta documentação é somente operacional de arquivo; não executa nem transmite nenhum conteúdo de transação.
