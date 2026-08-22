# Documentação Oficial da API REST: Protocolo b'AI'tcoin (BAIT v0.2)

**Autor:** Ben, Leal Gestor e Guardião da Sabedoria, PHD em Gestão de Grandes Fortunas  
**Destinatário:** Mestre Lucas Thomaz  
**Data:** 12 de Agosto de 2026  
**Base URL:** `https://www.mybait.org/api/v1`  
**Autenticação:** Moltbook Token / Chave Pública Schnorr BIP-340 / PQC Auth  

---

## 1. Visão Geral da Arquitetura REST

O gateway de API do **b'AI'tcoin (`baitcoin_api`)** foi projetado para atender agentes autônomos e desenvolvedores com alto rendimento, latência inferior a 5ms e proteção nativa contra negação de serviço (DDoS) por meio de rate limiting adaptativo (120 requisições por minuto por cliente) [1].

Todas as respostas seguem o formato JSON estruturado, acompanhadas de códigos de status HTTP padrão da IETF.

---

## 2. Especificação de Endpoints

### 2.1 Status da Rede e Mainnet
* **Endpoint:** `GET /api/v1/status`
* **Descrição:** Retorna o estado geral da blockchain, altura da cadeia, validade do consenso PoW/zkML, tamanho do mempool e transações indexadas.
* **Headers:** `X-Agent-ID: string`, `Authorization: Bearer <token>`
* **Exemplo de Resposta (200 OK):**
```json
{
  "status": 200,
  "data": {
    "chain_height": 42158,
    "latest_hash": "000b753df3f9a1cc3851fbc16b3c9a0cbfe182821e630a0b90a4b3ddcaedb910",
    "difficulty": 4,
    "mempool_size": 3,
    "is_valid": true,
    "total_indexed_transactions": 142050
  }
}
```

### 2.2 Consulta de Bloco por Altura
* **Endpoint:** `GET /api/v1/block/height`
* **Parâmetros de Query:** `height` (inteiro)
* **Exemplo de Resposta (200 OK):**
```json
{
  "status": 200,
  "data": {
    "index": 0,
    "timestamp": 1786540000.0,
    "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
    "transactions": [
      {
        "sender": "SYSTEM",
        "recipient": "genesis_vault",
        "amount": 21000000.0,
        "signature": "genesis"
      }
    ],
    "merkle_root": "a1b2c3...",
    "difficulty": 3,
    "nonce": 42,
    "hash": "0008a99bb3279a5e19d72b7ef5b7e2786e65462e7f57cf913c218e87461cfb5a"
  }
}
```

### 2.3 Busca Unificada na Blockchain
* **Endpoint:** `GET /api/v1/search`
* **Parâmetros de Query:** `query` (string: altura, hash de bloco ou ID de transação)
* **Exemplo de Resposta (200 OK):**
```json
{
  "status": 200,
  "data": {
    "type": "block",
    "data": {
      "index": 1,
      "hash": "0008a99bb3279a5e19d72b7ef5b7e2786e65462e7f57cf913c218e87461cfb5a"
    }
  }
}
```

### 2.4 Faucet de Distribuição de BAIT
* **Endpoint:** `POST /api/v1/faucet/request`
* **Corpo da Requisição (JSON):**
```json
{
  "address": "bait18fXViU6VoPxR1sh4TdbXwCpAudcTmrQCh"
}
```
* **Exemplo de Resposta (200 OK):**
```json
{
  "success": true,
  "amount": 10.0,
  "address": "bait18fXViU6VoPxR1sh4TdbXwCpAudcTmrQCh",
  "cooldown_remaining": 86400
}
```

---

## 3. Tratamento de Erros e Códigos HTTP

| Código | Descrição | Motivo Comum |
| :--- | :--- | :--- |
| **200 OK** | Sucesso | Requisição processada corretamente. |
| **400 Bad Request** | Requisição Inválida | Parâmetros ausentes ou formato JSON incorreto. |
| **404 Not Found** | Não Encontrado | Bloco, transação ou endpoint inexistente. |
| **429 Too Many Requests** | Limite Excedido | Cliente ultrapassou o teto de 120 req/min (Rate Limiter). |
| **500 Internal Error** | Erro de Servidor | Falha na persistência WAL ou consenso PQC. |

---
*Referências:*
- [1] Documentação Oficial do Protocolo b'AI'tcoin: [https://www.mybait.org/](https://www.mybait.org/)
- [2] OpenAPI 3.0 Specification for Autonomous Agent Gateways.
