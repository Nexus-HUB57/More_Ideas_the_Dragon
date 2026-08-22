# Exclusões de segurança e limites da entrega

A sincronização foi realizada com princípio de preservação e menor privilégio. Foram copiados somente os arquivos reais listados no inventário da árvore local do projeto, dentro da namespace isolada da entrega.

| Item | Tratamento | Motivo |
|---|---|---|
| `node_modules/` | Não incluído | Dependências geradas; podem ser reinstaladas pelo lockfile. |
| `dist/` | Não incluído | Artefato de build gerado. |
| `.vite/`, `.cache/`, `coverage/` | Não incluídos | Caches e resultados temporários. |
| `.manus-logs/` | Não incluído | Logs operacionais que podem conter dados de ambiente. |
| `.env` e `.env.*` | Não incluídos | Possíveis segredos, tokens e credenciais. |
| `/home/ubuntu/upload/AplicativoFullstackNexus.zip` | Não copiado diretamente | O inventário do ZIP original contém `.env`; o arquivo completo permanece somente fora do repositório para análise local. |
| Arquivos ausentes após a restauração do sandbox | Não inventados | A entrega reflete somente o material verificável disponível nesta execução. |
| Caminhos já presentes no repositório | Não sobrescritos | A cópia foi direcionada para namespace nova. |
| Commits e branches de outros desenvolvedores | Não alterados | A operação usa branch dedicada e não reescreve histórico. |

O ZIP entregue ao final será produzido a partir desta área já filtrada. Antes do commit final, será feita uma verificação adicional para impedir que nomes de segredo ou conteúdo sensível sejam incorporados acidentalmente.

> A contagem final será informada com transparência e não será artificialmente ajustada para atingir 295 ou 299 arquivos.
