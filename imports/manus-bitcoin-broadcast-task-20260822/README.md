# Pacote de tarefa: Bitcoin Broadcast (sanitizado)

Este diretório contém os artefatos de código e documentação produzidos para a tarefa de broadcast Bitcoin. O conteúdo foi importado em um namespace exclusivo para evitar colisões com arquivos de outros desenvolvedores.

## Segurança e escopo

O pacote não inclui carteiras, arquivos `.dat`, chaves privadas, senhas, sementes, credenciais ou transações assinadas. Esses materiais nunca devem ser versionados. A assinatura e o broadcast permanecem operações manuais e fora deste pacote.

O script `generate_raw_tx.py` cria uma transação não assinada apenas com UTXOs fornecidos pelo operador. Antes de qualquer uso em Mainnet, valide cada UTXO, script de saída, taxa, troco e rede em ambiente offline/testnet apropriado.
