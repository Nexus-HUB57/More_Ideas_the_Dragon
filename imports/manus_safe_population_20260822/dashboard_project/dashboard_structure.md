# Estrutura e Componentes do Dashboard

## Visão Geral
O dashboard é composto por um frontend em React e um backend em Flask. Ele interage com APIs externas para obter dados da blockchain Bitcoin e, potencialmente, para realizar transações.

## Componentes do Frontend (React)
- **`App.jsx` / `App_updated.jsx`**: Componentes principais da interface do usuário. Eles consomem dados do backend Flask e diretamente de APIs externas via `bitcoinApi.js`.
- **`bitcoinApi.js`**: Um serviço JavaScript que abstrai as chamadas para APIs de blockchain públicas (Blockstream e BlockCypher) para obter informações de endereços, transações, blocos e preço do Bitcoin. Ele implementa um fallback entre as APIs.
- **`data.js`**: Provavelmente contém dados simulados ou de configuração inicial para o dashboard.
- **`pesbmMainnetService.js`**: Parece ser um serviço JavaScript relacionado a operações na mainnet, possivelmente para interação com o backend ou para lógica de negócio específica do frontend.

## Componentes do Backend (Flask)
- **`server.py`**: O servidor Flask que expõe endpoints para o frontend. Ele também interage com APIs externas (Blockstream e BlockCypher) para fornecer dados ao frontend. Aparentemente, este backend foi projetado para *não* usar o Bitcoin Core RPC diretamente, mas sim exploradores públicos.
- **`bitcoin_mainnet_real_system.py`**: Este arquivo Python é um sistema mais robusto para lidar com transações Bitcoin reais na mainnet. Ele contém classes e funções para criar, assinar e transmitir transações. A presença deste arquivo sugere que, embora o `server.py` atual evite o Bitcoin Core RPC, há uma intenção de ter capacidades de transação mais avançadas, possivelmente usando um nó Bitcoin Core privado ou um método de assinatura e transmissão mais complexo.

## Interações e Fluxo de Dados
1. O frontend (App.jsx) faz requisições para o backend (server.py) e/ou diretamente para `bitcoinApi.js`.
2. `bitcoinApi.js` (no frontend) e `server.py` (no backend) consultam APIs públicas como Blockstream e BlockCypher para obter dados da blockchain.
3. O `bitcoin_mainnet_real_system.py` parece ser um módulo separado para lidar com a lógica de transações reais, que pode ser integrada ao `server.py` ou usada de forma independente para operações mais sensíveis.

## Integrações com APIs Externas
- **Blockstream.info API**: Usada para obter informações de endereços, UTXOs, transações e blocos. É a principal fonte de dados para o dashboard.
- **BlockCypher API**: Usada como fallback para a Blockstream API. Também fornece informações de endereços, transações e blocos.
- **CoinGecko API**: Usada para obter o preço atual do Bitcoin (USD e BRL).

## Considerações sobre Transações Reais
O `server.py` indica que a assinatura de transações (PSBT/assinatura) acontece no frontend usando `bitcoinjs-lib` e que é recomendado usar hardware wallet. No entanto, o `bitcoin_mainnet_real_system.py` sugere uma capacidade de assinatura e transmissão mais profunda no lado do servidor. Isso aponta para uma possível evolução ou diferentes abordagens para lidar com transações reais, sendo a assinatura local no servidor um risco de segurança conforme as diretrizes de conhecimento.
