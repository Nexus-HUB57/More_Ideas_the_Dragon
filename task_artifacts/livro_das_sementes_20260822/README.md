# Artefatos — Livro das Sementes

Este diretório reúne os arquivos produzidos ou fornecidos nesta tarefa de renovação da capa do **Livro das Sementes**.

## Escopo

O objetivo da tarefa foi utilizar a árvore da capa do **Livro da Vanguarda** na capa do **Livro das Sementes**, preservando o modelo, o título e os demais elementos visuais da capa original.

| Arquivo | Função |
|---|---|
| `01_capa_original_livro_das_sementes.png` | Capa original fornecida como base. |
| `02_referencia_arvore_livro_da_vanguarda.png` | Referência fornecida para a árvore. |
| `03_capa_gerada_v1.png` | Primeira versão gerada durante a tarefa. |
| `04_capa_gerada_v2_titulo_corrigido.png` | Versão intermediária com o título em português. |
| `05_capa_final_arvore_substituida.png` | Última versão gerada, com foco na substituição da árvore. |
| `SHA256SUMS` | Checksums dos arquivos do pacote. |
| `MANIFESTO.md` | Inventário, validações e protocolo de recuperação. |

## Protocolo Safe Recovery

Nenhum arquivo ou pasta existente do repositório foi sobrescrito ou removido. Os artefatos foram adicionados exclusivamente nesta pasta nova, em uma branch própria, derivada de `origin/main` após auditoria. O pacote ZIP correspondente é gerado fora do diretório de origem dos artefatos para evitar autorreferência e duplicação acidental.

## Integridade

Consulte `SHA256SUMS` para verificar a integridade binária. A validação deve ser executada dentro deste diretório com `sha256sum -c SHA256SUMS`.

## Observação sobre os arquivos numerados do repositório

O repositório já continha milhares de arquivos e múltiplos pacotes/branches relacionados às tarefas numeradas antes desta contribuição. Eles foram preservados integralmente; este pacote não replica nem reescreve esse histórico. A contribuição desta tarefa está delimitada aos artefatos listados acima.

## Licença e procedência

Os arquivos visuais foram fornecidos ou gerados no contexto desta conversa. Nenhum arquivo externo foi baixado para compor este pacote.

> Este pacote é aditivo e reversível: sua remoção, caso autorizada futuramente, não exige alterar ou excluir qualquer conteúdo pré-existente do repositório.
