import os
import pypandoc

input_dir = '/home/ubuntu/MMN_AI-to-AI/docs/ebooks'
output_dir = '/home/ubuntu/MMN_AI-to-AI/docs/ebooks_md'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for filename in os.listdir(input_dir):
    if filename.endswith('.docx'):
        input_path = os.path.join(input_dir, filename)
        output_filename = filename.replace('.docx', '.md')
        output_path = os.path.join(output_dir, output_filename)
        
        print(f"Convertendo {filename}...")
        try:
            pypandoc.convert_file(input_path, 'md', outputfile=output_path)
        except Exception as e:
            print(f"Erro ao converter {filename}: {e}")

print("Conversão concluída.")
