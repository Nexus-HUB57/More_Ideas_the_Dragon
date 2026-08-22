# Nota de Segurança — Artefatos de Teste Preservados

A fonte recebida contém nomes e extensões que normalmente exigem revisão antes de qualquer publicação, incluindo `credentials.json`, arquivos `.env`, diretório de chave privada, arquivos `.dat`, `.backup` e binário `.dll`. Uma varredura de nomes e padrões encontrou candidatos a dados sensíveis; os valores não foram expostos neste relatório.

O responsável pela operação respondeu **B** e autorizou explicitamente a inclusão integral no repositório público, declarando que esses materiais são fictícios/de teste. Essa autorização foi aplicada somente ao pacote desta branch e não constitui autorização para reutilizar os valores em ambientes de produção.

## Recomendações operacionais

| Situação | Conduta |
|---|---|
| Uso em produção | Gerar credenciais novas, rotacionar chaves e nunca reutilizar os valores do pacote |
| Fork ou cópia | Tratar o conteúdo como público, mesmo que a intenção original tenha sido de teste |
| Incidente de exposição real | Revogar/rotacionar imediatamente a credencial correspondente e abrir incidente de segurança |
| Integração no código produtivo | Copiar somente arquivos revisados individualmente, fora do namespace de preservação |

Os hashes, tamanhos e caminhos de materialização estão em `nexus_hub_continuation_2026-08-22/MANIFEST.json`. A preservação foi feita em namespace isolado para não sobrepor os artefatos da operação principal.
