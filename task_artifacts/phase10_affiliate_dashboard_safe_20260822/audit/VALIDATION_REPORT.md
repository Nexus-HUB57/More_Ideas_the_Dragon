# Validação do ZIP — Fase 10

- Arquivo-fonte: MMNAI-to-AI.zip
- SHA-256: 54195c05440333ac05b4f56237af9ed927fecc30370564d3ff079ca5013acc7a
- Tamanho: 24190273 bytes
- Teste estrutural: PASS (`unzip -tqq`)
- Membros duplicados: NONE
- Caminhos absolutos ou com `..`: NONE
- Conteúdo recebido: não executado durante a importação.

## Contagens

| Grupo | Arquivos |
|---|---:|
| ZIP extraído | 3195 |
| Snapshot do projeto | 126 |
| Artefatos restaurados | 6 |

## Arquivos sensíveis identificados por nome

adm/images123/Thumbs.db
adm/images123/smiles/Thumbs.db
adm/images123/wysiwyg/Thumbs.db
boletos123/imagens/Thumbs.db
clientes/maxipago/authorization-with-token.php
clientes/maxipago/create-card-token.php
clientes/maxipago/sale-with-token.php
inc123/PagSeguroLibrary/domain/PagSeguroAccountCredentials.class.php
inc123/PagSeguroLibrary/domain/PagSeguroApplicationCredentials.class.php
inc123/PagSeguroLibrary/domain/PagSeguroCredentials.class.php
inc123/cielo/src/Cielo/API30/Ecommerce/Request/TokenizeCardRequest.php
inc123/extplorer/scripts/editarea/plugins/charmap/images/Thumbs.db
inc123/extplorer/scripts/extjs3/resources/images/default/grid/Thumbs.db
inc123/file_manager/Thumbs.db
inc123/gerencianet/gerencianet/gerencianet-sdk-php/test/Gerencianet/ca.crt
inc123/imagelibrary/images/Thumbs.db
inc123/js/jquery.validate.password.js
inc123/mercadopago/lib/cacert.pem

Os itens acima são preservados apenas como parte do ZIP fornecido pelo usuário; nenhuma chave privada foi encontrada pela verificação textual de blocos de chave.

## Exceção de segurança

`source/affiliate-dashboard/.project-config.json` não foi versionado porque continha credenciais AWS reais (`secret_access_key` e `session_token`) e referências a segredos de ambiente. O arquivo-fonte permanece fora do clone. A estrutura não sensível foi preservada em `source/affiliate-dashboard/.project-config.redacted.json`, com os valores confidenciais substituídos por `[REDACTED]`.
