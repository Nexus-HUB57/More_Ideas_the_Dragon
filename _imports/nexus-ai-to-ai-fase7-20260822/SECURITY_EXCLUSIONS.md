# Exclusões de segurança do import

Durante a inspeção do pacote de origem foram identificadas entradas de ambiente com potencial de credenciais. Elas não serão adicionadas ao repositório, não serão copiadas para a área de importação e não serão incluídas no ZIP end-to-end.

| Origem | Entrada excluída | Motivo |
|---|---|---|
| `NexusAI-to-AI.zip` | `.env` | Pode conter valores secretos ou credenciais de runtime |
| `Booster_Nexus-Hibryd.zip` | `.env` | Pode conter valores secretos ou credenciais de runtime |
| ZIPs internos recursivos | `.env`, `.env.example`, `credentials.json` | Podem conter credenciais, exemplos de secrets ou configuração sensível |
| `web-project/.project-config.json` | valores de `git_remote`, `DATABASE_URL` e mapa `secrets` | A estrutura é preservada, mas valores operacionais são substituídos por placeholders para cumprir a proteção de push do GitHub |

O conteúdo dos arquivos excluídos nunca é impresso, versionado ou incorporado aos manifestos. O metadata do projeto permanece versionado apenas na forma sanitizada, sem chaves AWS, tokens de sessão, URLs privadas ou valores de secrets. A ausência dessas entradas é validada durante a preparação do pacote sanitizado. O código deve obter configurações sensíveis por meio do gerenciamento de secrets do ambiente de execução, e não por arquivos commitados.

Além dos arquivos de ambiente, o pacote do projeto web é exportado sem `.git/`, dependências vendorizadas, logs locais e metadados específicos do sandbox. Os ZIPs internos também são reconstruídos recursivamente, removendo entradas de ambiente, credenciais e secrets em qualquer profundidade; os demais arquivos e documentos permanecem disponíveis na árvore sanitizada. Esses diretórios não fazem parte do código-fonte necessário para revisão e podem conter dados transitórios ou dependências regeneráveis.
