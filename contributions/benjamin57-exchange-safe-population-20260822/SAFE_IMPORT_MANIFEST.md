# Safe Import Manifest — Benjamin57 Exchange

## Escopo

Este diretório contém uma cópia isolada dos artefatos produzidos nesta tarefa: código-fonte da Exchange, documentação operacional, documentação de paridades BNJ, componentes de repositório de wallets e o pacote ZIP para HostGator.

A importação foi feita em uma pasta nova, sem substituir, remover ou editar caminhos previamente rastreados no repositório. O commit correspondente será publicado somente na branch isolada desta tarefa; a branch `main` e seus commits existentes não serão reescritos.

## Inventário

O conjunto importado contém 28 arquivos antes deste manifesto; com este manifesto e seu checksum, o conjunto final contém 30 arquivos. Arquivos de dependências instaladas, caches Python, `node_modules` e ambientes virtuais foram deliberadamente excluídos para evitar material gerado, volume desnecessário e risco de incluir dados locais.

| Grupo | Conteúdo | Quantidade aproximada |
|---|---|---:|
| Código da Exchange | Backend Flask, modelos, rotas e frontend React | 20 |
| Documentação da tarefa | README e guia de deployment | 2 |
| Pacote HostGator | `.htaccess`, documentação e API mínima | 5 |
| Artefatos distribuíveis | ZIP e checksum SHA-256 | 2 |
| Controle de importação | Este manifesto e checksum | 2 |

## Segurança

Nenhum arquivo privado de wallet, seed, WIF, chave privada, `wallet.dat` real ou credencial operacional foi importado. O segredo hardcoded encontrado no código de desenvolvimento foi removido da cópia destinada ao Git; a configuração de produção deve receber `SECRET_KEY` por variável de ambiente. O ZIP desta pasta foi regenerado a partir do pacote sanitizado.

Arquivos `.dat`, `.txt` e `.core` são potencialmente sensíveis. Eles não devem ser tratados como simples anexos de aplicação, nem disponibilizados publicamente. A rota de upload existente é apenas um ponto de partida de protótipo e requer autenticação forte, autorização por usuário, armazenamento fora do webroot, criptografia em repouso, antivírus/allowlist, trilha de auditoria e revisão de compliance antes de qualquer operação real.

## Validação

- Branch isolada: `manus/benjamin57-exchange-safe-population-20260822`.
- Base da branch: commit atual de `origin/main` no momento da importação.
- Estratégia de recuperação: nenhuma operação destrutiva; diretório novo e commit novo.
- ZIP validado com `unzip -t`.
- SHA-256 do ZIP registrado em `exchange_benjamin57_hostgator.zip.sha256`.
- Os artefatos técnicos 001–299 que já existiam no repositório não foram duplicados nem alterados. Este import contém somente os 30 arquivos disponíveis nesta tarefa local.

## Publicação

A branch deve passar por revisão dos demais desenvolvedores e ser integrada via Pull Request. Não fazer force-push, reset destrutivo, squash sobre commits de terceiros ou merge direto na `main` sem aprovação explícita da equipe.

## Observação operacional

O pacote HostGator é um bundle de distribuição e não constitui, por si só, uma implantação de exchange de produção. Antes de aceitar operações reais, devem ser concluídos auditoria de segurança, KYC/AML, segregação de fundos, política de custódia, reconciliação, limites de risco, monitoramento, backups testados e validação jurídica/regulatória aplicável.

Gerado em 2026-08-22.
- Fonte: tarefa de desenvolvimento da Exchange Benjamin57.
- Repositório alvo: `Nexus-HUB57/More_Ideas_the_Dragon`.
- Método: importação segura e não destrutiva em branch dedicada.

> Regra de recuperação: preservar o histórico existente é prioridade; qualquer conflito deve resultar em pausa e revisão, nunca em sobrescrita automática.

> Nota sobre a contagem: a solicitação menciona 299 arquivos, mas o workspace local disponibilizou 28 artefatos importáveis antes dos arquivos de controle. O repositório já contém materiais 001–299 em caminhos próprios, que foram preservados integralmente.

## Referências de integridade

O arquivo `exchange_benjamin57_hostgator.zip.sha256` contém o hash do pacote distribuível. Após o clone, valide com:

```bash
sha256sum -c contributions/benjamin57-exchange-safe-population-20260822/exchange_benjamin57_hostgator.zip.sha256
unzip -t contributions/benjamin57-exchange-safe-population-20260822/exchange_benjamin57_hostgator.zip
```

O checksum do manifesto pode ser regenerado após qualquer alteração intencional; qualquer divergência deve ser revisada antes da integração.
