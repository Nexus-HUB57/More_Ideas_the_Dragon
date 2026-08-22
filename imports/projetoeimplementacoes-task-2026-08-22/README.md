# Importação segura dos artefatos da tarefa — 2026-08-22

Este diretório foi criado em uma branch isolada e não substitui arquivos existentes. O conteúdo recebido foi preservado integralmente em um pacote criptografado dividido em partes de até 45 MiB para respeitar o limite de arquivos do GitHub.

Para recompor e descriptografar em ambiente seguro:

```bash
cat task-artifacts-2026-08-22.tar.gz.enc.part-* > task-artifacts-2026-08-22.tar.gz.enc
openssl enc -d -aes-256-cbc -pbkdf2 -iter 300000 -pass pass:'SENHA_FORNECIDA_PELO_OPERADOR' -in task-artifacts-2026-08-22.tar.gz.enc | tar -xzf -
```

O manifesto `manifest.sha256` registra os hashes dos artefatos antes da criação do pacote criptografado. A senha de descriptografia não é armazenada neste repositório. O conteúdo sensível não foi expandido em texto claro no repositório.
