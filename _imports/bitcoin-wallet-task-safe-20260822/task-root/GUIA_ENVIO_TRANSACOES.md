# Guia de Envio de Transações Bitcoin - Protocolo TSRA

**Data:** 06 de Outubro de 2025  
**Desenvolvido por:** Manus AI

---

## ⚠️ AVISO CRÍTICO

Este script realiza transações **REAIS** na blockchain Bitcoin (Mainnet). Fundos reais serão movimentados. Use com extrema cautela e apenas se tiver certeza do que está fazendo.

---

## 📋 Pré-requisitos

1. **Python 3.10+** instalado
2. **Bibliotecas instaladas:**
   ```bash
   pip install bitcoinlib requests
   ```
3. **Chave privada WIF** da carteira de origem
4. **Saldo suficiente** na carteira (mínimo: 0.001 BTC + taxas)
5. **Conexão estável** com a internet

---

## 🚀 Como Usar

### Passo 1: Preparação

1. Certifique-se de ter a chave privada WIF da carteira com fundos
2. Verifique o saldo da carteira (deve ter pelo menos 0.0015 BTC)
3. Confirme que deseja enviar para o endereço: `13m3xop6RnioRX6qrnkavLekv7cvu5DuMK`

### Passo 2: Execução

**No Linux/Mac:**
```bash
python3 bitcoin_sender_tsra.py
```

**No Windows:**
```bash
python bitcoin_sender_tsra.py
```

### Passo 3: Interação

1. O script solicitará a chave privada WIF:
   ```
   🔑 Digite a chave privada WIF da carteira de origem:
   WIF: [Digite aqui sua chave WIF]
   ```

2. O script mostrará informações da carteira:
   ```
   ✓ Carteira importada com sucesso!
   📍 Endereço: 1ABC...
   💰 Saldo: 0.00500000 BTC
   ```

3. Solicitará confirmação:
   ```
   ⚠️ CONFIRMAÇÃO NECESSÁRIA
   Você está prestes a enviar 10 transações de 0.0001 BTC cada
   Destino: 13m3xop6RnioRX6qrnkavLekv7cvu5DuMK
   Total: 0.001 BTC + taxas
   Rede: MAINNET (REAL)
   
   Digite 'CONFIRMAR' para prosseguir:
   ```

4. Digite exatamente `CONFIRMAR` (em maiúsculas) para prosseguir

### Passo 4: Acompanhamento

O script executará automaticamente:

1. ✅ Obtenção da altura do bloco atual (Protocolo TSRA)
2. ✅ Criação de cada transação
3. ✅ Assinatura com a chave privada
4. ✅ Broadcast para a rede Bitcoin
5. ✅ Validação do TXID (64 caracteres hexadecimais)
6. ✅ Verificação na blockchain
7. ✅ Geração de relatório

---

## 📊 Exemplo de Saída

```
======================================================================
TRANSAÇÃO #1 DE 10
======================================================================
1️⃣ Atualizando informações da carteira...
   💰 Saldo atual: 0.00500000 BTC
2️⃣ Criando transação...
   📤 Destino: 13m3xop6RnioRX6qrnkavLekv7cvu5DuMK
   💵 Valor: 0.0001 BTC (10000 satoshis)
   ✓ Transação criada!
   🆔 TXID: abc123def456...
3️⃣ Validando TXID (Protocolo TSRA)...
   ✓ TXID válido (64 caracteres hexadecimais)
   🔍 Verificando transação na blockchain...
   ✓ Transação verificada na rede!

   ✅ TRANSAÇÃO #1 ENVIADA COM SUCESSO!
   ⏱️ Tempo: 3.45s
   🔗 Explorador: https://mempool.space/tx/abc123def456...
```

---

## 📈 Relatório Final

Ao final, o script gerará:

1. **Relatório na tela** com estatísticas completas
2. **Arquivo JSON** com todos os detalhes: `transaction_report_YYYYMMDD_HHMMSS.json`

### Exemplo de Relatório:

```
======================================================================
RELATÓRIO FINAL DE TRANSAÇÕES
======================================================================

📊 Estatísticas:
   Total de transações: 10
   Bem-sucedidas: 10 ✅
   Falhadas: 0 ❌

💰 Valores:
   Total enviado: 0.00100000 BTC
   Total em taxas: 0.00001000 BTC
   Total gasto: 0.00101000 BTC

⏱️ Performance:
   Tempo médio por transação: 3.52s

📋 Detalhes das Transações Bem-Sucedidas:

   TX #1:
      TXID: abc123...
      Valor: 0.0001 BTC
      Verificada: Sim
      Link: https://mempool.space/tx/abc123...
   
   [... demais transações ...]

💾 Relatório salvo em: transaction_report_20251006_143022.json
```

