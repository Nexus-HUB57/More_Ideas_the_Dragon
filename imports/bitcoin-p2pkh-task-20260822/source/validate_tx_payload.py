import json
from bitcoinlib.transactions import Transaction

def validate_hex(tx_hex):
    print("=== INICIANDO VALIDAÇÃO TÉCNICA DO PAYLOAD HEX ===")
    print(f"Tamanho do Hex: {len(tx_hex)} caracteres ({len(tx_hex)//2} bytes)")

    # 1. Verificar marcadores de SegWit (marker e flag não devem existir em tx puramente legacy)
    # Em tx legacy, o primeiro campo após a versão é o varint de contagem de inputs.
    # Se houver marcador 0x00 e flag 0x01, indicaria SegWit.
    # Vamos decodificar com bitcoinlib:
    tx = Transaction()
    tx.parse_hex(tx_hex)

    print(f"TXID Calculado: {tx.txid}")
    print(f"Número de Inputs: {len(tx.inputs)}")
    print(f"Número de Outputs: {len(tx.outputs)}")

    for i, inp in enumerate(tx.inputs):
        print(f"  Input [{i}]: prev_txid={inp.prev_txid}, output_n={inp.output_n}, address={inp.address}")

    for o, out in enumerate(tx.outputs):
        print(f"  Output [{o}]: value={out.value} sats, address={out.address}")

    # Verificar se há witness data
    has_witness = any(inp.witness for inp in tx.inputs)
    print(f"Presença de Witness Data: {has_witness} (Esperado: False para Legacy P2PKH)")

    if has_witness:
        raise ValueError("ERRO: Transação contém dados de witness indesejados (superfluous witness data).")
    else:
        print("SUCESSO: Payload validado como P2PKH Legacy puro sem witness.")

if __name__ == '__main__':
    with open('/home/ubuntu/pure_p2pkh_tx.json') as f:
        data = json.load(f)
    validate_hex(data['tx_hex'])
