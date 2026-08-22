import os
import json
from private_key_manager import PrivateKeyManager

manager = PrivateKeyManager()

files_to_import = [
    '/home/ubuntu/upload/exclusive_wallet_transfer_instructions.txt',
    '/home/ubuntu/upload/satoshinakamoto3.txt',
    '/home/ubuntu/upload/suply2.txt',
    '/home/ubuntu/upload/suply1.txt',
    '/home/ubuntu/upload/suply2t.txt',
    '/home/ubuntu/upload/suply8.txt',
    '/home/ubuntu/upload/suply4.txt',
    '/home/ubuntu/upload/suply9.txt',
    '/home/ubuntu/upload/satoshinakamoto3t1.txt',
    '/home/ubuntu/upload/satoshinakamoto3t2.txt',
    '/home/ubuntu/upload/satoshinakamoto3t23.txt',
    '/home/ubuntu/upload/2000.dat',
    '/home/ubuntu/upload/matriz2000btc_wallet.txt',
    '/home/ubuntu/upload/500.backup(1).txt',
    '/home/ubuntu/upload/310.dat.txt',
    '/home/ubuntu/upload/0524e560-7128-11f0-a8a5-11ebad7174c8.dat',
    '/home/ubuntu/upload/304.dat.txt',
    '/home/ubuntu/upload/05244920-7128-11f0-a8a5-11ebad7174c8.dat',
    '/home/ubuntu/upload/302.dat.txt',
    '/home/ubuntu/upload/303.dat.txt',
    '/home/ubuntu/upload/301.dat.txt',
    '/home/ubuntu/upload/300.dat.txt',
    '/home/ubuntu/upload/chavprivelet1.txt',
    '/home/ubuntu/upload/genesis.txt',
    '/home/ubuntu/upload/112btc.txt',
    '/home/ubuntu/upload/matriz.txt',
    '/home/ubuntu/upload/stake1.txt',
    '/home/ubuntu/upload/SNbackupUI.txt',
    '/home/ubuntu/upload/30minha.txt',
    '/home/ubuntu/upload/30minhat23.txt',
    '/home/ubuntu/upload/30minhat.txt',
    '/home/ubuntu/upload/40kteste.txt',
    '/home/ubuntu/upload/30minhat234.txt',
    '/home/ubuntu/upload/bit2015.txt',
    '/home/ubuntu/upload/pasted_content.txt',
    '/home/ubuntu/upload/pasted_content_2.txt',
    '/home/ubuntu/upload/pasted_content_3.txt',
    '/home/ubuntu/upload/pasted_content_4.txt',
    '/home/ubuntu/upload/pasted_content_5.txt',
    '/home/ubuntu/upload/pasted_content_6.txt'
]

for file_path in files_to_import:
    print(f"\nAttempting to import from: {file_path}")
    result = manager.import_from_file(file_path)
    print(json.dumps(result, indent=2))

# Após a importação, tentar obter a chave privada para o endereço específico
# Isso irá testar a descriptografia

# Endereço da carteira de origem
from_address = "1Xcdre9pAipV9kiSrSgssEpQPAruzMFzr"

# Procurar a chave privada no database
found_key = None
for wallet_id, wallet_data in manager.database["private_keys"].items():
    if wallet_data["address"] == from_address:
        found_key = manager.get_private_key(wallet_id)
        if found_key:
            print(f"\n✅ Chave privada encontrada e descriptografada para {from_address}: {found_key[:10]}...{found_key[-10:]}")
        else:
            print(f"\n❌ Chave privada encontrada, mas não pôde ser descriptografada para {from_address}.")
        break

if not found_key:
    print(f"\n❌ Chave privada para {from_address} não encontrada no database após importação.")



