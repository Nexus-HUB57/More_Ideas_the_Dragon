import os
import zipfile
import xml.etree.ElementTree as ET
import re

input_dir = "/home/ubuntu/legado_lucas_files"
output_dir = "/home/ubuntu/extracted_text"
os.makedirs(output_dir, exist_ok=True)

# Define the namespace map for Word XML
namespaces = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
}

def extract_text_from_docx_xml(docx_path):
    text = []
    try:
        with zipfile.ZipFile(docx_path, 'r') as docx:
            # Read the main document XML
            # Some files might not have a document.xml, but the ones we care about should.
            try:
                with docx.open('word/document.xml') as xml_file:
                    tree = ET.parse(xml_file)
                    root = tree.getroot()

                    # Find all text elements (<w:t>)
                    for t in root.findall('.//w:t', namespaces):
                        if t.text:
                            text.append(t.text)
            except KeyError:
                # Handle case where word/document.xml is not found (e.g., if it's a template or corrupted)
                return f"ERRO: word/document.xml não encontrado em {os.path.basename(docx_path)}"
            
    except zipfile.BadZipFile:
        return f"ERRO: Arquivo ZIP inválido (não é um DOCX válido): {os.path.basename(docx_path)}"
    except Exception as e:
        return f"ERRO: Ocorreu um erro inesperado ao processar {os.path.basename(docx_path)}: {e}"

    # Join the text parts, adding a space between them for readability
    full_text = ' '.join(text)
    
    # Simple cleanup: replace multiple spaces with a single space
    full_text = re.sub(r'\s+', ' ', full_text).strip()
    
    return full_text

for filename in os.listdir(input_dir):
    if filename.endswith(".docx"):
        docx_path = os.path.join(input_dir, filename)
        
        # Create a clean output filename
        output_filename = filename.replace(".docx", ".txt").replace(" ", "_").replace("(", "").replace(")", "")
        output_path = os.path.join(output_dir, output_filename)
        
        print(f"Processando: {filename} -> {output_filename}")
        
        extracted_text = extract_text_from_docx_xml(docx_path)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(extracted_text)

print("Extração concluída.")
