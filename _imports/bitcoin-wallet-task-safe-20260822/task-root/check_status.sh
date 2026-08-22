#!/bin/bash
# Script de verificação rápida de status da varredura

echo "========================================================================"
echo "STATUS DA VARREDURA DE CARTEIRAS BITCOIN"
echo "========================================================================"
echo ""

# Verifica se o processo está rodando
if ps aux | grep -q "[s]can_full_wallet.py"; then
    echo "✅ Status: RODANDO"
    echo ""
    
    # Mostra informações do processo
    echo "📊 Processo:"
    ps aux | grep "[s]can_full_wallet.py" | awk '{print "   PID: " $2 "\n   CPU: " $3 "% \n   RAM: " $4 "%"}'
    echo ""
    
    # Lê checkpoint
    if [ -f "scan_checkpoint.json" ]; then
        echo "📈 Progresso:"
        CHECKED=$(cat scan_checkpoint.json | grep -o '"last_index": [0-9]*' | grep -o '[0-9]*')
        FUNDED=$(cat scan_checkpoint.json | grep -o '"funded_wallets": \[' | wc -l)
        TIMESTAMP=$(cat scan_checkpoint.json | grep -o '"timestamp": "[^"]*"' | cut -d'"' -f4)
        
        TOTAL=423190
        PERCENT=$(echo "scale=2; $CHECKED * 100 / $TOTAL" | bc)
        REMAINING=$((TOTAL - CHECKED))
        
        echo "   Verificadas: $CHECKED / $TOTAL ($PERCENT%)"
        echo "   Restantes: $REMAINING"
        echo "   Última atualização: $TIMESTAMP"
        echo ""
    fi
    
    # Verifica resultados
    if [ -f "funded_wallets_scan.json" ]; then
        echo "💰 Carteiras com saldo encontradas!"
        echo "   Arquivo: funded_wallets_scan.json"
        COUNT=$(cat funded_wallets_scan.json | grep -o '"address"' | wc -l)
        echo "   Total: $COUNT carteira(s)"
        echo ""
    else
        echo "💰 Carteiras com saldo: 0 (até agora)"
        echo ""
    fi
    
    # Últimas linhas do log
    echo "📋 Últimas atualizações:"
    tail -3 scan_output.log | sed 's/^/   /'
    echo ""
    
else
    echo "❌ Status: NÃO ESTÁ RODANDO"
    echo ""
    echo "Para iniciar a varredura:"
    echo "   python3 scan_full_wallet.py"
    echo ""
fi

echo "========================================================================"
echo ""
echo "Comandos úteis:"
echo "   ./check_status.sh          - Verificar status"
echo "   tail -f scan_output.log    - Ver log em tempo real"
echo "   python3 monitor_scan.py    - Monitor interativo"
echo "   kill \$(pgrep -f scan_full) - Parar varredura"
echo ""
echo "========================================================================"

