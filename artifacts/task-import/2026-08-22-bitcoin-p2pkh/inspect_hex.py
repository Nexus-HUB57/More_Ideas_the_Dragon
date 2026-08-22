
import json
import os
import glob

files = glob.glob("/home/ubuntu/mainnet_automation/signed_tx_*.json")
if not files:
    print("Nenhum arquivo encontrado.")
    exit(1)

latest = max(files, key=os.path.getctime)
with open(latest, 'r') as f:
    data = json.load(f)

tx_hex = data['tx_hex']
print(f"Hex: {tx_hex[:100]}...")

# 01000000 - Version
# 01 - Input count
# ...

def read_varint(hex_str, pos):
    val = int(hex_str[pos:pos+2], 16)
    if val < 253:
        return val, pos + 2
    # Simple varint reader for small values
    return -1, pos

pos = 8 # Skip version
input_count, pos = read_varint(tx_hex, pos)
print(f"Input count: {input_count}")

if input_count > 0:
    txid = tx_hex[pos:pos+64]
    pos += 64
    vout = tx_hex[pos:pos+8]
    pos += 8
    script_len, pos = read_varint(tx_hex, pos)
    print(f"Input 0 - TXID: {txid}")
    print(f"Input 0 - Vout: {vout}")
    print(f"Input 0 - ScriptSig Len: {script_len}")
    pos += script_len * 2
    sequence = tx_hex[pos:pos+8]
    pos += 8
    
    output_count, pos = read_varint(tx_hex, pos)
    print(f"Output count: {output_count}")
    
    for i in range(output_count):
        value = tx_hex[pos:pos+16]
        pos += 16
        script_len, pos = read_varint(tx_hex, pos)
        print(f"Output {i} - Value: {value}")
        print(f"Output {i} - ScriptPubKey: {tx_hex[pos:pos+script_len*2]}")
        pos += script_len * 2

locktime = tx_hex[pos:pos+8]
print(f"Locktime: {locktime}")
