import re
import json

input_file = "/home/ubuntu/combined_analysis_data.txt"
output_file = "/home/ubuntu/structured_financial_data.json"

# Expressão regular para identificar o início de um novo relatório e capturar o nome do arquivo
report_separator = re.compile(r"={30,}\nRELATÓRIO: (.*?)\n={30,}", re.DOTALL)

# Padrões para extrair dados financeiros chave (simplificado, pois o formato é variável)
# Tentativa de capturar valores após palavras-chave comuns
financial_patterns = {
    "Ativo Total": r"Ativo Total\s*R\$\s*([\d\.,]+)",
    "Passivo Total": r"Passivo Total\s*R\$\s*([\d\.,]+)",
    "Patrimônio Líquido": r"Patrimônio Líquido\s*R\$\s*([\d\.,]+)",
    "Receita Total": r"Receita Total\s*R\$\s*([\d\.,]+)",
    "Lucro Líquido": r"Lucro Líquido\s*R\$\s*([\d\.,]+)",
    "Rentabilidade": r"Rentabilidade\s*([\d\.,]+)\s*%",
    "EBITDA": r"EBITDA\s*R\$\s*([\d\.,]+)"
}

def clean_number(value):
    """Limpa a string de número para um float (substitui . por nada e , por .)."""
    if isinstance(value, str):
        return float(value.replace('.', '').replace(',', '.'))
    return value

def extract_structured_data(text):
    structured_data = {}
    
    # Divide o texto em relatórios individuais
    parts = report_separator.split(text)
    
    # O primeiro elemento é o texto antes do primeiro separador, que pode ser ignorado
    for i in range(1, len(parts), 2):
        report_filename = parts[i].strip()
        report_content = parts[i+1]
        
        # Tenta extrair o Ano do nome do arquivo
        year_match = re.search(r"Ano\s*(\d+)\s*(-|\s*a\s*)\s*(\d+)?", report_filename, re.IGNORECASE)
        if year_match:
            year_label = f"Ano {year_match.group(1)}"
            if year_match.group(3):
                 year_label += f"-{year_match.group(3)}"
        else:
            year_label = report_filename.split('.')[0] # Usa o nome do arquivo como fallback
        
        data = {"filename": report_filename, "financials": {}, "strategy_summary": ""}
        
        # 1. Extração de Dados Financeiros
        for key, pattern in financial_patterns.items():
            match = re.search(pattern, report_content, re.IGNORECASE | re.DOTALL)
            if match:
                data["financials"][key] = clean_number(match.group(1))
            else:
                data["financials"][key] = None
                
        # 2. Extração de Resumo Estratégico (usando palavras-chave como âncora)
        strategy_keywords = ["Estratégia", "Segmento", "Objetivo", "Metas"]
        strategy_snippets = []
        for keyword in strategy_keywords:
            # Busca a palavra-chave e o parágrafo seguinte
            for match in re.finditer(re.escape(keyword) + r"[:\s\n]+(.+?)(?:\n\n|\Z)", report_content, re.IGNORECASE | re.DOTALL):
                snippet = match.group(0).strip()
                if snippet not in strategy_snippets:
                    strategy_snippets.append(snippet)
        
        data["strategy_summary"] = "\n\n".join(strategy_snippets)
        
        structured_data[year_label] = data
        
    return structured_data

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        full_text = f.read()
except Exception as e:
    print(f"Erro ao ler o arquivo de entrada: {e}")
    exit()

structured_data = extract_structured_data(full_text)

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(structured_data, f, indent=4, ensure_ascii=False)

print(f"Dados estruturados extraídos e salvos em {output_file}")
