
import re
import os
import hashlib
import base58
from ecdsa import SigningKey, SECP256k1

TARGET_PUBKEY = '037a57bc664d2407adf51301c1ecedca3811526d4dbbdd3f900e7b579f9b81e122'

def get_pubkey(priv_bytes, compressed=True):
    try:
        sk = SigningKey.from_string(priv_bytes, curve=SECP256k1)
        vk = sk.get_verifying_key()
        if compressed:
            return ((b'\x02' if vk.pubkey.point.y() % 2 == 0 else b'\x03') + vk.to_string()[:32]).hex()
        else:
            return (b'\x04' + vk.to_string()).hex()
    except:
        return None

hex_pattern = re.compile(r'[0-9a-fA-F]{64}')
found_hexes = set()

for root, dirs, files in os.walk('/home/ubuntu/Master-MNS-BCK7'):
    for file in files:
        if file.endswith(('.py', '.json', '.md', '.txt', '.js', '.ts', '.env', '.secrets')):
            try:
                with open(os.path.join(root, file), 'r', errors='ignore') as f:
                    content = f.read()
                    for h in hex_pattern.findall(content):
                        found_hexes.add(h)
            except: pass

print(f"Checking {len(found_hexes)} hex strings against PubKey {TARGET_PUBKEY}...")
for h in found_hexes:
    try:
        priv = bytes.fromhex(h)
        if get_pubkey(priv, True) == TARGET_PUBKEY:
            print(f"!!! MATCH COMPRESSED !!! HEX: {h}")
            exit(0)
        if get_pubkey(priv, False) == TARGET_PUBKEY:
            print(f"!!! MATCH UNCOMPRESSED !!! HEX: {h}")
            exit(0)
    except: continue
print("Done. No matching HEX found.")
