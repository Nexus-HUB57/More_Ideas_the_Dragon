# Design da Arquitetura e Especificações Técnicas da FênixWallet

**Autor:** Manus AI

## 1. Introdução

Este documento detalha o design da arquitetura e as especificações técnicas para o desenvolvimento da FênixWallet, um aplicativo de carteira digital que visa integrar a robustez da infraestrutura Electrum com a capacidade de importar e gerenciar chaves de arquivos `wallet.dat` do Bitcoin Core. O objetivo é fornecer uma solução leve, segura e eficiente para o gerenciamento de ativos Bitcoin, com uma interface de usuário intuitiva e rica em funcionalidades, conforme o protótipo HTML/CSS fornecido.

## 2. Visão Geral da Arquitetura

A FênixWallet será desenvolvida como uma aplicação cliente-servidor, dividida em duas partes principais: um backend responsável pela lógica de negócios, comunicação com a rede Bitcoin (via ElectrumX) e manipulação de dados sensíveis, e um frontend que fornecerá a interface de usuário interativa. A comunicação entre o frontend e o backend será realizada através de uma API RESTful, garantindo modularidade e escalabilidade.

```mermaid
graph TD
    A[Usuário] -->|Interage com| B(Frontend - FênixWallet UI)
    B -->|Requisições API REST| C(Backend - FênixWallet Server)
    C -->|Protocolo Electrum (Stratum)| D(Servidores ElectrumX)
    D -->|Dados da Blockchain| E(Rede Bitcoin)
    C -->|Leitura/Escrita| F(Armazenamento Local de Carteiras)
    F -->|Arquivos .dat, .wallet, etc.| G(Arquivos de Carteira)
```

## 3. Componentes da Arquitetura

### 3.1. Frontend (Interface de Usuário)

O frontend será a camada de apresentação, responsável por exibir as informações da carteira, coletar entradas do usuário e interagir com o backend. Será construído utilizando tecnologias web padrão (HTML, CSS, JavaScript), com base no protótipo fornecido. A escolha de um framework JavaScript (como React, Vue.js ou Angular) será avaliada durante a fase de implementação para otimizar o desenvolvimento e a reatividade da interface.

**Tecnologias Propostas:**
*   **HTML5:** Estrutura da página.
*   **CSS3:** Estilização e responsividade (com base no CSS fornecido).
*   **JavaScript (ES6+):** Lógica de interação e comunicação com o backend.
*   **Framework JavaScript (a definir):** Para gerenciamento de estado e componentes (ex: React).

**Funcionalidades Chave:**
*   Exibição de saldos totais (confirmados e não confirmados).
*   Listagem detalhada de endereços e seus respectivos saldos e transações.
*   Funcionalidade de importação de carteiras (via upload de arquivos).
*   Carregamento e atualização de dados da carteira.
*   Exportação de dados para CSV.
*   Notificações e feedback visual ao usuário.

### 3.2. Backend (Servidor FênixWallet)

O backend será o coração da aplicação, gerenciando a lógica de negócios, a segurança e a comunicação com a rede Bitcoin. Será implementado em Python, aproveitando a expertise em Python e a disponibilidade de bibliotecas para manipulação de criptomoedas e comunicação Electrum.

**Tecnologias Propostas:**
*   **Python 3.x:** Linguagem de programação principal.
*   **Framework Web (Flask/FastAPI):** Para construir a API RESTful.
*   **Bibliotecas Criptográficas:** Para manipulação de chaves, endereços e transações (ex: `bitcoinlib`, `pycoin`, `python-bitcoinrpc`).
*   **Cliente Electrum Protocolo:** Para comunicação com servidores ElectrumX (ex: `python-electrum` ou implementação customizada).
*   **Módulo de Parsing `wallet.dat`:** Para extrair chaves privadas de arquivos `wallet.dat` do Bitcoin Core.

**Funcionalidades Chave:**
*   **API RESTful:** Expor endpoints para o frontend para:
    *   Importação de carteiras.
    *   Obtenção de saldos de endereços.
    *   Consulta de histórico de transações.
    *   (Futuramente) Criação e assinatura de transações.
*   **Gerenciamento de Carteiras:** Armazenamento seguro e criptografado das chaves privadas importadas ou geradas.
*   **Conectividade ElectrumX:** Manter conexão com servidores ElectrumX para obter dados da blockchain de forma eficiente.
*   **Processamento de `wallet.dat`:** Implementar a lógica para ler e extrair chaves privadas de arquivos `wallet.dat` do Bitcoin Core. Isso pode envolver a utilização de ferramentas externas ou bibliotecas Python que possam interpretar o formato Berkeley DB e as estruturas de dados internas do Bitcoin Core.
*   **Criptografia:** Garantir que as chaves privadas e outros dados sensíveis sejam armazenados de forma criptografada no backend.

