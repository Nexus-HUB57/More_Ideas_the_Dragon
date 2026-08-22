# FDR Safe Recovery — Pacote Sanitizado

Este diretório reúne os artefatos não sensíveis produzidos durante a tarefa de inventário, consulta de saldos, desenho de custódia e preparação de transações Bitcoin. O conteúdo foi adicionado em um caminho novo e versionado de forma aditiva, sem substituir ou remover arquivos existentes.

## Escopo

O pacote contém scripts de referência, documentação, manifests e templates de validação. Ele **não contém chaves privadas, seeds, senhas, arquivos brutos de carteira, dumps binários, credenciais, tokens, nem transações assinadas prontas para broadcast**.

Os arquivos de carteira enviados durante a tarefa foram classificados como material de custódia sensível e permanecem fora do GitHub. Somente seus metadados e hashes podem ser registrados em um inventário local controlado.

## Estado das transações

Os artefatos denominados `step1_transaction_signed.json` e `step2_transaction_signed.json` na sessão anterior eram descrições/metadata de transação, não hexadecimais assinados. Portanto, este pacote não os apresenta como transações assinadas e não autoriza broadcast.

A criação de uma transação real requer validação independente da UTXO, posse comprovada da chave, cálculo de taxa, geração de script correto, assinatura e revisão humana antes de qualquer transmissão.

## Estrutura

| Caminho | Finalidade |
|---|---|
| `src/fdr_security.py` | Biblioteca de criptografia local sem segredos embutidos |
| `docs/SECURITY_MODEL.md` | Modelo de ameaça, operação e limites de segurança |
| `docs/TRANSACTION_WORKFLOW.md` | Fluxo seguro de construção e revisão de transações |
| `manifests/task_artifacts_manifest.tsv` | Inventário sanitizado dos artefatos da tarefa |
| `manifests/excluded_sensitive_artifacts.tsv` | Registro de exclusões por classe, nome, tamanho e hash |
| `tests/test_fdr_security.py` | Testes unitários do módulo criptográfico |
| `scripts/verify_package.py` | Validação de integridade e detecção de padrões sensíveis |

## Política de povoamento

O repositório já contém material de outros desenvolvedores. Este pacote usa somente um diretório novo; não realiza `git clean`, `git reset`, `git checkout` destrutivo, remoção, sobrescrita ou alteração de arquivos fora desse diretório.

## Execução local

Instale dependências somente em ambiente isolado. A biblioteca aceita uma senha fornecida em runtime e gera salt e nonce aleatórios. Nenhuma master key é escrita neste repositório.

```bash
python3 -m pytest task_artifacts/2026-08-22_fdr_safe_recovery_v1/tests
python3 task_artifacts/2026-08-22_fdr_safe_recovery_v1/scripts/verify_package.py
```

## Licença operacional

Este pacote é um registro técnico da tarefa e não substitui revisão de segurança, auditoria de custódia, política de aprovação multisig ou procedimento operacional da exchange.

> Regra de segurança: segredo de custódia não deve ser commitado, mesmo quando o usuário solicita um pacote completo. A completude é representada por manifests e quarentena, não pela publicação de material que permita movimentar fundos.
