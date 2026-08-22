# Relatório de validação — MMN AI-to-AI

## Escopo

Este relatório documenta a validação do pacote aditivo integrado na branch de trabalho. A integração foi preparada em namespace próprio, sem alteração da branch principal e sem sobrescrita ou exclusão de caminhos existentes.

## Inventário observado

A cópia do projeto local contém **132 arquivos de fonte e documentação**, excluindo diretórios gerados (`node_modules`, `dist`, caches, logs e `.git`) e arquivos de ambiente. Com documentação de integração, comparação de cobertura, manifestos, checksums, resumo e manual textual, o namespace contém **142 arquivos antes do ZIP**. O ZIP end-to-end é um artefato adicional versionado, totalizando **143 arquivos adicionados ao commit**. A contagem de 295/299 não foi fabricada: o inventário real é o valor registrado em `MANIFEST.json`.

| Verificação | Resultado |
|---|---|
| Paridade da cópia do projeto | Aprovada para os 132 arquivos incluídos |
| Colisão do namespace | 0 no baseline auditado |
| Caminhos existentes sobrescritos | 0 |
| Caminhos existentes excluídos | 0 |
| Commits existentes reescritos | 0 |
| Force-push | Não utilizado |
| Alteração da main | Não realizada |
| Integridade do ZIP | Aprovada por `unzip -t` |
| Testes Vitest | Aprovados; 1 arquivo de teste e 1 teste executado no estado restaurado |
| TypeScript `pnpm check` | Pendente; falha com 2 erros preexistentes no projeto restaurado |
| Build `pnpm build` | Aprovado; 2.391 módulos transformados |

## Erros conhecidos do projeto

O `pnpm check` permanece com dois erros de TypeScript no estado local restaurado: o acesso tipado em `server/_core/storageProxy.ts` e a incompatibilidade de tipo em `server/routers/mmn.ts`. Eles foram preservados no pacote para não alterar o trabalho de outros desenvolvedores durante uma operação de integração de arquivos. O build de produção executou com sucesso.

## Segurança

O ZIP legado enviado pelo usuário, com 3.109 entradas, foi testado e preservado fora do repositório. Ele não foi copiado integralmente para o commit porque contém material legado de banco/configuração e dependências vendorizadas que exigem revisão independente. O manual textual foi preservado separadamente; seus valores `admin/admin` são demonstrativos e não devem ser usados como credenciais reais.

Nenhum arquivo `.env`, token, chave privada, credencial de produção, dump de banco ou dependência instalada foi adicionado ao pacote novo. O SHA-256 do ZIP legado e as exclusões estão registrados em `INTEGRATION_METADATA.json`.

## Reprodutibilidade

Os comandos de validação foram executados no projeto local:

```text
pnpm test   -> exit 0
pnpm check  -> exit 1 (2 erros TypeScript conhecidos)
pnpm build  -> exit 0
unzip -t MMNAI-to-AI.zip -> sem erros
```

Os hashes SHA-256 do pacote, manifesto e checksums devem ser lidos do relatório de entrega gerado após o commit, pois o ZIP é regenerado quando um artefato de documentação é atualizado.

## Decisão de integração

A branch deve ser revisada por pull request. O merge não é automático e deve ser realizado pelos mantenedores depois da revisão de segurança, produto, compliance e TypeScript. Qualquer correção posterior deve ser feita em novos commits, sem reset destrutivo ou force-push.

## Limitações de escopo

A presença dos arquivos no pacote não significa que integrações oficiais com Mercado Livre, Shopee ou Hotmart, automação de postagens, execução de dropshipping, pagamentos ou autorização por perfil estejam prontos para produção. Essas capacidades permanecem documentadas como pendências no `todo.md` e devem ser implementadas e validadas separadamente.

## Evidência

O `MANIFEST.json`, `MANIFEST.md`, `CHECKSUMS.sha256`, `VALIDATION_SUMMARY.json` e o ZIP end-to-end são as fontes de evidência do conteúdo integrado. O baseline remoto é registrado em `.safe_audit` local e não faz parte do commit.

## Referências

- [1] Projeto local restaurado em `/home/ubuntu/mmn-ai-to-ai`.
- [2] Repositório remoto `Nexus-HUB57/More_Ideas_the_Dragon`.
- [3] ZIP legado enviado em `/home/ubuntu/upload/MMNAI-to-AI.zip`.

## Estado

A validação de empacotamento está aprovada. A validação TypeScript permanece pendente e será comunicada sem ocultação no pedido de revisão.
