# Exclusões de Segurança do Pacote

A auditoria do arquivo aninhado encontrou **21 entradas** associadas a material privado. Elas não foram materializadas nem incluídas no ZIP sanitizado.

| Categoria | Regra aplicada | Quantidade |
|---|---|---:|
| Configuração local privada | arquivo de configuração local do ambiente | 1 |
| Material de chaves privadas | árvore `PrivateKey_WIF/`, incluindo seus diretórios e arquivos | 20 |
| **Total** | **Entradas excluídas do pacote sanitizado** | **21** |

O arquivo de exemplo de configuração foi mantido somente quando não continha valores secretos. Sua presença não autoriza o uso de credenciais reais no repositório; valores de ambiente devem ser fornecidos por mecanismos seguros de configuração e nunca commitados.

A exclusão não representa perda de código do Conselho. Ela protege a integridade do repositório e dos ativos digitais enquanto mantém todo o conteúdo técnico e documental versionável disponível na área de importação. O ZIP sanitizado foi validado com teste de integridade e o manifesto SHA-256 registra os artefatos efetivamente commitáveis.

Nenhum arquivo privado deve ser recuperado por cópia manual para esta branch. Caso um desenvolvedor precise de um segredo para execução local, ele deverá configurá-lo fora do Git, seguindo a política de segurança do projeto.
