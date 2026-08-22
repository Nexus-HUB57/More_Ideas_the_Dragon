# Arquitetura do Sistema de Carteira Digital Bitcoin

## 1. Visão Geral

Esta documentação descreve a arquitetura do sistema de carteira digital Bitcoin, projetado para ser seguro, escalável e eficiente. O sistema será construído utilizando uma arquitetura de microsserviços, com um backend desenvolvido em Flask (Python) e um frontend em React. A comunicação entre o frontend e o backend será feita através de uma API RESTful.

## 2. Arquitetura de Alto Nível

A arquitetura do sistema será composta pelos seguintes componentes:

- **Frontend:** Uma aplicação web responsiva construída com React, que fornecerá a interface do usuário para interagir com a carteira.
- **Backend:** Um conjunto de microsserviços desenvolvidos em Flask, responsáveis pela lógica de negócios, gerenciamento de carteiras e comunicação com a blockchain Bitcoin.
- **Banco de Dados:** Um banco de dados NoSQL (MongoDB) para armazenar informações da carteira, como endereços, chaves privadas criptografadas e histórico de transações.
- **Cache:** Um cache em memória (Redis) para armazenar dados frequentemente acessados, como saldos de endereços, para melhorar o desempenho.
- **Blockchain Gateway:** Um serviço responsável por interagir com a blockchain Bitcoin, utilizando as bibliotecas do Electrum e APIs públicas para obter informações de transações e saldos.

## 3. Estrutura de Dados

O banco de dados MongoDB armazenará as seguintes coleções:

- **`wallets`:**
    - `_id`: ObjectID
    - `name`: String
    - `created_at`: Datetime
- **`addresses`:**
    - `_id`: ObjectID
    - `wallet_id`: ObjectID (referência à coleção `wallets`)
    - `address`: String (endereço Bitcoin)
    - `private_key_encrypted`: String (chave privada criptografada com AES-256)
    - `created_at`: Datetime
- **`transactions`:**
    - `_id`: ObjectID
    - `txid`: String (ID da transação na blockchain)
    - `wallet_id`: ObjectID (referência à coleção `wallets`)
    - `inputs`: Array de objetos (endereços de entrada e valores)
    - `outputs`: Array de objetos (endereços de saída e valores)
    - `fee`: Number (taxa de transação)
    - `created_at`: Datetime

## 4. Protocolos de Segurança

- **Criptografia de Chaves Privadas:** As chaves privadas serão criptografadas no cliente (frontend) antes de serem enviadas para o backend. A criptografia será feita com o algoritmo AES-256, utilizando a passphrase fornecida pelo usuário: `${CAISK_PASSPHRASE}`.
- **Comunicação Segura:** Toda a comunicação entre o frontend e o backend será feita através de HTTPS.
- **Hashing:** As senhas dos usuários serão armazenadas como hashes seguros (SHA-256).

## 5. Integração com Electrum

A integração com as bibliotecas do Electrum (versões 1.8, 1.9, 2.0) será feita através de um wrapper em Python. Este wrapper irá expor as funcionalidades necessárias para a criação e assinatura de transações, adaptando o código legado para ser compatível com o ambiente Python 3 do backend.

## 6. Design da API RESTful

A API RESTful terá os seguintes endpoints:

- `POST /api/wallets`: Criar uma nova carteira.
- `GET /api/wallets/{wallet_id}`: Obter informações de uma carteira.
- `POST /api/wallets/{wallet_id}/addresses`: Gerar um novo endereço para uma carteira.
- `GET /api/wallets/{wallet_id}/addresses`: Listar os endereços de uma carteira.
- `POST /api/wallets/{wallet_id}/import`: Importar endereços e chaves privadas de um arquivo.
- `POST /api/wallets/{wallet_id}/transactions`: Criar e enviar uma nova transação.
- `GET /api/wallets/{wallet_id}/transactions`: Listar as transações de uma carteira.

