# Protocolo Safe Recovery

1. Operação realizada exclusivamente em branch isolada.
2. Namespace de destino criado com nome único.
3. Nenhum `git rm`, `git mv`, sobrescrita ou alteração fora do namespace importado.
4. Arquivos de origem copiados com preservação de metadados.
5. Manifesto SHA-256 e arquivo ZIP gerados antes da revisão do diff.
6. O merge para `main` não é automático; requer revisão humana dos demais desenvolvedores.
