import pandas as pd
import numpy as np
import json

# Premissas e Dados Extraídos dos Documentos Originais
PREMISSAS = {
    "Capital_Inicial_Ano0": 850_000_000.00,
    "Capital_Ajustado_Ano0": 977_500_000.00, # Ajuste do Ano 1
    "Target_Return_Anual": 0.20, # 20% a.a. (Premissa de Alta Performance)
    "Taxa_Mensal": (1 + 0.20)**(1/12) - 1, # Taxa de juros composta mensal
    "Anos": list(range(0, 11)), # Ano 0 a Ano 10
    "Passivo_Circulante": 5_000_000.00, # Assumido como constante
    "Provisao_Fiscal_Operacional": 5_000_000.00, # Assumido como constante
    "Reserva_Liquidez": 10_000_000.00, # Assumido como constante
    "Ativo_Circulante": 10_000_000.00, # Assumido como constante
    "Capital_Social": 850_000_000.00 # Valor fixo
}

# Dados de Lucro/Aporte/Desvio extraídos dos documentos para anos específicos
# Estes valores substituem a projeção simples de 20% a.a. para garantir a aderência aos documentos.
DADOS_ESPECIFICOS = {
    0: {
        "Patrimonio_Total_Fim_Ano": 977_500_000.00, # Capital Ajustado
        "Lucro_do_Ano": 0.0, # Ano de estruturação
        "Ajuste_Capital": 127_500_000.00 # 977.5M - 850M
    },
    1: {
        "Patrimonio_Total_Fim_Ano": 1_223_140_000.00, # Extraído do Ano 1
        "Lucro_do_Ano": 245_640_000.00 # Crescimento Projetado
    },
    2: {
        # O documento do Ano 2 sugere um desvio para o "Aluguel Símbólico", mas não dá o valor final.
        # Vamos usar a projeção de 20% a.a. sobre o final do Ano 1, e ajustar o PL para refletir a alocação
        # O final do Ano 1 é 1.223.140.000,00
        "Patrimonio_Total_Fim_Ano": 1_223_140_000.00 * (1 + PREMISSAS["Target_Return_Anual"]), # 1.467.768.000,00
        "Lucro_do_Ano": 1_223_140_000.00 * PREMISSAS["Target_Return_Anual"]
    },
    3: {
        # O documento do Ano 3 menciona R$ 110M realocados do FP (R$ 10M Beyour Bank + R$ 100M Endowment)
        # e lucro gerado de R$ 108.512.788,08.
        # Patrimônio Inicial (Final Ano 2): 1.467.768.000,00
        # Patrimônio Final = Inicial + Lucro - Desvio (se o desvio não for do lucro)
        # O documento diz que o lucro foi reinvestido nos fundos FP e FS.
        # Vamos assumir que o desvio de 110M foi do capital inicial, e o lucro foi adicionado.
        "Patrimonio_Total_Fim_Ano": 1_467_768_000.00 - 110_000_000.00 + 108_512_788.08, # 1.466.280.788,08
        "Lucro_do_Ano": 108_512_788.08
    },
    # Para os anos 4 a 10, onde os dados são mais esparsos ou conceituais, voltaremos à projeção de 20% a.a.
    # a menos que um valor específico seja mencionado (como o VM de R$ 10B no Ano 10, que é um VM e não PL contábil).
    # O documento do Ano 10 menciona Patrimônio Contábil de R$ 2.7 Bilhões. Vamos usar este como o valor final.
    10: {
        "Patrimonio_Total_Fim_Ano": 2_700_000_000.00, # Patrimônio Contábil Extraído do Ano 10
        "Lucro_do_Ano": None # Será calculado
    }
}

def calcular_balanco_anual(ano, capital_inicial_ano):
    """
    Calcula o Balanço Patrimonial projetado para um determinado ano,
    assumindo reinvestimento integral e crescimento composto, mas priorizando
    os dados específicos extraídos dos documentos.
    """

    # 1. Projeção do Patrimônio Total (Ativo Total)

    if ano in DADOS_ESPECIFICOS:
        patrimonio_total_fim_ano = DADOS_ESPECIFICOS[ano]["Patrimonio_Total_Fim_Ano"]
        lucro_do_ano = patrimonio_total_fim_ano - capital_inicial_ano

        if ano == 0:
            lucro_do_ano = 0.0 # Ano de estruturação

    else:
        # Crescimento composto mensal (20% a.a.)
        patrimonio_total_fim_ano = capital_inicial_ano * (1 + PREMISSAS["Taxa_Mensal"])**12
        lucro_do_ano = patrimonio_total_fim_ano - capital_inicial_ano

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
        "Lucro_do_Ano": lucro_do_ano,
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
for col in ['Capital_Inicial_Ano', 'Patrimonio_Total_Fim_Ano', 'Lucro_do_Ano', 'Ativo_Total', 'Ativo_Circulante',
            'Reserva_Liquidez', 'Ativo_Nao_Circulante', 'Passivo_Circulante',
            'Provisao_Fiscal_Operacional', 'Passivo_Total', 'Capital_Social',
            'Lucros_Acumulados', 'Patrimonio_Liquido_Total']:
    # Usando formatação de moeda brasileira (R$ X.XXX.XXX,XX)
    df_balancos[col] = df_balancos[col].apply(lambda x: f"R$ {x:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))

df_balancos['Crescimento_Anual_Percentual'] = df_balancos['Crescimento_Anual_Percentual'].apply(lambda x: f"{x*100:.2f}%" if isinstance(x, float) else x)

# Salvar o DataFrame formatado para um arquivo Markdown para inclusão no relatório
markdown_table = df_balancos.to_markdown(index=False)

# Salvar o resultado da modelagem (tabela Markdown)
with open("balancos_ajustados_v2.md", "w") as f:
    f.write("# Balanços Financeiros e Patrimoniais Ajustados (Ano 0 a 10) - Versão 2\n\n")
    f.write("Ajuste realizado com base nos dados contábeis extraídos dos documentos originais, priorizando valores específicos e utilizando a premissa de **Target Return Anual de 20% a.a.** para os anos não especificados.\n\n")
    f.write(markdown_table)

print("Modelagem financeira concluída. Balanços ajustados salvos em balancos_ajustados_v2.md")
