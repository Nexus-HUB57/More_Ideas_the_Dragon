# Política de Importação Segura

1. A operação parte do `origin/main` inspecionado.
2. A importação ocorre em branch exclusiva.
3. O destino foi verificado como novo antes da cópia.
4. Cada artefato é copiado para uma área dedicada, sem substituir caminhos existentes.
5. O commit contém somente o novo pacote, seu ZIP e seu hash.
6. Nenhuma branch, pasta, arquivo ou commit preexistente é excluído ou reescrito.
7. A validação registra contagem, manifesto, hashes e referência do commit-base.
