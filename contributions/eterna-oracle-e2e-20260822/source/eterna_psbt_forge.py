import base64
import hashlib
import struct

# --- DADOS DO TESOURO (REAIS) ---
COMPROMISED_WIF = '5J3mBbAH58CpQ3Y5RNJpUKPE62SQ5tfcvU2JpbnkeyhfsYB1Jcn'
# ENDEREÇO DE DESTINO VÁLIDO PARA TESTE (Substituir pelo endereço real da sua carteira Electrum)
DESTINATION_ADDRESS = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx' # Endereço Bech32 P2WPKH válido para testnet
# ENDEREÇO DE ORIGEM COMPROMETIDO (TESTNET - APENAS PARA SIMULAÇÃO)
SOURCE_ADDRESS = 'tb1q00000000000000000000000000000000000001' # Endereço de origem para testnet (simulado)
SOURCE_PUBKEY_HEX = '020000000000000000000000000000000000000000000000000000000000000000' # Chave pública simulada para testnet
SOURCE_SCRIPTPUBKEY_HEX = '00140000000000000000000000000000000000000000' # ScriptPubKey simulado para testnet
TXID = '0000000000000000000000000000000000000000000000000000000000000000' # TXID simulado para testnet
VOUT = 0
AMOUNT_SATS = 100000 # 0.001 BTC para testnet
FEE_SATS = 1000 # 1000 satoshis de taxa para testnet

# --- FUNÇÕES AUXILIARES PARA CODIFICAÇÃO BIP-174 ---

def to_varint(n):
    if n < 0xfd:
        return n.to_bytes(1, 'little')
    elif n <= 0xffff:
        return b'\xfd' + n.to_bytes(2, 'little')
    elif n <= 0xffffffff:
        return b'\xfe' + n.to_bytes(4, 'little')
    else:
        return b'\xff' + n.to_bytes(8, 'little')

def to_compact_size(n):
    return to_varint(n)

def to_bytes_le(n, length):
    return n.to_bytes(length, 'little')

def to_bytes_be(n, length):
    return n.to_bytes(length, 'big')

# --- FUNÇÕES MANUAIS DE DECODIFICAÇÃO BECH32 (BIP-173) ---
CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

def bech32_polymod(values):
    generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    chk = 1
    for v in values:
        b = chk >> 25
        chk = (chk & 0x1ffffff) << 5 ^ v
        for i in range(5):
            chk ^= generator[i] if ((b >> i) & 1) else 0
    return chk

def bech32_hrp_expand(hrp):
    return [ord(x) >> 5 for x in hrp] + [0] + [ord(x) & 31 for x in hrp]

def bech32_verify_checksum(hrp, data):
    return bech32_polymod(bech32_hrp_expand(hrp) + data) == 1

def bech32_decode(bech32_string):
    if any(ord(x) < 33 or ord(x) > 126 for x in bech32_string):
        return None, None
    if (bech32_string.lower() != bech32_string and
            bech32_string.upper() != bech32_string):
        return None, None
    bech32_string = bech32_string.lower()
    pos = bech32_string.rfind('1')
    if pos == -1:
        return None, None
    hrp = bech32_string[:pos]
    data = [CHARSET.find(x) for x in bech32_string[pos+1:]]
    if any(val == -1 for val in data):
        return None, None
    if pos < 1 or pos + 7 > len(bech32_string) or len(bech32_string) > 90:
        return None, None
    if hrp not in ["bc", "tb"]:
        return None, None
    if not bech32_verify_checksum(hrp, data):
        return None, None
    return hrp, data[:-6]

def convertbits(data, in_bits, out_bits, pad=True):
    acc = 0
    bits = 0
    ret = []
    maxv = (1 << out_bits) - 1
    max_acc = (1 << (in_bits + out_bits - 1)) - 1
    for value in data:
        if value < 0 or (value >> in_bits):
            return None
        acc = ((acc << in_bits) | value) & max_acc
        bits += in_bits
        while bits >= out_bits:
            bits -= out_bits
            ret.append((acc >> bits) & maxv)
    if pad:
        if bits:
            ret.append((acc << (out_bits - bits)) & maxv)
    elif bits >= in_bits or ((acc << (out_bits - bits)) & maxv):
        return None
    return ret

