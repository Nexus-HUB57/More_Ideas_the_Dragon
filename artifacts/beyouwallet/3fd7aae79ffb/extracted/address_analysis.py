import base58
import hashlib
import math
from collections import Counter

ADDRESS = "1BeouDc6jtHpitvPz3gR3LQnBGb7dKRrtC"

def calculate_shannon_entropy(data):
    """Calcula a Entropia de Shannon para uma sequência de bytes."""
    if not data:
        return 0
    
    counts = Counter(data)
    total_length = len(data)
    
    entropy = 0.0
    for count in counts.values():
        probability = count / total_length
        entropy -= probability * math.log2(probability)
        
    return entropy

def decode_and_validate_address(address):
    """Decodifica um endereço Base58Check e valida o checksum."""
    try:
        # 1. Decodificar Base58
        decoded_full = base58.b58decode(address)
        
        # 2. Separar o conteúdo (payload) e o checksum (últimos 4 bytes)
        payload = decoded_full[:-4]
        checksum_received = decoded_full[-4:]
        
        # 3. Calcular o checksum esperado: SHA256(SHA256(payload)) e pegar os primeiros 4 bytes
        hash1 = hashlib.sha256(payload).digest()
        hash2 = hashlib.sha256(hash1).digest()
        checksum_calculated = hash2[:4]
        
        # 4. Validar o checksum
        is_valid = checksum_received == checksum_calculated
        
        # 5. Extrair informações
        version_byte = payload[0:1]
        pubkey_hash = payload[1:]
        
        # 6. Determinar o tipo de endereço (versão)
        if version_byte == b'\x00':
            address_type = "P2PKH (Pay-to-Public-Key-Hash) - Mainnet"
        elif version_byte == b'\x05':
            address_type = "P2SH (Pay-to-Script-Hash) - Mainnet"
        elif version_byte == b'\x6f':
            address_type = "P2PKH (Testnet)"
        elif version_byte == b'\xc4':
            address_type = "P2SH (Testnet)"
        else:
            address_type = f"Tipo Desconhecido (Byte de Versão: {version_byte.hex()})"

        # 7. Calcular a entropia do hash da chave pública
        entropy = calculate_shannon_entropy(pubkey_hash)
        
        return {
            "is_valid": is_valid,
            "address_type": address_type,
            "version_byte": version_byte.hex(),
            "pubkey_hash_hex": pubkey_hash.hex(),
            "pubkey_hash_len": len(pubkey_hash),
            "checksum_received": checksum_received.hex(),
            "checksum_calculated": checksum_calculated.hex(),
            "entropy_bits": entropy,
            "payload_len": len(payload)
        }
        
    except ValueError as e:
        return {"is_valid": False, "error": f"Erro de decodificação Base58: {e}"}
    except Exception as e:
        return {"is_valid": False, "error": f"Erro inesperado: {e}"}

if __name__ == "__main__":
    analysis_result = decode_and_validate_address(ADDRESS)
    
    report = [
        f"--- Análise do Endereço Bitcoin: {ADDRESS} ---",
        f"Validade do Checksum Base58: {'VÁLIDO' if analysis_result.get('is_valid') else 'INVÁLIDO'}",
    ]
    
    if analysis_result.get('is_valid'):
        report.extend([
            f"Tipo de Endereço: {analysis_result['address_type']}",
            f"Byte de Versão (Hex): {analysis_result['version_byte']}",
            f"Comprimento do Payload (Versão + Hash): {analysis_result['payload_len']} bytes",
            f"Hash da Chave Pública (RIPEMD160): {analysis_result['pubkey_hash_hex']}",
            f"Comprimento do Hash: {analysis_result['pubkey_hash_len']} bytes",
            f"Checksum Recebido: {analysis_result['checksum_received']}",
            f"Checksum Calculado: {analysis_result['checksum_calculated']}",
            "",
            "--- Análise de Entropia do Hash da Chave Pública ---",
            f"Entropia de Shannon (por byte): {analysis_result['entropy_bits']:.4f} bits",
            "Entropia esperada para dados perfeitamente aleatórios (20 bytes): ~7.999 bits"
        ])
    else:
        report.append(f"Detalhes do Erro: {analysis_result.get('error', 'Checksum inválido.')}")

    with open("/home/ubuntu/address_report_raw.txt", "w") as f:
        f.write("\n".join(report))
    
    print("Análise inicial concluída. Relatório bruto salvo em /home/ubuntu/address_report_raw.txt")