### 3.3. Servidores ElectrumX

Os servidores ElectrumX são nós completos da rede Bitcoin que indexam a blockchain e fornecem dados aos clientes Electrum de forma leve e eficiente. Nossa aplicação se conectará a esses servidores para obter informações sobre saldos e transações sem a necessidade de baixar a blockchain completa.

**Função:**
*   Fornecer dados da blockchain (saldos, transações, status de confirmação) via protocolo Electrum (Stratum).

## 4. Fluxo de Dados e Interações

### 4.1. Importação de Carteira (`wallet.dat`)

1.  **Usuário:** Faz upload do arquivo `wallet.dat` através da interface do frontend.
2.  **Frontend:** Envia o arquivo para um endpoint específico no backend via requisição HTTP POST.
3.  **Backend:**
    *   Recebe o arquivo `wallet.dat`.
    *   Utiliza um módulo de parsing para extrair as chaves privadas (WIFs) do arquivo. Este é um passo crítico que exigirá pesquisa e possivelmente o uso de ferramentas ou bibliotecas especializadas (ex: `pywallet` ou similar, ou reimplementação da lógica de parsing do Berkeley DB e estruturas de chaves do Bitcoin Core).
    *   Criptografa as chaves privadas extraídas e as armazena de forma segura no armazenamento local do backend.
    *   Associa essas chaves a uma nova "carteira importada" no sistema da FênixWallet.
    *   Retorna um status de sucesso/falha ao frontend.
4.  **Frontend:** Exibe uma mensagem de sucesso ou erro ao usuário.

### 4.2. Carregamento de Saldos e Transações

1.  **Usuário:** Seleciona uma carteira (Fênix, Gênesis, Importadas) e clica em "Carregar Saldos" no frontend.
2.  **Frontend:** Envia uma requisição GET para o backend, solicitando os saldos e transações dos endereços associados à carteira selecionada.
3.  **Backend:**
    *   Recupera as chaves públicas/endereços da carteira selecionada do armazenamento local.
    *   Para cada endereço, faz chamadas ao servidor ElectrumX via protocolo Stratum para obter:
        *   `blockchain.scripthash.get_balance` (para saldos confirmados e não confirmados).
        *   `blockchain.scripthash.get_history` (para histórico de transações).
    *   Processa os dados recebidos dos servidores ElectrumX.
    *   Calcula os saldos totais e organiza o histórico de transações.
    *   Retorna os dados processados ao frontend.
4.  **Frontend:** Atualiza o dashboard e a tabela de saldos/transações com os dados recebidos.

## 5. Considerações de Segurança

A segurança é primordial para uma aplicação de carteira. As seguintes medidas serão consideradas:

*   **Criptografia de Chaves Privadas:** Todas as chaves privadas armazenadas no backend serão criptografadas em repouso usando algoritmos fortes (ex: AES-256).
*   **Comunicação Segura:** A comunicação entre frontend e backend será via HTTPS. A comunicação com servidores ElectrumX preferencialmente usará SSL/TLS.
*   **Validação de Entrada:** Todas as entradas do usuário e dados recebidos de fontes externas serão rigorosamente validados para prevenir ataques como injeção de código.
*   **Gerenciamento de Senhas:** Se a carteira tiver uma senha, ela será usada para derivar a chave de criptografia das chaves privadas.
*   **Minimização de Dados Sensíveis:** Apenas os dados estritamente necessários serão armazenados no backend.

## 6. Próximos Passos

Com este design de arquitetura em mente, o próximo passo será aprofundar nas especificações técnicas de cada componente, especialmente a implementação do módulo de parsing para `wallet.dat` e a comunicação com os servidores ElectrumX. A escolha de bibliotecas e frameworks específicos será refinada durante a fase de implementação.



## 7. Especificações Técnicas Detalhadas

### 7.1. Módulo de Parsing `wallet.dat`

O arquivo `wallet.dat` do Bitcoin Core é um arquivo de banco de dados Berkeley DB que armazena diversas informações, incluindo chaves privadas, transações, metadados e configurações. Para extrair as chaves privadas, será necessário:

