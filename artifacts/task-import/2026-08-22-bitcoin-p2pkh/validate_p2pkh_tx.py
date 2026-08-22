import hashlib
from binascii import hexlify, unhexlify
from bitcoinlib.keys import Key
from bitcoinlib.transactions import Transaction, Input, Output
import json

# Configurações da Mainnet
NETWORK = 'bitcoin'
SOURCE_ADDRESS = '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug'
DESTINATION_ADDRESS = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
AMOUNT_BTC = 0.0001
AMOUNT_SATOSHIS = int(AMOUNT_BTC * 100_000_000)

# Chave privada e senha para assinatura (conforme fornecido no contexto)
PRIVATE_KEY_WIF = '[REDACTED_WIF]'
PRIVATE_KEY_PASSWORD = '[REDACTED_SECRET]'

def validate_transaction_construction(manual_tx_hex, utxo_data):
    print("--- Validação da Transação ---")

    # 1. Decodificar a transação manual
    print("1. Decodificando a transação manual...")
    try:
        manual_tx = Transaction.parse(manual_tx_hex)
        print("   Transação manual decodificada com sucesso.")
    except Exception as e:
        print(f"   Erro ao decodificar transação manual: {e}")
        return False

    # 2. Reconstruir a transação usando bitcoinlib para comparação
    print("2. Reconstruindo a transação com bitcoinlib para comparação...")
    try:
        # Criar objeto Key para o endereço de origem
        key = Key(PRIVATE_KEY_WIF, network=NETWORK, password=[REDACTED_SECRET]

        # Criar uma nova transação com bitcoinlib
        lib_tx = Transaction()

        # Adicionar input
        # O script_type 'p2pkh' é para transações legadas
        lib_tx.add_input(txid=utxo_data['txid'], vout=utxo_data['vout'], value=utxo_data['value'], script_type='p2pkh', address=SOURCE_ADDRESS)

        # Adicionar output de destino
        lib_tx.add_output(address=DESTINATION_ADDRESS, value=AMOUNT_SATOSHIS)

        # Calcular a taxa de transação (simplificado para este exemplo, o ideal seria recalcular)
        # Para este teste, vamos usar a taxa estimada da transação manual
        # Assumindo que a transação manual tem 2 outputs (destino e troco) ou 1 (destino, se troco for dust)
        if len(manual_tx.outputs) == 2:
            estimated_fee = utxo_data['value'] - AMOUNT_SATOSHIS - manual_tx.outputs[1].value
        else: # If change was dust
            estimated_fee = utxo_data['value'] - AMOUNT_SATOSHIS

        # Adicionar output de troco (se houver)
        change_value = utxo_data['value'] - AMOUNT_SATOSHIS - estimated_fee
        if change_value > 546: # Dust limit
            lib_tx.add_output(address=SOURCE_ADDRESS, value=change_value)

        # Assinar a transação
        lib_tx.sign(key)
        lib_tx_hex = lib_tx.hex()
        print("   Transação bitcoinlib reconstruída e assinada com sucesso.")
    except Exception as e:
        print(f"   Erro ao reconstruir e assinar transação com bitcoinlib: {e}")
        return False

    # 3. Comparar scriptPubKeys dos outputs
    print("3. Comparando scriptPubKeys dos outputs...")
    if len(manual_tx.outputs) != len(lib_tx.outputs):
        print(f"   Número de outputs diferente. Manual: {len(manual_tx.outputs)}, Lib: {len(lib_tx.outputs)}")
        return False

    for i in range(len(manual_tx.outputs)):
        if manual_tx.outputs[i].script_pubkey != lib_tx.outputs[i].script_pubkey:
            print(f"   scriptPubKey do output {i} diferente.")
            print(f"      Manual: {manual_tx.outputs[i].script_pubkey.hex()}")
            print(f"      Lib:    {lib_tx.outputs[i].script_pubkey.hex()}")
            return False
    print("   scriptPubKeys dos outputs são idênticos.")

    # 4. Comparar scriptSigs dos inputs
    print("4. Comparando scriptSigs dos inputs...")
    if len(manual_tx.inputs) != len(lib_tx.inputs):
        print(f"   Número de inputs diferente. Manual: {len(manual_tx.inputs)}, Lib: {len(lib_tx.inputs)}")
        return False

    for i in range(len(manual_tx.inputs)):
        # Para P2PKH, o scriptSig contém a assinatura e a chave pública
        # A comparação direta pode falhar devido a pequenas variações na codificação DER da assinatura
        # ou na representação da chave pública, mesmo que sejam válidas.
        # Uma abordagem mais robusta seria verificar se o scriptSig é válido, mas isso é mais complexo.
        # Por enquanto, vamos comparar os hashes dos scriptSigs.
        if hashlib.sha256(manual_tx.inputs[i].script_sig).digest() != hashlib.sha256(lib_tx.inputs[i].script_sig).digest():
            print(f"   scriptSig do input {i} diferente (hash).")
            print(f"      Manual ScriptSig: {manual_tx.inputs[i].script_sig.hex()}")
            print(f"      Lib ScriptSig:    {lib_tx.inputs[i].script_sig.hex()}")
            # Para uma validação mais profunda, poderíamos tentar verificar a assinatura
            # manual_tx.verify_input(i, utxo_data['value'], script_pubkey_of_utxo)
            return False
    print("   scriptSigs dos inputs são idênticos (hash).")

    print("--- Validação Concluída: Transação manual parece consistente com bitcoinlib. ---")
    return True

if __name__ == '__main__':
    # Carregar a transação manual e os UTXOs usados
    try:
        with open('signed_transaction_manual_byte_by_byte_20250918_221059.json', 'r') as f:
            tx_data = json.load(f)
        manual_tx_hex = tx_data['tx_hex']
        utxo_data = tx_data['used_utxos'][0] # Assumindo um único UTXO por enquanto

        validate_transaction_construction(manual_tx_hex, utxo_data)
    except FileNotFoundError:
        print("Erro: Arquivo signed_transaction_manual_byte_by_byte_20250918_221059.json não encontrado.")
    except Exception as e:
        print(f"Erro ao carregar dados da transação: {e}")
