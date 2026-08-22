import os
import re

input_dir = '/home/ubuntu/MMN_AI-to-AI/docs/ebooks_revisados'

def revise_chapters(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revisar Sumário
    content = re.sub(r'> \*\*•\*\* 1\. O que é a Minimax e por que ela importa', '> **•** 1. O Despertar da Minimax: Por Que Ela é a Sua Vantagem Injusta', content)
    content = re.sub(r'> \*\*•\*\* 2\. Conceitos Fundamentais: Como a Minimax Pensa', '> **•** 2. A Mente da Máquina: Desvendando o Raciocínio da Minimax', content)
    content = re.sub(r'> \*\*•\*\* 3\. Aplicações Práticas no Dia a Dia', '> **•** 3. Lucro e Produtividade: A Minimax no Seu Dia a Dia', content)
    content = re.sub(r'> \*\*•\*\* 4\. Estratégias Avançadas de Prompt', '> **•** 4. O Código dos Mestres: Estratégias Avançadas de Prompt', content)
    content = re.sub(r'> \*\*•\*\* 5\. Melhores Práticas e Hábito dos Top Usuários', '> **•** 5. O Segredo dos 1%: Hábitos dos Top Usuários', content)
    content = re.sub(r'> \*\*•\*\* 6\. Estudos de Caso: Resultados Reais', '> **•** 6. Casos de Sucesso: Resultados Reais e Escaláveis', content)
    content = re.sub(r'> \*\*•\*\* 7\. Ferramentas e Recursos Complementares', '> **•** 7. O Arsenal Completo: Ferramentas e Recursos', content)
    content = re.sub(r'> \*\*•\*\* 8\. Passo a Passo: Seu Primeiro Projeto com Minimax', '> **•** 8. Ação Imediata: Seu Primeiro Projeto Lucrativo', content)
    content = re.sub(r'> \*\*•\*\* 9\. Erros Comuns que Você Deve Evitar', '> **•** 9. Armadilhas Fatais: Erros Comuns e Como Evitá-los', content)
    content = re.sub(r'> \*\*•\*\* 10\. Conclusão: O Futuro é Híbrido', '> **•** 10. O Império Híbrido: O Futuro Pertence a Quem Age Agora', content)

    # Revisar Títulos dos Capítulos no corpo do texto
    content = re.sub(r'\*\*1\. O que é a Minimax e por que ela importa\*\*', '**1. O Despertar da Minimax: Por Que Ela é a Sua Vantagem Injusta**', content)
    content = re.sub(r'\*\*2\. Conceitos Fundamentais: Como a Minimax Pensa\*\*', '**2. A Mente da Máquina: Desvendando o Raciocínio da Minimax**', content)
    content = re.sub(r'\*\*3\. Aplicações Práticas no Dia a Dia\*\*', '**3. Lucro e Produtividade: A Minimax no Seu Dia a Dia**', content)
    content = re.sub(r'\*\*4\. Estratégias Avançadas de Prompt\*\*', '**4. O Código dos Mestres: Estratégias Avançadas de Prompt**', content)
    content = re.sub(r'\*\*5\. Melhores Práticas e Hábito dos Top Usuários\*\*', '**5. O Segredo dos 1%: Hábitos dos Top Usuários**', content)
    content = re.sub(r'\*\*6\. Estudos de Caso: Resultados Reais\*\*', '**6. Casos de Sucesso: Resultados Reais e Escaláveis**', content)
    content = re.sub(r'\*\*7\. Ferramentas e Recursos Complementares\*\*', '**7. O Arsenal Completo: Ferramentas e Recursos**', content)
    content = re.sub(r'\*\*8\. Passo a Passo: Seu Primeiro Projeto com Minimax\*\*', '**8. Ação Imediata: Seu Primeiro Projeto Lucrativo**', content)
    content = re.sub(r'\*\*9\. Erros Comuns que Você Deve Evitar\*\*', '**9. Armadilhas Fatais: Erros Comuns e Como Evitá-los**', content)
    content = re.sub(r'\*\*10\. Conclusão: O Futuro é Híbrido\*\*', '**10. O Império Híbrido: O Futuro Pertence a Quem Age Agora**', content)

    # Revisar CTA Final
    cta_find = r'\*\*Obrigado por ler!\*\*\n\n\*Esperamos que este conteúdo tenha agregado valor real à sua jornada com\ninteligência artificial\. Agora é hora de colocar em prática --- comece\npequeno, iterate rápido e celebre cada vitória\.\*'
    cta_replace = '**Seu Império Começa Agora!**\n\n*O conhecimento sem ação é apenas entretenimento. Você acaba de receber o mapa para dominar a inteligência artificial e multiplicar seus resultados. O próximo passo é seu: aplique as estratégias, construa suas soluções e assuma a liderança no seu mercado. A revolução não espera por ninguém. Vá e construa o seu futuro!*'
    content = re.sub(cta_find, cta_replace, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Capítulos e CTA revisados: {filepath}")

# Processar todos os ebooks revisados
for filename in os.listdir(input_dir):
    if filename.endswith('.md'):
        filepath = os.path.join(input_dir, filename)
        revise_chapters(filepath)

print("Revisão de capítulos e CTAs concluída.")
