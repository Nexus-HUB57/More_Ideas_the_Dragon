
import re
import os
import hashlib
import base58
from ecdsa import SigningKey, SECP256k1

TARGET_PUBKEY = '037a57bc664d2407adf51301c1ecedca3811526d4dbbdd3f900e7b579f9b81e122'

def get_pubkey(priv_bytes, compressed=True):
    sk = SigningKey.from_string(priv_bytes, curve=SECP256k1)
    vk = sk.get_verifying_key()
    if compressed:
        return ((b'\x02' if vk.pubkey.point.y() % 2 == 0 else b'\x03') + vk.to_string()[:32]).hex()
    else:
        return (b'\x04' + vk.to_string()).hex()

wif_pattern = re.compile(r'[5KL][1-9A-HJ-NP-Za-km-z]{50,51}')
found_wifs = set()

for root, dirs, files in os.walk('/home/ubuntu/Master-MNS-BCK7'):
    for file in files:
        if file.endswith(('.py', '.json', '.md', '.txt', '.js', '.ts')):
            try:
                with open(os.path.join(root, file), 'r', errors='ignore') as f:
                    content = f.read()
                    for wif in wif_pattern.findall(content):
                        found_wifs.add(wif)
            except: pass

print(f"Checking {len(found_wifs)} WIFs against PubKey {TARGET_PUBKEY}...")
for wif in found_wifs:
    try:
        decoded = base58.b58decode_check(wif)
        priv = decoded[1:33]
        if get_pubkey(priv, True) == TARGET_PUBKEY:
            print(f"!!! MATCH COMPRESSED !!! WIF: {wif}")
            exit(0)
        if get_pubkey(priv, False) == TARGET_PUBKEY:
            print(f"!!! MATCH UNCOMPRESSED !!! WIF: {wif}")
            exit(0)
    except: continue
print("Done. No matching WIF found.")
