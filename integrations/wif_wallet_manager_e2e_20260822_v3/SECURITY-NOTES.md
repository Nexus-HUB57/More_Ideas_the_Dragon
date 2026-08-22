# Notas de segurança do pacote

A entrada `wallet.txt` fornecida nesta tarefa contém padrões compatíveis com WIFs, chaves hexadecimais de 32 bytes e dados de histórico de carteira. Por isso, foi tratada como material sensível e não foi copiada para os repositórios GitHub nem para o ZIP publicável.

O arquivo `.project-config.json` também foi excluído porque contém credenciais de banco de dados, tokens de sessão, chaves de integração e outros valores secretos do ambiente. Logs locais, dependências instaladas e artefatos de compilação também foram excluídos por não serem necessários para a reprodução do código e por poderem revelar informações operacionais.

Para permitir auditoria de integridade sem divulgar o conteúdo, o pacote contém somente SHA-256 e tamanho dos arquivos de entrada na pasta `input-evidence/`. Um hash não permite reconstruir o arquivo original, mas não deve ser interpretado como prova de que o conteúdo é seguro para publicação.

Nenhuma chave privada, WIF, token, senha ou credencial deve ser inserida em commits, pull requests, issues, releases ou artefatos públicos. Caso seja necessário trabalhar com o arquivo original, ele deve permanecer em armazenamento privado e ser processado localmente com acesso restrito.

## Recomendação de revisão

Antes de qualquer push, executar uma varredura independente de segredos no conteúdo staged e revisar todo o diff. Se a varredura encontrar material sensível, interromper a operação e remover o conteúdo somente da área staged; não reescrever o histórico remoto.

## Status

Este documento registra uma decisão preventiva de segurança. O conteúdo bruto sensível permanece fora do pacote publicável.
