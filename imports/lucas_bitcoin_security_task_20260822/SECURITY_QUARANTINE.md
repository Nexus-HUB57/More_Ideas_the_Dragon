# Security Quarantine — Safe Recovery

Os itens abaixo foram deliberadamente excluídos deste import público e não serão enviados ao GitHub.

| Item | Motivo | Tratamento |
| --- | --- | --- |
| `wallet_ben.dat` | Pode conter material criptográfico, credenciais ou dados de carteira | Manter em armazenamento privado; não publicar |
| Listas de endereços ricos/inativos | Poderiam servir como conjunto de alvos | Não publicar nem usar para tentativa de acesso |
| Capturas de tela com QR codes ou carteiras | Podem revelar dados operacionais | Não publicar |
| Simulador de força bruta | Poderia facilitar descoberta não autorizada de chaves | Não publicar nem executar contra mainnet |
| Seeds, passphrases, tokens e chaves privadas | Segredos de autenticação e custódia | Nunca versionar |

## Regra operacional

Nenhum segredo, chave privada, seed, passphrase, token, QR code ou artefato destinado a obter acesso a ativos de terceiros deve ser commitado. A inatividade ou o saldo de um endereço não constitui autorização para tentar recuperar ou gastar seus fundos.

## Verificação

O workflow seguro verifica que o diretório `source_snapshot/` não contém payloads com nomes sensíveis nem material de chave privada conhecido.

**Prepared by:** Manus AI
**Date:** 2026-08-22