1.  **Leitura do Berkeley DB:** Utilizar uma biblioteca Python capaz de ler arquivos Berkeley DB (ex: `bsddb3` ou `python-leveldb` se o formato for LevelDB em versões mais recentes do Bitcoin Core, embora `wallet.dat` tradicionalmente use Berkeley DB).
2.  **Identificação de Registros de Chaves:** Dentro do Berkeley DB, as chaves privadas são armazenadas em registros específicos. Será preciso identificar a estrutura desses registros, que geralmente contêm o par chave-valor onde a chave é `key` e o valor é a chave privada criptografada ou não.
3.  **Descriptografia (se necessário):** Se o `wallet.dat` for protegido por senha, as chaves privadas estarão criptografadas (geralmente com AES-256). Será necessário implementar a lógica de descriptografia, que requer a senha fornecida pelo usuário. Ferramentas como `pywallet` ou `btcrecover` podem servir de referência para entender o processo de descriptografia e extração.
4.  **Conversão para WIF:** As chaves privadas extraídas precisarão ser convertidas para o formato Wallet Import Format (WIF), que é um formato padrão para importação de chaves privadas em outras carteiras.

**Desafios:**
*   O formato interno do `wallet.dat` pode variar ligeiramente entre as versões do Bitcoin Core.
*   A complexidade da descriptografia se o arquivo for protegido por senha.
*   A necessidade de lidar com diferentes tipos de chaves (P2PKH, P2SH, SegWit).

### 7.2. Comunicação com Servidores ElectrumX (Protocolo Stratum)

A comunicação com os servidores ElectrumX será realizada através do protocolo Stratum, que é baseado em JSON-RPC. As principais operações que o backend precisará realizar incluem:

1.  **Conexão:** Estabelecer uma conexão TCP ou SSL/TLS com um servidor ElectrumX.
2.  **Handshake:** Realizar o handshake inicial para negociar a versão do protocolo.
3.  **Assinatura de Endereços (Script Hashes):** Para cada endereço Bitcoin que a carteira gerencia, é necessário obter seu `script hash`. O `script hash` é uma representação do endereço usada pelo protocolo Electrum para consultar saldos e histórico de transações de forma eficiente e privada.
4.  **Consulta de Saldo:** Enviar requisições `blockchain.scripthash.get_balance` para obter o saldo confirmado e não confirmado de um `script hash`.
5.  **Consulta de Histórico de Transações:** Enviar requisições `blockchain.scripthash.get_history` para obter a lista de transações associadas a um `script hash`.
6.  **Monitoramento de Endereços:** Opcionalmente, pode-se usar `blockchain.scripthash.subscribe` para receber atualizações em tempo real sobre mudanças de saldo ou novas transações para um `script hash`.
7.  **Envio de Transações (futuro):** Para enviar transações, será necessário construir a transação localmente (usando as chaves privadas), assiná-la e então transmiti-la para a rede via `blockchain.transaction.broadcast`.

**Bibliotecas Python para Electrum Protocolo:**
*   A biblioteca `python-electrum` (ou uma de suas variantes/forks) é uma candidata forte para lidar com a comunicação do protocolo Electrum, abstraindo muitos dos detalhes de baixo nível do JSON-RPC e do Stratum.
*   Alternativamente, pode-se implementar um cliente Stratum customizado usando bibliotecas de rede padrão do Python (ex: `asyncio`, `socket`) e um parser JSON.

## 8. Estrutura de Dados Interna da Carteira

Para gerenciar as carteiras importadas e as chaves, o backend manterá uma estrutura de dados interna que mapeará os endereços Bitcoin para suas chaves privadas correspondentes (criptografadas) e associará esses endereços a uma carteira lógica (e.g., "Fênix", "Gênesis", "Importada").

**Exemplo de Estrutura (JSON/Dicionário Python):**

```json
{
  "wallets": [
    {
      "id": "fenix_wallet",
      "name": "Fênix",
      "type": "generated",
      "addresses": [
        {
          "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
          "wif": "L1Ts123... (criptografado)",
          "script_hash": "<script_hash_do_endereco>"
        }
      ]
    },
    {
      "id": "imported_wallet_1",
      "name": "Carteira Importada 1",
      "type": "imported_dat",
      "source_file": "1.dat",
      "addresses": [
        {
          "address": "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
          "wif": "KxTs123... (criptografado)",
          "script_hash": "<script_hash_do_endereco>"
        }
      ]
    }
  ]
}
```

Esta estrutura será armazenada de forma persistente e criptografada no sistema de arquivos do backend.

