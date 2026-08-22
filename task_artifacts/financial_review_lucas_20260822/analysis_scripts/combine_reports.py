import os

input_dir = "/home/ubuntu/extracted_text"
output_file = "/home/ubuntu/combined_analysis_data.txt"

all_content = []
report_files = sorted([f for f in os.listdir(input_dir) if f.endswith(".txt")])

for filename in report_files:
    filepath = os.path.join(input_dir, filename)
    
    # Adiciona um cabeçalho para identificar o relatório
    all_content.append(f"\n\n==================================================\n")
    all_content.append(f"RELATÓRIO: {filename}\n")
    all_content.append(f"==================================================\n\n")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            all_content.append(content)
    except Exception as e:
        all_content.append(f"ERRO ao ler o arquivo {filename}: {e}")

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("".join(all_content))

print(f"Conteúdo de {len(report_files)} relatórios concatenado em {output_file}")
