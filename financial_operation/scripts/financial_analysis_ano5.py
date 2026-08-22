import pandas as pd

# --- Dados do Relatório do Ano 5 ---
PATRIMONIO_TOTAL_FIM_ANO4_REPORTED = 1_464_675_459.27
PATRIMONIO_TOTAL_FIM_ANO5_REPORTED = 1_606_303_785.23

# Componentes Projetados Fim Ano 5
FP_FIM_ANO5 = 1_056_322_640.15
FS_FIM_ANO5 = 281_523_748.26
FIQ_FIM_ANO5 = 129_758_581.22
ENDOWMENT_FIM_ANO5 = 100_000_000.00
BEYOUR_BANK_FIM_ANO5 = 12_296_352.00
FPS_FIM_ANO5 = 16_282_463.60
FUNDO_ANJO_FIM_ANO5 = 6_120_000.00

SOMA_COMPONENTES_FIM_ANO5 = (
    FP_FIM_ANO5 + FS_FIM_ANO5 + FIQ_FIM_ANO5 + 
    ENDOWMENT_FIM_ANO5 + BEYOUR_BANK_FIM_ANO5 + 
    FPS_FIM_ANO5 + FUNDO_ANJO_FIM_ANO5
)

# --- Comparação com a Base Corrigida (Ano 4) ---
# Meu cálculo corrigido do Ano 4 foi: R$ 1.237.719.129,01
PATRIMONIO_TOTAL_FIM_ANO4_CORRIGIDO = 1_237_719_129.01

# --- Análise de Divergências ---
output = "--- Análise de Consistência Financeira - Ano 5 ---\n\n"

output += f"1. Verificação da Soma dos Componentes (Fim Ano 5):\n"
output += f"   Patrimônio Total Relatório: R$ {PATRIMONIO_TOTAL_FIM_ANO5_REPORTED:,.2f}\n"
output += f"   Soma dos Componentes Listados: R$ {SOMA_COMPONENTES_FIM_ANO5:,.2f}\n"
output += f"   Divergência Interna Ano 5: R$ {PATRIMONIO_TOTAL_FIM_ANO5_REPORTED - SOMA_COMPONENTES_FIM_ANO5:,.2f}\n"
output += "   Observação: Há uma diferença de R$ 4.000.000,00 não alocada no balanço final do Ano 5.\n\n"

output += f"2. Comparação da Base de Cálculo (Início Ano 5 / Fim Ano 4):\n"
output += f"   Base Utilizada no Relatório (Fim Ano 4): R$ {PATRIMONIO_TOTAL_FIM_ANO4_REPORTED:,.2f}\n"
output += f"   Base Corrigida (Cálculo Manus AI): R$ {PATRIMONIO_TOTAL_FIM_ANO4_CORRIGIDO:,.2f}\n"
output += f"   Divergência Acumulada na Base: R$ {PATRIMONIO_TOTAL_FIM_ANO4_REPORTED - PATRIMONIO_TOTAL_FIM_ANO4_CORRIGIDO:,.2f}\n"
output += "   Observação: O relatório do Ano 5 continua utilizando uma base inflada em mais de R$ 226 milhões.\n\n"

output += "3. Análise do Lucro e Alocação:\n"
output += "   O relatório assume um rendimento mensal de R$ 5M (R$ 60M/ano).\n"
output += "   No entanto, o crescimento projetado do patrimônio total é de R$ 141.628.325,96 (1.606B - 1.464B).\n"
output += "   Essa taxa de crescimento (~9.7%) é superior ao lucro declarado de R$ 60M, indicando que a valorização dos ativos não está sendo detalhada ou há inconsistência entre o lucro e o crescimento patrimonial.\n"

print(output)
