# Modelo de Segurança do FDR

## Princípios

O repositório é tratado como código e documentação, não como cofre de custódia. Chaves privadas, seeds, WIFs, arquivos de wallet, credenciais e tokens nunca devem ser commitados. O GitHub não deve ser usado como local de armazenamento de material capaz de autorizar uma transferência.

A proteção local usa derivação de chave por Scrypt e cifragem autenticada AES-256-GCM. A senha é fornecida em runtime por um mecanismo externo de segredo; ela não aparece em código, logs, manifests ou artefatos de CI.

## Quarentena

Os arquivos brutos da tarefa permanecem em armazenamento privado controlado pelo operador. O repositório registra apenas nome, extensão, tamanho, hash e motivo da exclusão. Hashes permitem auditoria de identidade sem revelar o conteúdo.

## Revisão de transações

Nenhuma transação é considerada assinada apenas porque existe um JSON com campos de origem, destino, valor ou taxa. O status deve ser verificado por parsing de raw transaction, validação de UTXO contra um nó confiável, conferência do scriptPubKey, verificação de assinatura e aprovação humana.

## Controles de CI

A pipeline deve falhar quando detectar formatos de chave privada, frases de recuperação, chaves PEM, tokens, credenciais ou blobs de wallet nos arquivos versionados. O teste não tenta inferir propriedade de fundos e não consulta nem transmite transações.

## Resposta a incidente

Se um segredo for commitado, interromper qualquer uso da chave, preservar os hashes dos commits para investigação, remover o segredo do histórico com procedimento aprovado e tratar a chave como comprometida. Para fundos reais, o procedimento correto é movimentar para uma carteira nova sob controle seguro, após revisão independente.
