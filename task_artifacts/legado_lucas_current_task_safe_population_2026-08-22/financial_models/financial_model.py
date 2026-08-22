import pandas as pd
import numpy as np
import json

# Premissas do Projeto "Legado Lucas"
PREMISSAS = {
    "Capital_Inicial_Ano0": 850_000_000.00,
    "Capital_Ajustado_Ano0": 977_500_000.00, # Ajuste do Ano 1
    "Target_Return_Anual": 0.20, # 20% a.a. (Alocação Agressiva)
    "Taxa_Mensal": (1 + 0.20)**(1/12) - 1, # Taxa de juros composta mensal
    "Anos": list(range(0, 11)), # Ano 0 a Ano 10
    "Passivo_Circulante": 5_000_000.00,
    "Provisao_Fiscal_Operacional": 5_000_000.00,
    "Reserva_Liquidez": 10_000_000.00,
    "Ativo_Circulante": 10_000_000.00,
    "Capital_Social": 850_000_000.00 # Valor fixo
}

def calcular_balanco_anual(ano, capital_inicial_ano):
    """
    Calcula o Balanço Patrimonial projetado para um determinado ano,
    assumindo reinvestimento integral e crescimento composto.
    """

    # 1. Projeção do Patrimônio Total (Ativo Total)
    # O cálculo é feito sobre o capital inicial do ano, crescendo por 12 meses.

    if ano == 0:
        # O Ano 0 é um ano de estruturação, o balanço é o inicial ajustado.
        patrimonio_total_fim_ano = PREMISSAS["Capital_Ajustado_Ano0"]

    else:
        # Crescimento composto mensal
        patrimonio_total_fim_ano = capital_inicial_ano * (1 + PREMISSAS["Taxa_Mensal"])**12

    # 2. Estrutura do Balanço

    # Passivo
    passivo_circulante = PREMISSAS["Passivo_Circulante"]
    provisao_fiscal_operacional = PREMISSAS["Provisao_Fiscal_Operacional"]
    passivo_total = passivo_circulante + provisao_fiscal_operacional

    # Patrimônio Líquido
    capital_social = PREMISSAS["Capital_Social"]

    # O Patrimônio Líquido (PL) é o Ativo Total - Passivo
    patrimonio_liquido_fim_ano = patrimonio_total_fim_ano - passivo_total

    # Lucros Acumulados é a diferença entre o PL final e o Capital Social
    lucros_acumulados = patrimonio_liquido_fim_ano - capital_social

    patrimonio_liquido_total = capital_social + lucros_acumulados

    # Ativo
    ativo_total = patrimonio_total_fim_ano
    ativo_circulante = PREMISSAS["Ativo_Circulante"]
    reserva_liquidez = PREMISSAS["Reserva_Liquidez"]
    ativo_nao_circulante = ativo_total - ativo_circulante - reserva_liquidez

    # Verificação de Consistência
    if not np.isclose(ativo_total, passivo_total + patrimonio_liquido_total):
        raise ValueError(f"Inconsistência no Balanço do Ano {ano}: Ativo ({ativo_total}) != Passivo + PL ({passivo_total + patrimonio_liquido_total})")

    return {
        "Ano": ano,
        "Capital_Inicial_Ano": capital_inicial_ano,
        "Patrimonio_Total_Fim_Ano": patrimonio_total_fim_ano,
        "Ativo_Total": ativo_total,
        "Ativo_Circulante": ativo_circulante,
        "Reserva_Liquidez": reserva_liquidez,
        "Ativo_Nao_Circulante": ativo_nao_circulante,
        "Passivo_Circulante": passivo_circulante,
        "Provisao_Fiscal_Operacional": provisao_fiscal_operacional,
        "Passivo_Total": passivo_total,
        "Capital_Social": capital_social,
        "Lucros_Acumulados": lucros_acumulados,
        "Patrimonio_Liquido_Total": patrimonio_liquido_total,
        "Crescimento_Anual_Percentual": (patrimonio_total_fim_ano / capital_inicial_ano - 1) if ano > 0 else 0.0
    }

def modelar_balancos():
    """
    Executa a modelagem financeira para todos os anos (0 a 10).
    """
    balancos = []
    capital_inicial_ano = PREMISSAS["Capital_Ajustado_Ano0"]

    for ano in PREMISSAS["Anos"]:
        if ano == 0:
            balanco = calcular_balanco_anual(ano, capital_inicial_ano)
        else:
            # O capital inicial do ano é o Patrimônio Total do ano anterior
            capital_inicial_ano = balancos[-1]["Patrimonio_Total_Fim_Ano"]
            balanco = calcular_balanco_anual(ano, capital_inicial_ano)

        balancos.append(balanco)

    return balancos

# Execução da modelagem
balancos_projetados = modelar_balancos()

# Conversão para DataFrame e exportação para um arquivo JSON para uso posterior
df_balancos = pd.DataFrame(balancos_projetados)

# Formatação para melhor visualização no relatório
for col in ['Capital_Inicial_Ano', 'Patrimonio_Total_Fim_Ano', 'Ativo_Total', 'Ativo_Circulante',
            'Reserva_Liquidez', 'Ativo_Nao_Circulante', 'Passivo_Circulante',
            'Provisao_Fiscal_Operacional', 'Passivo_Total', 'Capital_Social',
            'Lucros_Acumulados', 'Patrimonio_Liquido_Total']:
    # Usando formatação de moeda brasileira (R$ X.XXX.XXX,XX)
    df_balancos[col] = df_balancos[col].apply(lambda x: f"R$ {x:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))

df_balancos['Crescimento_Anual_Percentual'] = df_balancos['Crescimento_Anual_Percentual'].apply(lambda x: f"{x*100:.2f}%" if isinstance(x, float) else x)

# Salvar o DataFrame formatado para um arquivo Markdown para inclusão no relatório
markdown_table = df_balancos.to_markdown(index=False)

# Salvar o resultado da modelagem (tabela Markdown)
with open("balancos_ajustados.md", "w") as f:
    f.write("# Balanços Financeiros e Patrimoniais Ajustados (Ano 0 a 10)\n\n")
    f.write("Ajuste realizado com base na premissa de **Target Return Anual de 20% a.a.** e reinvestimento integral dos lucros, conforme a Estratégia de Alocação Agressiva (Ano 1).\n\n")
    f.write(markdown_table)

print("Modelagem financeira concluída. Balanços ajustados salvos em balancos_ajustados.md")
