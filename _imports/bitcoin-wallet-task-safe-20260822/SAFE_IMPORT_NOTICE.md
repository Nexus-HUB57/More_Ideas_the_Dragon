# Importação segura da tarefa

Esta área foi criada em diretório exclusivo, sem sobrescrever arquivos existentes. Arquivos contendo chaves privadas, backups de carteiras, CSVs com WIFs, credenciais ou passphrases foram excluídos intencionalmente do Git e permanecem fora do repositório. O material seguro usa `${CAISK_PASSPHRASE}` como variável de ambiente. Consulte `MANIFEST.json` para a relação exata.