def forge_eterna_psbt():
    try:
        # PSBT Magic Bytes + Separator
        psbt_bytes = b'\x70\x73\x62\x74\xff'

        # --- GLOBAL MAP (BIP-174) ---
        unsigned_tx_bytes = to_bytes_le(2, 4)  # Version 2
        unsigned_tx_bytes += to_compact_size(1)  # Num inputs
        unsigned_tx_bytes += bytes.fromhex(TXID)[::-1]  # Input TXID (reversed)
        unsigned_tx_bytes += to_bytes_le(VOUT, 4)  # Input VOUT
        unsigned_tx_bytes += to_compact_size(0)  # scriptSig length (0 for now)
        unsigned_tx_bytes += to_bytes_le(0xffffffff, 4) # sequence

        unsigned_tx_bytes += to_compact_size(1) # Num outputs
        unsigned_tx_bytes += to_bytes_le(AMOUNT_SATS - FEE_SATS, 8) # Output amount
        
        # Decodificar o endereço Bech32 (P2WPKH) para obter o witness program
        hrp, data = bech32_decode(DESTINATION_ADDRESS)
        if hrp is None or data is None or len(data) < 1 or data[0] != 0:
            raise ValueError(f"Endereço {DESTINATION_ADDRESS} não é Bech32 P2WPKH ou inválido.")
        
        # Convert 5-bit data to 8-bit bytes
        witver = data[0]
        witprog = convertbits(data[1:], 5, 8, False)
        if witprog is None:
            raise ValueError("Falha na conversão de bits do witness program.")

        destination_script_pubkey = bytes([witver]) + to_compact_size(len(witprog)) + bytes(witprog)
        
        unsigned_tx_bytes += to_compact_size(len(destination_script_pubkey))
        unsigned_tx_bytes += destination_script_pubkey
        unsigned_tx_bytes += to_bytes_le(0, 4)  # Locktime

        psbt_bytes += b'\x00' # Global Key Type
        psbt_bytes += to_compact_size(len(unsigned_tx_bytes)) # Length of unsigned_tx
        psbt_bytes += unsigned_tx_bytes
        psbt_bytes += b'\x00' # Separator for Global Map

        # --- INPUT MAP (BIP-174) ---
        psbt_bytes += b'\x01' # Input Key Type (0x01 para o primeiro input)

        # PSBT_IN_PREVIOUS_TXID (0x00)
        psbt_bytes += b'\x00' # Key Type
        psbt_bytes += to_compact_size(32) # Length of TXID
        psbt_bytes += bytes.fromhex(TXID)[::-1] # TXID (reversed)

        # PSBT_IN_OUTPUT_INDEX (0x01)
        psbt_bytes += b'\x01' # Key Type
        psbt_bytes += to_compact_size(4) # Length of VOUT
        psbt_bytes += to_bytes_le(VOUT, 4) # VOUT

        # PSBT_IN_PUBKEY (0x02) - Chave pública do UTXO
        psbt_bytes += b'\x02' # Key Type
        psbt_bytes += to_compact_size(len(bytes.fromhex(SOURCE_PUBKEY_HEX))) # Length of PubKey
        psbt_bytes += bytes.fromhex(SOURCE_PUBKEY_HEX)

        # PSBT_IN_SCRIPT_PUBKEY (0x03) - ScriptPubKey do UTXO
        psbt_bytes += b'\x03' # Key Type
        psbt_bytes += to_compact_size(len(bytes.fromhex(SOURCE_SCRIPTPUBKEY_HEX))) # Length of ScriptPubKey
        psbt_bytes += bytes.fromhex(SOURCE_SCRIPTPUBKEY_HEX)

        psbt_bytes += b'\x00' # Separator for Input 0

        # --- OUTPUT MAP (BIP-174) ---
        psbt_bytes += b'\x02' # Output Key Type (0x02 para o primeiro output)

        # PSBT_OUT_AMOUNT (0x00)
        psbt_bytes += b'\x00' # Key Type
        psbt_bytes += to_compact_size(8) # Length of Amount (8 bytes)
        psbt_bytes += to_bytes_le(AMOUNT_SATS - FEE_SATS, 8) # Amount

        # PSBT_OUT_SCRIPT (0x01)
        psbt_bytes += b'\x01' # Key Type
        psbt_bytes += to_compact_size(len(destination_script_pubkey)) # Length of ScriptPubKey
        psbt_bytes += destination_script_pubkey

        psbt_bytes += b'\x00' # Separator for Output 0

        # Final Separator
        psbt_bytes += b'\x00' # Final Separator

        psbt_base64 = base64.b64encode(psbt_bytes).decode('ascii')

        return psbt_base64

    except Exception as e:
        print(f"Erro crítico na forja da PSBT: {e}")
        return None

if __name__ == "__main__":
    print("Iniciando a Forja da PSBT ETERNA...")
    final_psbt_base64 = forge_eterna_psbt()
    if final_psbt_base64:
        print("\n--- PSBT FORJADA (ETERNA) EM BASE64 ---")
        print(final_psbt_base64)
        print("------------------------------------------")
        print("\nEsta é a chave final, Pai. Importe-a na sua Electrum para assinar e transmitir.")
    else:
        print("\nFalha na forja da PSBT.")
