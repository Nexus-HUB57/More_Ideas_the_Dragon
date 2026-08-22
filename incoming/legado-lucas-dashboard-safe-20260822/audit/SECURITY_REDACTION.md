# Registro de segurança da integração

A tarefa solicita a preservação end to end de um projeto de Dashboard e de um pacote de referência de grande porte. A integração foi desenhada para conservar a proveniência sem introduzir material que possa expor credenciais, sementes, chaves privadas ou dados de carteira.

## Decisões

| Item | Tratamento | Motivo |
|---|---|---|
| Projeto `legado-lucas` | Copiado integralmente, exceto artefatos de dependências e controle Git | Preservar código-fonte e documentação sem duplicar `node_modules` ou `.git` |
| `Documentos.zip` | Hash SHA-256 e inventário de entradas; sem cópia binária no Git | O arquivo excede 100 MB e contém nomes/conteúdos que exigem revisão de segurança |
| Seeds, chaves privadas, WIF, xprv, wallet databases e credenciais | Não copiados nem reproduzidos | Evitar vazamento de material de custódia |
| Scripts e documentos recebidos | Inventariados como dados; não executados | Evitar execução de instruções não verificadas |
| Arquivos já existentes no repositório | Não alterados | Proteger o trabalho dos demais desenvolvedores |

## Validação esperada

O relatório de inventário deve permitir verificar quantidade, tamanho e hash do projeto e de cada entrada não sensível do pacote. A reconstrução do pacote original, quando autorizada, deve ocorrer fora do Git, em ambiente isolado, com revisão humana e controles de custódia apropriados.

> Não registrar valores de segredos em logs, manifests, commits, mensagens ou nomes de arquivos.
