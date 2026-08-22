import pandas as pd

# Dados de Resultados por Unidade de Negócio (R$ Milhões)
data = {
    'Unidade de Negócio': [
        'Beyour Bank (Ativos Financeiros)',
        'Participação Societária (Empréstimos - Ano 3)',
        'Jhon Riff\'s',
        'Participação Societária (Financiamento/Ideias - Ano 5)',
        'Empresas EMB'
    ],
    'Resultado (R$ Milhões)': [100.00, 60.00, 50.00, 20.00, 20.00]
}

df = pd.DataFrame(data)

# Total de Rendimento Anual
TOTAL_REVENUE = df['Resultado (R$ Milhões)'].sum()

# Cálculo da Contribuição Percentual
df['Contribuição (%)'] = (df['Resultado (R$ Milhões)'] / TOTAL_REVENUE) * 100

# Adicionando a linha de Total
total_row = pd.DataFrame({
    'Unidade de Negócio': ['TOTAL'],
    'Resultado (R$ Milhões)': [TOTAL_REVENUE],
    'Contribuição (%)': [100.00]
})
df = pd.concat([df, total_row], ignore_index=True)

# Formatação para o relatório
df['Resultado (R$ Milhões)'] = df['Resultado (R$ Milhões)'].apply(lambda x: f"R$ {x:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
df['Contribuição (%)'] = df['Contribuição (%)'].apply(lambda x: f"{x:,.2f}%".replace(",", "X").replace(".", ",").replace("X", "."))

# Gerando a tabela Markdown
markdown_table = df.to_markdown(index=False)

# Salvando a tabela em um arquivo para o relatório
with open('/home/ubuntu/tabela_distribuicao_rendimentos.md', 'w') as f:
    f.write("# Distribuição Detalhada do Rendimento Anual Total (R$ 250 Milhões) - Ano 8\n\n")
    f.write(markdown_table)

print(markdown_table)
