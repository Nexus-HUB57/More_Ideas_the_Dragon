import pandas as pd
import numpy as np

# Configurações
np.random.seed(42) # Para reprodutibilidade
MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
RENDIMENTO_ANUAL_TOTAL = 250.0 # R$ Milhões
PATRIMONIO_INICIAL = 2400000.0 # R$ Milhões (2.4 Bilhões)

# Resultados Anuais por Segmento (R$ Milhões)
resultados_anuais = {
    'Beyour Bank (Ativos Financeiros)': 100.00,
    'Participação Societária (Empréstimos - Ano 3)': 60.00,
    'Jhon Riff\'s': 50.00,
    'Participação Societária (Financiamento/Ideias - Ano 5)': 20.00,
    'Empresas EMB': 20.00
}

# DataFrame para armazenar os resultados mensais
df_mensal = pd.DataFrame(index=MESES)

# Simulação da Distribuição Mensal (R$ Milhões)
for segmento, anual in resultados_anuais.items():
    # Base mensal
    base_mensal = anual / 12
    
    # Geração de ruído aleatório (simulação de flutuação)
    # O ruído é pequeno para garantir que a soma anual seja próxima do alvo
    ruido = np.random.normal(0, base_mensal * 0.1, 12) # Desvio padrão de 10% da base mensal
    
    # Distribuição baseada no tipo de negócio
    if 'Beyour Bank' in segmento or 'EMB' in segmento or 'Empréstimos' in segmento:
        # Negócios mais estáveis (distribuição linear com ruído)
        mensal = base_mensal + ruido
    elif 'Jhon Riff\'s' in segmento:
        # Crescimento no 2º semestre devido à integração ORSECA
        fator_crescimento = np.linspace(0.9, 1.1, 12) # Crescimento de 90% a 110% da média
        mensal = base_mensal * fator_crescimento + ruido * 0.5
    elif 'Financiamento/Ideias' in segmento:
        # Resultados concentrados no 2º semestre (maturação de ideias)
        fator_maturacao = np.array([0.5, 0.5, 0.6, 0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.4, 1.5, 1.5])
        mensal = base_mensal * fator_maturacao + ruido * 0.2
    else:
        mensal = base_mensal + ruido

    # Ajuste para garantir que a soma anual seja exatamente o alvo
    ajuste = anual - mensal.sum()
    mensal[-1] += ajuste # Ajusta o último mês para fechar a conta
    
    df_mensal[segmento] = mensal.round(2)

# Cálculo do Total Mensal e Acumulado
df_mensal['Total Mensal (R$ Milhões)'] = df_mensal.sum(axis=1).round(2)
df_mensal['Patrimônio Líquido Acumulado (R$ Milhões)'] = PATRIMONIO_INICIAL + df_mensal['Total Mensal (R$ Milhões)'].cumsum()

# --- Geração do Relatório ---

# 1. Tabela de Resultados Mensais
tabela_mensal = df_mensal.to_markdown(floatfmt=",.2f")

# 2. Tabela de Resultados Anuais (Verificação)
resultados_anuais_df = pd.DataFrame({
    'Segmento': df_mensal.columns[:-2],
    'Resultado Anual (R$ Milhões)': df_mensal.iloc[:, :-2].sum().round(2).values
})
resultados_anuais_df.loc[len(resultados_anuais_df)] = ['Total Rendimento Anual', resultados_anuais_df['Resultado Anual (R$ Milhões)'].sum()]
tabela_anual = resultados_anuais_df.to_markdown(index=False, floatfmt=",.2f")

# 3. Balanço Patrimonial Final
patrimonio_final = df_mensal['Patrimônio Líquido Acumulado (R$ Milhões)'].iloc[-1]
balanco_final = pd.DataFrame({
    'Conta': ['Ativo Total', 'Passivo Total', 'Patrimônio Líquido'],
    'Valor (R$ Milhões)': [patrimonio_final, 0.0, patrimonio_final]
})
tabela_balanco = balanco_final.to_markdown(index=False, floatfmt=",.2f")

# Salvar o relatório em Markdown
relatorio_markdown = f"""
# Relatório de Fechamento do Balanço Patrimonial e Resultados Mensais - Ano 8

## 1. Balanço Patrimonial Final (Fechamento do Ano 8)

O Patrimônio Líquido do Legado Quântico ao final do Ano 8 reflete o crescimento de R$ 250 Milhões sobre o Patrimônio Inicial de R$ 2.4 Bilhões.

{tabela_balanco}

## 2. Resultados Anuais por Segmento (Verificação)

O Rendimento Anual Total de R$ 250 Milhões foi distribuído conforme a estratégia de diversificação.

{tabela_anual}

## 3. Distribuição Mensal Detalhada dos Resultados (R$ Milhões)

A tabela abaixo detalha a performance mês a mês de cada segmento, demonstrando a estabilidade dos Ativos Financeiros e o crescimento no segundo semestre dos projetos de Inovação (Financiamento/Ideias) e Multiplicação (Jhon Riff's).

{tabela_mensal}
"""

with open('/home/ubuntu/relatorio_mensal_ano8.md', 'w') as f:
    f.write(relatorio_markdown)

print(relatorio_markdown)
