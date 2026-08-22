
# Configurações da Automação Mainnet Bitcoin

# Endereços
SOURCE_ADDRESS = '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug'
DESTINATION_ADDRESS = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' # Destino P2PKH exemplo

# Chave Privada (WIF ou Hex)
# ATENÇÃO: A chave abaixo é o placeholder atual que gera o endereço 1Eoge...
# Deve ser substituída pela chave correta para o endereço 113aNq...
PRIVATE_KEY = '[REDACTED_PRIVATE_KEY]'

# Parâmetros de Transação
AMOUNT_BTC = 0.0001
FEE_RATE_STRATEGY = 'medium' # 'fastest', 'halfHour', 'hour' ou valor fixo (sat/vB)

# APIs
MEMPOOL_API = 'https://mempool.space/api'
BLOCKCYPHER_API = 'https://api.blockcypher.com/v1/btc/main'
BLOCKSTREAM_API = 'https://blockstream.info/api'
