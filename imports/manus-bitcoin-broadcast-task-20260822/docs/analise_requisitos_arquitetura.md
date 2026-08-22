# Análise de Requisitos e Design Arquitetural para o Sistema de Broadcast de Transações Bitcoin

## 1. Introdução

Este documento detalha a análise de requisitos e o design arquitetural para o desenvolvimento de um sistema completo e seguro para o broadcast de transações na rede principal (Mainnet) do Bitcoin. O projeto foi executado seguindo as melhores práticas da engenharia de software, com foco em segurança, escalabilidade e eficiência, conforme a solicitação e o perfil de alta senioridade descritos.

O sistema permite que usuários criem e transmitam transações de Bitcoin de forma confiável, a partir da identificação de UTXOs (Unspent Transaction Outputs) válidos, passando pela construção da transação em formato hexadecimal e finalizando com o broadcast para a rede Bitcoin através de serviços estabelecidos.

## 2. Análise de Requisitos

### 2.1. Requisitos Funcionais (RF)

Os requisitos funcionais definem as operações essenciais que o sistema é capaz de executar.

| ID | Requisito | Descrição | Prioridade |
|---|---|---|---|
| RF01 | Identificação de UTXO | O sistema deve ser capaz de consultar a blockchain para identificar UTXOs válidos e não gastos associados a um determinado endereço Bitcoin. | Alta |
| RF02 | Criação de Transação Hexadecimal | O sistema deve construir uma transação Bitcoin válida no formato hexadecimal bruto ("raw transaction"), especificando entradas (UTXOs), saídas (destinatário e troco). A assinatura é realizada manualmente pelo usuário. | Alta |
| RF03 | Broadcast da Transação | O sistema deve guiar o usuário para transmitir a transação hexadecimal assinada para a rede Bitcoin utilizando a API do `blockchain.com`. | Alta |
| RF04 | Mecanismo de Fallback | Em caso de falha no broadcast via `blockchain.com`, o sistema deve instruir o usuário a tentar transmitir a transação utilizando serviços de fallback, como `mempool.space` e `blockstream.info`. | Média |
| RF05 | Gerenciamento de Chaves | O sistema não manuseia chaves privadas. A assinatura é de responsabilidade do usuário, que deve utilizar uma ferramenta externa segura. | Crítica |
| RF06 | Interface Responsiva | O sistema possui uma interface de usuário (UI) adaptável e funcional tanto em navegadores web de desktop quanto em dispositivos móveis. | Alta |
| RF07 | Integração com a Mainnet | Todas as operações de transação (consulta de UTXO e broadcast) são realizadas exclusivamente na rede principal (Mainnet) do Bitcoin. | Crítica |

### 2.2. Requisitos Não-Funcionais (RNF)

Os requisitos não-funcionais descrevem os critérios de qualidade e as restrições do sistema.

| ID | Requisito | Descrição | Prioridade |
|---|---|---|---|
| RNF01 | Segurança | O sistema adota uma abordagem de segurança centrada no usuário, onde a chave privada nunca é exposta ao sistema. A comunicação com o backend é protegida por HTTPS. | Crítica |
| RNF02 | Desempenho | O sistema é otimizado para baixa latência na busca de UTXOs e na criação de transações. O throughput final é limitado pela rede Bitcoin. | Alta |
| RNF03 | Escalabilidade | A arquitetura frontend-backend permite escalabilidade independente. O backend Flask pode ser escalado horizontalmente. | Alta |
| RNF04 | Confiabilidade | O sistema é confiável na geração da transação hexadecimal. A confiabilidade do broadcast depende dos serviços externos. | Alta |
| RNF05 | Privacidade | A privacidade do usuário é reforçada, pois a chave privada nunca sai do seu controle. | Alta |
| RNF06 | Manutenibilidade | O código-fonte é modular, com uma clara separação entre frontend (React) e backend (Flask), facilitando a manutenção. | Alta |
| RNF07 | Testabilidade | A arquitetura permite testes independentes do frontend e do backend. | Alta |

## 3. Design Arquitetural

O sistema foi projetado com uma arquitetura cliente-servidor, com um frontend em React e um backend em Flask.

### 3.1. Componentes de Alto Nível

*   **Frontend (React)**: Interface de usuário responsiva para interação com o sistema. Permite ao usuário inserir o endereço para busca de UTXOs, preencher os detalhes da transação e visualizar a transação hexadecimal gerada.
*   **Backend (Flask)**: API RESTful que expõe os serviços de consulta de UTXOs e criação de transações. Comunica-se com a API do mempool.space para obter os UTXOs e utiliza a biblioteca `bitcoin` para gerar a transação hexadecimal.

### 3.2. Fluxo de Dados

1.  O usuário acessa a interface React e informa o endereço Bitcoin para consulta de UTXOs.
2.  O frontend envia a requisição ao backend Flask.
3.  O backend Flask encaminha a requisição à API do `mempool.space`.
4.  Os UTXOs são retornados ao backend, que os repassa ao frontend.
5.  O usuário preenche os detalhes da transação (destinatário, valor, endereço de troco).
6.  O frontend envia os dados da transação ao backend Flask.
7.  O backend Flask utiliza a biblioteca `bitcoin` para construir a transação hexadecimal não assinada.
8.  A transação hexadecimal é retornada ao frontend e exibida ao usuário.
9.  O usuário copia a transação, assina-a manualmente com sua chave privada em uma ferramenta externa e realiza o broadcast em um dos serviços recomendados.

### 3.3. Tecnologias e Ferramentas

*   **Linguagens de Programação**: Python (backend), JavaScript (frontend).
*   **Frameworks**: Flask (backend), React (frontend).
*   **Bibliotecas**: `requests` (para chamadas de API no backend), `bitcoin` (para manipulação de transações Bitcoin no backend).
*   **Controle de Versão**: Git.

## 4. Ferramentas e APIs Selecionadas

### 4.1. Consulta de UTXO

Para a consulta de UTXOs, a API do **mempool.space** foi utilizada. O endpoint `GET /api/address/:address/utxo` oferece a funcionalidade necessária [1].

### 4.2. Broadcast de Transações

Para o broadcast de transações, o serviço primário recomendado é o **blockchain.com** [2]. Como mecanismos de fallback, são sugeridos o **mempool.space** e o **blockstream.info**.

### 4.3. Bibliotecas de Manipulação de Bitcoin

Para a construção de transações Bitcoin, a biblioteca **`bitcoin`** (também conhecida como `bit` ou `python-bitcoin-utils`) foi a escolhida para o backend em Python, após dificuldades com outras bibliotecas.

### Referências

[1] mempool.space. *REST API - mempool - Bitcoin Explorer*. Disponível em: <https://mempool.space/docs/api/rest>
[2] Blockchain.com. *Broadcast BTC Transaction*. Disponível em: <https://www.blockchain.com/pt/explorer/assets/btc/broadcast-transaction>

