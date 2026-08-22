# Guia de Implantação, Workflow e Monitoramento na Mainnet (Master-MNS-BCK7)

Este documento orienta a configuração do GitHub Actions, execução do workflow automático de assinatura/broadcast e verificação do status das transações na Mainnet.

## 1. Configuração de Secrets no GitHub

Para que o workflow automático (`.github/workflows/mainnet_broadcast.yml`) funcione, configure a seguinte secret no seu repositório GitHub (`Nexus-HUB57/Master-MNS-BCK7`):

1. Acesse o repositório no GitHub.
2. Vá em **Settings** > **Secrets and variables** > **Actions**.
3. Clique em **New repository secret**.
4. Adicione a secret:
   - **Name:** `BTC_WIF_MAINNET`
   - **Secret:** `Sua_Chave_Privada_WIF_Real_Mainnet`

## 2. Executando o Workflow Automático

1. No repositório GitHub, vá até a aba **Actions**.
2. Selecione o workflow **Mainnet Transaction Workflow**.
3. Clique em **Run workflow**.
4. Insira a transação raw não assinada (`Raw Unsigned Transaction Hex`) gerada pelo seu dashboard.
5. O GitHub Actions executará o script de forma isolada e segura, assinando com a WIF armazenada nas secrets e enviando o broadcast para a Mainnet.

## 3. Verificando o Status da Transação

Para verificar se a transação foi propagada e confirmada na rede principal:
Execute o script de verificação incluído no ecossistema:

```bash
python3 server/check_tx_status.py <TXID>
```

Ou consulte diretamente via navegador no [Blockchain.com Explorer](https://www.blockchain.com/explorer).
