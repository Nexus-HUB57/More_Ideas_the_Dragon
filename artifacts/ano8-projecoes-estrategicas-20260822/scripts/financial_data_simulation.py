import pandas as pd
import numpy as np

# --- Dados de Simulação Baseados na Projeção do Ano 8 ---
# Projeção de Fechamento do Ano 8:
PATRIMONIO_TOTAL = 2400.0  # R$ Bilhões
RENDIMENTO_ANUAL_TOTAL = 250.0  # R$ Milhões

# 1. Diversificação dos Investimentos (Patrimônio Total R$ 2.4 Bilhões)
diversificacao_patrimonio = {
    'Categoria': ['Ativos Financeiros (Renda Fixa, Fundos)', 'Ativos Imobiliários e Fixos (Comunidades, Instituto)', 'Participações Societárias (Equity)'],
    'Percentual': [40, 30, 30],
    'Valor (R$ Milhões)': [PATRIMONIO_TOTAL * 0.4 * 1000, PATRIMONIO_TOTAL * 0.3 * 1000, PATRIMONIO_TOTAL * 0.3 * 1000],
    'Resultado Anual (R$ Milhões)': [RENDIMENTO_ANUAL_TOTAL * 0.4, RENDIMENTO_ANUAL_TOTAL * 0.0, RENDIMENTO_ANUAL_TOTAL * 0.6] # Ativos Fixos não geram rendimento direto
}
df_patrimonio = pd.DataFrame(diversificacao_patrimonio)

# 2. Resultados por Unidade de Negócio (Rendimento Anual Total R$ 250 Milhões)
# O rendimento total é a soma do resultado dos Ativos Financeiros (R$ 100M) + Participações Societárias (R$ 150M)
rendimento_participacoes = RENDIMENTO_ANUAL_TOTAL * 0.6 # R$ 150 Milhões

resultados_negocios = {
    'Unidade de Negócio': ['Beyour Bank (Ativos Financeiros)', 'Jhon Riff\'s', 'Participação Societária (Empréstimos - Ano 3)', 'Participação Societária (Financiamento/Ideias - Ano 5)', 'Empresas EMB'],
    'Resultado (R$ Milhões)': [RENDIMENTO_ANUAL_TOTAL * 0.4, rendimento_participacoes * 0.33, rendimento_participacoes * 0.4, rendimento_participacoes * 0.13, rendimento_participacoes * 0.14],
    'Nº de Empresas/Ideias': [1, 50000, 20, 10, 5] # 1 para o Bank, 50k para JR (membros/vendas), 20 empresas, 10 ideias, 5 EMB
}
df_resultados = pd.DataFrame(resultados_negocios)

# Ajuste fino para garantir que a soma seja 250M
df_resultados.loc[df_resultados['Unidade de Negócio'] == 'Beyour Bank (Ativos Financeiros)', 'Resultado (R$ Milhões)'] = 100.0
df_resultados.loc[df_resultados['Unidade de Negócio'] == 'Jhon Riff\'s', 'Resultado (R$ Milhões)'] = 50.0
df_resultados.loc[df_resultados['Unidade de Negócio'] == 'Participação Societária (Empréstimos - Ano 3)', 'Resultado (R$ Milhões)'] = 60.0
df_resultados.loc[df_resultados['Unidade de Negócio'] == 'Participação Societária (Financiamento/Ideias - Ano 5)', 'Resultado (R$ Milhões)'] = 20.0
df_resultados.loc[df_resultados['Unidade de Negócio'] == 'Empresas EMB', 'Resultado (R$ Milhões)'] = 20.0

# 3. Balanço Patrimonial Simplificado (Ativo = Passivo + PL)
balanco_patrimonial = {
    'Conta': ['Ativo Total', 'Passivo Total', 'Patrimônio Líquido'],
    'Valor (R$ Milhões)': [PATRIMONIO_TOTAL * 1000, (PATRIMONIO_TOTAL * 1000) - (PATRIMONIO_TOTAL * 1000), PATRIMONIO_TOTAL * 1000] # Simplificando Passivo como 0 para focar no PL
}
df_balanco = pd.DataFrame(balanco_patrimonial)
df_balanco.loc[df_balanco['Conta'] == 'Passivo Total', 'Valor (R$ Milhões)'] = 0.0 # Assumindo passivo zero para focar no PL

# --- Geração de Saída ---
output = f"""
# Dados Consolidados do Ano 8 (Simulação Baseada em Projeções)

## Balanço Patrimonial Simplificado (R$ Milhões)
{df_balanco.to_markdown(index=False, floatfmt=",.2f")}

## Diversificação dos Investimentos (Patrimônio - R$ Milhões)
{df_patrimonio.to_markdown(index=False, floatfmt=",.2f")}

## Resultados por Unidade de Negócio (R$ Milhões)
{df_resultados.to_markdown(index=False, floatfmt=",.2f")}
"""

# Salvar os dados consolidados em um arquivo de texto para uso posterior
with open('/home/ubuntu/dados_financeiros_ano8.txt', 'w') as f:
    f.write(output)

print(output)
