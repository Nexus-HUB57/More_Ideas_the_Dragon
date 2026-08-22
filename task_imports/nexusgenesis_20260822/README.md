# NexusGenesis — Importação segura da tarefa

Esta pasta contém a importação aditiva e isolada dos artefatos do pacote `NexusGenesis.zip`, preparada para revisão por outros desenvolvedores. Nenhum arquivo existente na raiz do repositório foi sobrescrito ou excluído.

## Escopo

Foram importados os artefatos de arquitetura, orquestração, testes, mocks, documentação e tipos do pacote original. Os workflows incluídos nesta pasta operam somente em **dry-run** e não executam recuperação de chaves privadas, assinatura de transações, transferências, saques, liquidação em exchanges ou pagamentos.

## Segurança

Materiais que contêm ou podem conter credenciais, chaves privadas, seeds, chaves de serviço Firebase, carteiras exportadas ou arquivos de configuração sensíveis foram deliberadamente excluídos da versão controlada. Esses materiais não devem ser adicionados ao Git, mesmo quando fornecidos no pacote original. Em caso de exposição anterior, as credenciais devem ser revogadas e rotacionadas pelos responsáveis.

O `SAFE_IMPORT_MANIFEST.tsv` registra cada arquivo importado ou excluído, com o motivo da exclusão e o hash SHA-256 dos arquivos importados. Os arquivos foram mantidos em uma pasta própria para evitar colisões com o trabalho existente.

## Validação

A validação deve ser executada com:

```bash
bash task_imports/nexusgenesis_20260822/workflows/validate-safe-import.sh
```

Os workflows de CI estão em `task_imports/nexusgenesis_20260822/workflows/` e usam uma matriz de 50 unidades lógicas para testes e análise estática, não para operar fundos ou tentar recuperar chaves.

## Limites operacionais

Os nomes “Shor-2077”, “Buraco de Minhoca” e “recuperação de carteiras” são tratados como nomenclatura conceitual/documental. Não existe, neste repositório, uma implementação comprovada de computação quântica retrocausal ou mecanismo legítimo para derivar chaves privadas de endereços. O código seguro deve aceitar apenas dados de teste autorizados e nunca tentar quebrar ou adivinhar chaves.

A publicação desta branch não faz merge automático em `main`. A revisão e o merge devem ser realizados pelos mantenedores do repositório.
