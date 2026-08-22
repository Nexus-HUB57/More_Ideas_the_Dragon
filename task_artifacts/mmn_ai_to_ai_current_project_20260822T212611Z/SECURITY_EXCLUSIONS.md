# Exclusões de segurança

O arquivo legado `MMNAI-to-AI.zip` foi analisado como dado não executado e preservado fora do repositório. Ele contém arquivos de banco/configuração e dependências vendorizadas; por precaução, o arquivo não foi copiado para o commit. Seu SHA-256 e tamanho estão registrados em `INTEGRATION_METADATA.json`.

Nenhum `.env`, token, chave privada, credencial de produção ou dump de banco foi adicionado ao pacote novo. O arquivo local `.project-config.json` contém credenciais reais de banco, armazenamento, OAuth e APIs; ele foi deliberadamente excluído. O pacote inclui apenas `PROJECT_CONFIG_REDACTED.json`, com os valores substituídos por marcadores. O manual textual preservado contém valores demonstrativos (`admin/admin`) e deve ser tratado como documentação legada, nunca como acesso válido. A decisão é reversível: após rotação das credenciais e redaction formal, os mantenedores podem criar outro commit aditivo com os artefatos aprovados.
