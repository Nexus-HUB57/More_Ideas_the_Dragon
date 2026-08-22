
import json
import sys
from bitcoinlib.transactions import Transaction
import config

def validate_hex(tx_hex):
    try:
        # Tentar instanciar diretamente
        tx = Transaction(network='bitcoin')
        tx.parse(tx_hex)
    except Exception as e:
        print(f"Erro ao analisar hex: {e}")
        return False

    print("\n--- Detalhes da Transação ---")
    # TXID em bitcoinlib 0.7.x pode ser txid ou txid()
    txid = tx.txid if isinstance(tx.txid, str) else tx.txid()
    print(f"TXID: {txid}")
    print(f"Tamanho: {len(tx_hex)//2} bytes")

    # Versão pode ser int ou bytes
    version = tx.version
    if isinstance(version, bytes):
        version = int.from_bytes(version, 'little')
    print(f"Versão: {version}")
    print(f"Locktime: {tx.locktime}")

    print(f"\nInputs ({len(tx.inputs)}):")
    for i, vin in enumerate(tx.inputs):
        prev_txid = vin.prev_txid.hex() if isinstance(vin.prev_txid, bytes) else vin.prev_txid
        print(f"  [{i}] {prev_txid[:16]}...:{vin.output_n}")
        if hasattr(vin, 'unlocking_script') and vin.unlocking_script:
            print(f"      ScriptSig: {vin.unlocking_script.hex()[:32]}...")
        elif hasattr(vin, 'script_sig') and vin.script_sig:
            print(f"      ScriptSig: {vin.script_sig.hex()[:32]}...")

    print(f"\nOutputs ({len(tx.outputs)}):")
    for i, vout in enumerate(tx.outputs):
        addr = vout.address if hasattr(vout, 'address') else "Desconhecido"
        print(f"  [{i}] Endereço: {addr}")
        print(f"      Valor: {vout.value / 100_000_000:.8f} BTC")
        if hasattr(vout, 'script'):
            print(f"      ScriptPubKey: {vout.script.as_hex()}")

    # Verificação de segurança
    if len(tx.outputs) > 0:
        target_addr = tx.outputs[0].address if hasattr(tx.outputs[0], 'address') else ""
        if target_addr != config.DESTINATION_ADDRESS:
            print(f"AVISO: O endereço de destino {target_addr} não coincide com o configurado ({config.DESTINATION_ADDRESS}).")

    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        if arg.endswith('.json'):
            with open(arg, 'r') as f:
                data = json.load(f)
            validate_hex(data['tx_hex'])
        else:
            validate_hex(arg)
    else:
        import glob
        import os
        files = glob.glob("signed_tx_*.json")
        if files:
            latest = max(files, key=os.path.getctime)
            print(f"Validando arquivo: {latest}")
            with open(latest, 'r') as f:
                data = json.load(f)
            validate_hex(data['tx_hex'])
        else:
            print("Uso: python3 mainnet_tx_validator.py <tx_hex>")