---

## 🔒 Segurança

### Protocolo TSRA Implementado:

- ✅ **Operação 100% Mainnet** (sem testnet)
- ✅ **Validação de TXID** (64 caracteres hexadecimais)
- ✅ **Verificação na blockchain** após broadcast
- ✅ **Consulta de altura do bloco** antes de operações
- ✅ **Múltiplas APIs** para redundância (Blockstream, Mempool.space)

### Protocolo CAISK:

- ✅ **Chave privada** nunca é armazenada em arquivo
- ✅ **Carteira temporária** é criada e deletada após uso
- ✅ **Passphrase mestra** protegida no código

---

## ⚙️ Configurações

Você pode modificar as seguintes variáveis no início do script:

```python
# Endereço de destino
BINANCE_CUSTODY_ADDRESS = "13m3xop6RnioRX6qrnkavLekv7cvu5DuMK"

# Valor por transação (em BTC)
AMOUNT_PER_TX = 0.0001

# Número de transações
NUM_TRANSACTIONS = 10

# Passphrase (Protocolo CAISK)
PASSPHRASE = "${CAISK_PASSPHRASE}"
```

---

## 🛠️ Troubleshooting

### Erro: "Saldo insuficiente"

**Solução:** Certifique-se de que a carteira tem saldo suficiente:
- Mínimo necessário: (0.0001 × 10) + taxas ≈ 0.0015 BTC

### Erro: "Falha ao criar transação"

**Solução:**
1. Verifique a conexão com a internet
2. Aguarde alguns minutos e tente novamente
3. Verifique se há UTXOs disponíveis na carteira

### Erro: "TXID inválido"

**Solução:**
- Isso indica um problema no broadcast
- O script tentará múltiplas APIs automaticamente
- Se persistir, aguarde e tente novamente

### Transação não verificada

**Solução:**
- É normal que transações levem alguns segundos para propagar
- Verifique manualmente no explorador: https://mempool.space/
- A transação ainda é válida mesmo se não verificada imediatamente

---

## 📞 Suporte

Para questões técnicas:
1. Verifique este guia primeiro
2. Consulte os logs do script
3. Verifique o arquivo JSON de relatório
4. Consulte exploradores de blockchain para status das transações

---

## ✅ Checklist Pré-Execução

Antes de executar o script, confirme:

- [ ] Tenho a chave privada WIF correta
- [ ] Verifiquei o saldo da carteira
- [ ] Confirmei o endereço de destino
- [ ] Tenho conexão estável com a internet
- [ ] Entendo que fundos reais serão movimentados
- [ ] Estou preparado para confirmar a operação
- [ ] Tenho backup da chave privada

---

## 🎯 Fluxo de Execução

```
Início
  ↓
Solicita chave WIF
  ↓
Valida formato WIF
  ↓
Obtém altura do bloco (TSRA)
  ↓
Importa carteira
  ↓
Verifica saldo
  ↓
Solicita confirmação
  ↓
Loop: 10 transações
  ├─ Cria transação
  ├─ Assina transação
  ├─ Faz broadcast
  ├─ Valida TXID
  ├─ Verifica na blockchain
  └─ Aguarda 5s
  ↓
Gera relatório
  ↓
Salva JSON
  ↓
Fim
```

---

## 📝 Notas Importantes

1. **Taxas:** O script usa taxa fixa de 1000 satoshis por transação (aproximadamente 10 sat/byte)
2. **Tempo:** Cada transação leva aproximadamente 3-5 segundos
3. **Total:** O processo completo leva cerca de 1-2 minutos
4. **Confirmações:** As transações aparecerão no mempool imediatamente, mas confirmações na blockchain levam ~10 minutos
5. **Irreversível:** Transações Bitcoin são irreversíveis. Verifique tudo antes de confirmar.

---

## 🔗 Links Úteis

- **Explorador Mempool.space:** https://mempool.space/
- **Explorador Blockstream:** https://blockstream.info/
- **Documentação bitcoinlib:** https://bitcoinlib.readthedocs.io/

---

**Desenvolvido por Manus AI**  
*Sistema Autônomo de Desenvolvimento de Software*  
*Protocolo TSRA - Transaction Security Real Action*

**Versão:** 1.0.0  
**Data:** 06 de Outubro de 2025
