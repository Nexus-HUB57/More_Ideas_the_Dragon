import base58
import sys
import math
from collections import Counter

ADDRESSES_FILE = "/home/ubuntu/top_100_addresses.txt"
ANALYSIS_OUTPUT = "/home/ubuntu/rich_address_analysis_report.txt"

def calculate_shannon_entropy(data):
    """Calcula a Entropia de Shannon para uma string de dados."""
    if not data:
        return 0
    
    counts = Counter(data)
    total_length = len(data)
    
    entropy = 0.0
    for count in counts.values():
        probability = count / total_length
        entropy -= probability * math.log2(probability)
        
    return entropy

def analyze_addresses(addresses):
    """Realiza a análise de entropia e padrões nos endereços."""
    results = []
    
    prefix_counts = Counter()
    length_counts = Counter()
    
    decoded_data = []
    
    for addr in addresses:
        length_counts[len(addr)] += 1
        
        # Analisa o prefixo para determinar o tipo de endereço
        if addr.startswith('1'):
            prefix_counts['P2PKH (1...)'] += 1
        elif addr.startswith('3'):
            prefix_counts['P2SH (3...)'] += 1
        elif addr.startswith('bc1q'):
            prefix_counts['Bech32 (bc1q...)'] += 1
        elif addr.startswith('bc1p'):
            prefix_counts['Bech32m (bc1p...)'] += 1
        else:
            prefix_counts['Outro'] += 1
        
        try:
            # Tenta decodificar Base58Check (para 1 e 3)
            if addr.startswith('1') or addr.startswith('3'):
                decoded = base58.b58decode(addr)
                decoded_data.append(decoded[:-4])
            # Ignora Bech32/Bech32m para o cálculo de entropia binária simples
            # A decodificação Bech32 é mais complexa e não é necessária para a análise de entropia de alto nível
        except Exception:
            pass

    # Entropia Média do Conteúdo Binário (apenas para endereços Base58)
    if decoded_data:
        all_decoded_bytes = b"".join(decoded_data)
        avg_entropy = calculate_shannon_entropy(all_decoded_bytes)
    else:
        avg_entropy = 0.0

    results.append("--- Análise de Entropia (Apenas Endereços Base58) ---")
    results.append(f"Entropia Média do Conteúdo Binário (por byte): {avg_entropy:.4f} bits")
    results.append("Entropia esperada para dados aleatórios de 8 bits: 8.0 bits")
    
    results.append("\n--- Análise de Padrões (Tipos de Endereço/Prefixos) ---")
    
    total_addresses = len(addresses)
    for prefix, count in prefix_counts.most_common():
        percentage = (count / total_addresses) * 100
        results.append(f"Tipo '{prefix}': {count} endereços ({percentage:.2f}%)")

    results.append("\n--- Análise de Padrões (Comprimento) ---")
    for length, count in length_counts.most_common():
        percentage = (count / total_addresses) * 100
        results.append(f"Comprimento {length}: {count} endereços ({percentage:.2f}%)")
        
    return results

# --- Execução ---
try:
    with open(ADDRESSES_FILE, 'r') as f:
        addresses = [line.strip() for line in f if line.strip()]

    if not addresses:
        report = ["Nenhum endereço encontrado para análise."]
    else:
        report = analyze_addresses(addresses)

    with open(ANALYSIS_OUTPUT, 'w') as f:
        f.write("\n".join(report))

    print(f"Análise concluída. Relatório salvo em {ANALYSIS_OUTPUT}")

except FileNotFoundError:
    print(f"Erro: Arquivo de endereços {ADDRESSES_FILE} não encontrado.", file=sys.stderr)
except Exception as e:
    print(f"Ocorreu um erro inesperado: {e}", file=sys.stderr)
