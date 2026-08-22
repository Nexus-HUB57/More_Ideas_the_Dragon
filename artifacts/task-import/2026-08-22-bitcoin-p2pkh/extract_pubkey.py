
import requests
import json
import re

addr = '113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug'
url = f'https://mempool.space/api/address/{addr}/txs'
res = requests.get(url)
txs = res.json()

for tx in txs:
    for vin in tx['vin']:
        if 'prevout' in vin and vin['prevout']['scriptpubkey_address'] == addr:
            print(f"Found input in tx: {tx['txid']}")
            scriptsig = vin['scriptsig']
            print(f"ScriptSig: {scriptsig}")

            # The pubkey is the last part of the scriptsig
            # format: <sig_len><sig><pubkey_len><pubkey>
            # For compressed pubkey, pubkey_len is 0x21 (33) and pubkey is 33 bytes.
            # So the last 33*2 = 66 chars are the pubkey.

            pubkey_hex = scriptsig[-66:]
            print(f"Potential Compressed PubKey: {pubkey_hex}")

            # Verify if it hashes to the address
            import hashlib
            import base58

            pubkey_bytes = bytes.fromhex(pubkey_hex)
            sha = hashlib.sha256(pubkey_bytes).digest()
            h160 = hashlib.new('ripemd160', sha).digest()
            vh = b'\x00' + h160
            chk = hashlib.sha256(hashlib.sha256(vh).digest()).digest()[:4]
            derived_addr = base58.b58encode(vh + chk).decode()

            print(f"Derived Address: {derived_addr}")
            if derived_addr == addr:
                print("MATCH!")
            else:
                # Try uncompressed
                pubkey_hex_un = scriptsig[-130:]
                print(f"Potential Uncompressed PubKey: {pubkey_hex_un}")
                pubkey_bytes_un = bytes.fromhex(pubkey_hex_un)
                sha_un = hashlib.sha256(pubkey_bytes_un).digest()
                h160_un = hashlib.new('ripemd160', sha_un).digest()
                vh_un = b'\x00' + h160_un
                chk_un = hashlib.sha256(hashlib.sha256(vh_un).digest()).digest()[:4]
                derived_addr_un = base58.b58encode(vh_un + chk_un).decode()
                print(f"Derived Address (Uncompressed): {derived_addr_un}")
                if derived_addr_un == addr:
                    print("MATCH (UNCOMPRESSED)!")

            import sys
            sys.exit(0)
print("No outgoing transaction found for this address in the last 25 txs.")
