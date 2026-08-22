# Aviso de resposta a incidente de configuração

Durante a auditoria do projeto local foi encontrado um arquivo de configuração de ambiente contendo credenciais reais para banco de dados, armazenamento/backend Git, OAuth e APIs. Os valores não são reproduzidos neste documento, no manifesto, no ZIP ou no commit.

O arquivo real foi excluído do pacote. Uma versão estrutural redigida, `PROJECT_CONFIG_REDACTED.json`, foi incluída apenas para documentar o formato esperado sem valores operacionais. O arquivo original deve ser tratado como comprometido até que todas as credenciais sejam rotacionadas ou invalidadas pelo proprietário.

## Ações recomendadas

O proprietário deve rotacionar a credencial do banco, as credenciais do backend de armazenamento, tokens de APIs e credenciais OAuth relacionadas. Sessões temporárias e tokens expiráveis também devem ser invalidados. Após a rotação, é necessário revisar logs de acesso e confirmar que nenhum valor real entrou no histórico do repositório ou na branch publicada.

## Estado da auditoria

A verificação do commit desta integração encontrou somente adições dentro do namespace aprovado e não encontrou os padrões de chaves procurados nos artefatos versionados. Essa verificação não substitui a rotação das credenciais, a revisão do histórico completo ou uma análise profissional de segurança.

## Regra de publicação

O arquivo de configuração real não deve ser adicionado ao Git, ao ZIP ou a qualquer relatório. Novas configurações devem usar o gerenciador de segredos do ambiente e arquivos de exemplo contendo apenas placeholders.
