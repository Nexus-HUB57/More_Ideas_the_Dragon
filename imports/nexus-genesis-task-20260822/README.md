# Nexus Genesis Task Bundle — Importação segura

Este pacote reúne os artefatos do projeto local `nexus-genesis-orchestrator` e o conteúdo revisado do arquivo de origem `NexusGenesis_Final.zip` em namespaces separados. A importação foi preparada como adição isolada, sem sobrescrever ou excluir caminhos preexistentes do repositório.

A pasta `project/` contém o snapshot do projeto local sem `node_modules`, `dist`, logs temporários, metadados Git ou arquivos de ambiente. A pasta `source_zip/` contém a extração revisada do ZIP original. A pasta `package/` contém `NexusGenesis_Final.sanitized.zip`, um pacote público que preserva a estrutura e os artefatos do ZIP, mas redige o arquivo `PvKeys.txt` porque a fonte continha material de autenticação financeira. O ZIP bruto não é publicado. O arquivo `audit/manifest.tsv` registra origem, caminho relativo, tamanho e SHA-256.

A contagem publicada deve ser lida do manifesto; o requisito textual de 295/299 arquivos não deve ser artificialmente satisfeito com arquivos vazios ou duplicados sem origem. Arquivos excluídos por segurança e artefatos temporários são documentados na proveniência.
