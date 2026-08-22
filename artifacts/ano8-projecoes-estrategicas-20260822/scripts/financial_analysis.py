import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Dados extraídos dos relatórios
data = {
    'Ano': ['Ano 7', 'Ano 8 (Projetado)'],
    'Patrimônio Líquido (Bilhões R$)': [1.944, 2.400],
    'Rendimentos Anuais (Milhões R$)': [179, 250],
    'Investimento em Missão/Pessoas (Milhões R$)': [10, 42.5]
}

df = pd.DataFrame(data)

# 1. Geração da Tabela de Comparação (para inclusão no relatório)
comparison_table = df.to_markdown(index=False, floatfmt=".3f")

# 2. Geração do Gráfico de Tendências Financeiras
fig, ax1 = plt.subplots(figsize=(10, 6))

# Configuração para Patrimônio Líquido (Eixo Y Esquerdo)
color = 'tab:blue'
ax1.set_xlabel('Ano')
ax1.set_ylabel('Patrimônio Líquido (Bilhões R$)', color=color)
ax1.plot(df['Ano'], df['Patrimônio Líquido (Bilhões R$)'], color=color, marker='o', linestyle='--')
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(axis='y', linestyle=':', alpha=0.6)

# Configuração para Rendimentos Anuais (Eixo Y Direito)
ax2 = ax1.twinx()  # Cria um segundo eixo Y que compartilha o mesmo eixo X
color = 'tab:red'
ax2.set_ylabel('Rendimentos Anuais (Milhões R$)', color=color)
ax2.plot(df['Ano'], df['Rendimentos Anuais (Milhões R$)'], color=color, marker='s')
ax2.tick_params(axis='y', labelcolor=color)

# Título e Layout
plt.title('Comparativo Financeiro: Ano 7 vs. Ano 8 (Projetado)')
fig.tight_layout()

# Salvar o gráfico
chart_path = '/home/ubuntu/financial_trend_comparison.png'
plt.savefig(chart_path)

# 3. Geração do Gráfico de Investimento em Missão/Pessoas (Barra)
fig_invest, ax_invest = plt.subplots(figsize=(8, 5))
x = np.arange(len(df['Ano']))
width = 0.35

rects = ax_invest.bar(x, df['Investimento em Missão/Pessoas (Milhões R$)'], width, color=['lightcoral', 'darkgreen'])

# Adicionar rótulos, título e legendas
ax_invest.set_ylabel('Investimento (Milhões R$)')
ax_invest.set_title('Alocação Estratégica em Missão/Pessoas: Ano 7 vs. Ano 8')
ax_invest.set_xticks(x)
ax_invest.set_xticklabels(df['Ano'])
ax_invest.set_yticks(np.arange(0, 50, 10))

# Adicionar os valores nas barras
def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax_invest.annotate(f'{height:.1f}M',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom')

autolabel(rects)

fig_invest.tight_layout()

# Salvar o gráfico
chart_invest_path = '/home/ubuntu/mission_investment_comparison.png'
plt.savefig(chart_invest_path)

# Imprimir a tabela e os caminhos dos arquivos para o próximo passo
print(f"Tabela de Comparação:\n{comparison_table}")
print(f"Caminho do Gráfico de Tendências Financeiras: {chart_path}")
print(f"Caminho do Gráfico de Investimento em Missão/Pessoas: {chart_invest_path}")
