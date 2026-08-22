import re
import json

input_file = "/home/ubuntu/combined_analysis_data.txt"
output_file = "/home/ubuntu/extracted_financial_data.json"

# Palavras-chave para busca de dados financeiros e estratégicos
keywords = [
    "Balanço Patrimonial", "Ativo", "Passivo", "Patrimônio Líquido", 
    "Receita", "Despesa", "Lucro", "Rentabilidade", "ROI", "EBITDA", 
    "Segmento", "Estratégia", "Risco", "Proteção", "Segurança", 
    "Anomalia", "Divergência", "Ajuste"
]

# Expressão regular para identificar o início de um novo relatório
report_separator = re.compile(r"={30,}\nRELATÓRIO: (.*?)\n={30,}", re.DOTALL)

def extract_data(text):
    reports_data = {}
    
    # Divide o texto em relatórios individuais
    parts = report_separator.split(text)
    
    # O primeiro elemento é o texto antes do primeiro separador, que pode ser ignorado
    # Os elementos subsequentes vêm em pares: (nome_do_arquivo, conteudo_do_relatorio)
    for i in range(1, len(parts), 2):
        report_name = parts[i].strip()
        report_content = parts[i+1]
        
        reports_data[report_name] = {"snippets": []}
        
        # Busca por palavras-chave no conteúdo do relatório
        for keyword in keywords:
            # Busca a palavra-chave e um contexto de 100 caracteres antes e depois
            # A busca é case-insensitive
            for match in re.finditer(r"(.{0,100})(" + re.escape(keyword) + r")(.{0,100})", report_content, re.IGNORECASE | re.DOTALL):
                snippet = {
                    "keyword": keyword,
                    "context": match.group(1).strip() + match.group(2) + match.group(3).strip()
                }
                reports_data[report_name]["snippets"].append(snippet)
                
    return reports_data

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        full_text = f.read()
except Exception as e:
    print(f"Erro ao ler o arquivo de entrada: {e}")
    exit()

extracted_data = extract_data(full_text)

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(extracted_data, f, indent=4, ensure_ascii=False)

print(f"Dados extraídos e salvos em {output_file}")
