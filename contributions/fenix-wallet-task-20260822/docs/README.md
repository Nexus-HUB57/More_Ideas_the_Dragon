# FênixWallet - Carteira Digital Bitcoin

Uma aplicação web moderna para importação e gerenciamento de carteiras Bitcoin, com compatibilidade total ao formato wallet.dat do Bitcoin Core e infraestrutura Electrum.

## 🚀 Características Principais

- **Importação Universal**: Suporte a formatos .dat, .wallet e .backup
- **Interface Moderna**: Design responsivo e intuitivo
- **Saldos em Tempo Real**: Consultas diretas à rede Bitcoin
- **Múltiplas Carteiras**: Gerenciamento simultâneo de várias carteiras
- **Exportação CSV**: Relatórios detalhados para análise
- **Segurança**: Processamento seguro de chaves privadas

## 📋 Requisitos

- Python 3.11+
- Ubuntu 22.04+ (recomendado)
- Conexão com internet
- 2GB RAM mínimo

## 🛠️ Instalação Rápida

```bash
# Clone o projeto
git clone <repository-url>
cd fenix_wallet_backend

# Crie ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt

# Execute a aplicação
python src/main.py
```

Acesse: `http://localhost:5000`

## 📖 Como Usar

1. **Importar Carteira**: Clique em "Importar Wallet" e selecione seu arquivo
2. **Carregar Saldos**: Selecione uma carteira e clique em "Carregar Saldos"
3. **Visualizar Dados**: Veja saldos, endereços e transações na tabela
4. **Exportar**: Use "Exportar CSV" para salvar os dados

## 🔧 Configuração

### Token BlockCypher (Opcional)
Para consultas mais frequentes, obtenha um token gratuito em [blockcypher.com](https://blockcypher.com) e insira no campo correspondente.

### Variáveis de Ambiente
Crie um arquivo `.env` baseado em `.env.example`:
```
BLOCKCYPHER_TOKEN=seu_token_aqui
FLASK_ENV=development
```

## 📁 Estrutura do Projeto

```
fenix_wallet_backend/
├── src/
│   ├── main.py              # Aplicação principal
│   ├── wallet_parser.py     # Parser de carteiras
│   ├── electrum_client.py   # Cliente Electrum
│   ├── routes/wallet.py     # APIs REST
│   └── static/
│       ├── index.html       # Interface web
│       └── app.js          # JavaScript frontend
├── venv/                    # Ambiente virtual
└── requirements.txt         # Dependências
```

## 🔒 Segurança

- Chaves privadas processadas apenas em memória
- Comunicação HTTPS recomendada para produção
- Senhas não armazenadas permanentemente
- Validação rigorosa de entrada de dados

## 🧪 Testes

O sistema foi testado com arquivos reais de carteira, demonstrando capacidade de extrair informações de carteiras com dezenas de endereços.

## 📊 Formatos Suportados

| Formato | Extensão | Origem |
|---------|----------|--------|
| Bitcoin Core | .dat | Bitcoin Core wallet.dat |
| Electrum | .wallet | Electrum wallet files |
| Backup | .backup | Backup files |

## 🚀 Deploy em Produção

Para produção, recomenda-se:
- Servidor com 4GB+ RAM
- Nginx como proxy reverso
- Certificado SSL/TLS
- Firewall configurado
- Monitoramento de logs

## 📞 Suporte

Para questões técnicas ou suporte, consulte a documentação completa em `fenix_wallet_documentation.md`.

## 📄 Licença

Desenvolvido por Manus AI para Lucas (Mestre) - Agosto 2025

---

**Status**: ✅ Pronto para produção  
**Versão**: 1.0.0  
**Última atualização**: 7 de Agosto de 2025

