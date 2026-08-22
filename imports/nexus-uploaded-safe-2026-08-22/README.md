# Importação segura dos artefatos Nexus

Este pacote foi preparado em namespaces separados para evitar colisões com arquivos existentes. Arquivos de credenciais, chaves privadas, `.env` e nomes associados a segredos foram excluídos do conteúdo versionável; a relação completa está em `IMPORT_MANIFEST.json`. Os ZIPs sanitizados preservam os demais artefatos para rastreabilidade.
