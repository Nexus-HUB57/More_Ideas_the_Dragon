# Guia de Deployment - Sistema de Carteira Digital Bitcoin

**Versão:** 1.0.0  
**Data:** 06 de Outubro de 2025  
**Autor:** Manus AI

---

## 1. Deployment Local (Windows)

Este guia fornece instruções detalhadas para executar o sistema completo em ambiente Windows para desenvolvimento e testes.

### 1.1. Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **MongoDB Community Edition** ([Download](https://www.mongodb.com/try/download/community))
- **Redis for Windows** ([Download](https://github.com/microsoftarchive/redis/releases))
- **Git** ([Download](https://git-scm.com/downloads))

### 1.2. Instalação do MongoDB no Windows

O MongoDB é o banco de dados principal do sistema, responsável por armazenar informações de carteiras, endereços e transações.

1. Baixe o instalador MSI do MongoDB Community Edition
2. Execute o instalador e siga as instruções
3. Marque a opção **"Install MongoDB as a Service"**
4. Após a instalação, o MongoDB iniciará automaticamente como serviço do Windows
5. Verifique a instalação abrindo o PowerShell e executando:
   ```powershell
   mongod --version
   ```

### 1.3. Instalação do Redis no Windows

O Redis é utilizado como cache para melhorar o desempenho do sistema.

1. Baixe o arquivo ZIP do Redis para Windows
2. Extraia para uma pasta (ex: `C:\Redis`)
3. Abra o PowerShell como Administrador
4. Navegue até a pasta do Redis:
   ```powershell
   cd C:\Redis
   ```
5. Inicie o servidor Redis:
   ```powershell
   redis-server.exe
   ```
6. Mantenha esta janela aberta enquanto o sistema estiver em execução

### 1.4. Configuração do Backend (Flask)

1. **Clone o repositório:**
   ```powershell
   git clone <url_do_repositorio>
   cd bitcoin-wallet-backend
   ```

2. **Crie um ambiente virtual Python:**
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Instale as dependências:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente (opcional):**
   Crie um arquivo `.env` na raiz do backend com o seguinte conteúdo:
   ```
   MONGODB_URI=mongodb://localhost:27017/
   REDIS_HOST=localhost
   REDIS_PORT=6379
   SECRET_KEY=your-secret-key-here
   ```

5. **Inicie o servidor Flask:**
   ```powershell
   python app/app.py
   ```
   O backend estará disponível em `http://localhost:5000`

### 1.5. Configuração do Frontend (React)

1. **Abra um novo terminal PowerShell**
2. **Navegue até o diretório do frontend:**
   ```powershell
   cd bitcoin-wallet-frontend
   ```

3. **Instale as dependências:**
   ```powershell
   npm install
   # ou
   pnpm install
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```powershell
   npm run dev
   # ou
   pnpm run dev
   ```
   O frontend estará disponível em `http://localhost:5173`

### 1.6. Testando o Sistema

1. Abra o navegador e acesse `http://localhost:5173`
2. Crie uma nova carteira
3. Gere um novo endereço Bitcoin
4. Verifique a conexão com a Mainnet no cabeçalho (altura do bloco)

---

## 2. Deployment em Produção (HostGator)

**⚠️ ATENÇÃO:** O sistema atual **NÃO ESTÁ PRONTO PARA PRODUÇÃO** conforme indicado na auditoria de segurança. Antes de fazer deployment em produção, implemente as correções críticas de segurança listadas no arquivo `SECURITY_AUDIT.md`.

### 2.1. Requisitos de Hospedagem

Para hospedar este sistema na HostGator, você precisará de:

- **VPS ou Servidor Dedicado** (hospedagem compartilhada não é adequada)
- **Sistema Operacional:** Ubuntu 20.04+ ou CentOS 7+
- **RAM:** Mínimo 2GB (recomendado 4GB+)
- **Espaço em Disco:** Mínimo 20GB
- **Acesso SSH:** Para instalação e configuração

### 2.2. Preparação do Servidor

1. **Conecte-se ao servidor via SSH:**
   ```bash
   ssh usuario@seu-servidor.hostgator.com
   ```

2. **Atualize o sistema:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Instale dependências do sistema:**
   ```bash
   sudo apt install -y python3 python3-pip python3-venv nginx mongodb redis-server git
   ```

4. **Configure o firewall:**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

### 2.3. Instalação do Backend

1. **Clone o repositório:**
   ```bash
   cd /var/www
   sudo git clone <url_do_repositorio> bitcoin-wallet
   cd bitcoin-wallet/bitcoin-wallet-backend
   ```

2. **Crie ambiente virtual e instale dependências:**
   ```bash
   sudo python3 -m venv venv
   sudo venv/bin/pip install -r requirements.txt
   sudo venv/bin/pip install gunicorn
   ```

3. **Configure variáveis de ambiente:**
   ```bash
   sudo nano /var/www/bitcoin-wallet/bitcoin-wallet-backend/.env
   ```
   Adicione:
   ```
   MONGODB_URI=mongodb://localhost:27017/
   REDIS_HOST=localhost
   REDIS_PORT=6379
   SECRET_KEY=<gere-uma-chave-segura-aqui>
   FLASK_ENV=production
   ```

4. **Crie serviço systemd para o backend:**
   ```bash
   sudo nano /etc/systemd/system/bitcoin-wallet-backend.service
   ```
   Conteúdo:
   ```ini
   [Unit]
   Description=Bitcoin Wallet Backend
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/bitcoin-wallet/bitcoin-wallet-backend
   Environment="PATH=/var/www/bitcoin-wallet/bitcoin-wallet-backend/venv/bin"
   ExecStart=/var/www/bitcoin-wallet/bitcoin-wallet-backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app.app:app

   [Install]
   WantedBy=multi-user.target
   ```

5. **Inicie o serviço:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start bitcoin-wallet-backend
   sudo systemctl enable bitcoin-wallet-backend
   ```

### 2.4. Instalação do Frontend

1. **Instale Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **Build do frontend:**
   ```bash
   cd /var/www/bitcoin-wallet/bitcoin-wallet-frontend
   sudo npm install
   sudo npm run build
   ```

### 2.5. Configuração do Nginx

1. **Crie arquivo de configuração do Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/bitcoin-wallet
   ```
   Conteúdo:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       # Frontend
       location / {
           root /var/www/bitcoin-wallet/bitcoin-wallet-frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

2. **Ative o site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/bitcoin-wallet /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 2.6. Configuração de SSL/HTTPS (Obrigatório para Produção)

1. **Instale Certbot:**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtenha certificado SSL:**
   ```bash
   sudo certbot --nginx -d seu-dominio.com
   ```

3. **Configure renovação automática:**
   ```bash
   sudo systemctl enable certbot.timer
   ```

### 2.7. Monitoramento e Logs

**Logs do Backend:**
```bash
sudo journalctl -u bitcoin-wallet-backend -f
```

**Logs do Nginx:**
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**Status dos Serviços:**
```bash
sudo systemctl status bitcoin-wallet-backend
sudo systemctl status mongodb
sudo systemctl status redis-server
sudo systemctl status nginx
```

---

## 3. Checklist de Segurança para Produção

Antes de colocar o sistema em produção com fundos reais, certifique-se de:

- [ ] Implementar autenticação JWT ou OAuth2
- [ ] Adicionar rate limiting em todas as rotas
- [ ] Configurar HTTPS obrigatório
- [ ] Restringir CORS para domínios específicos
- [ ] Implementar proteção CSRF
- [ ] Adicionar validação rigorosa de inputs
- [ ] Configurar backup automático do MongoDB
- [ ] Implementar logs de auditoria
- [ ] Adicionar autenticação de dois fatores
- [ ] Realizar auditoria de segurança externa
- [ ] Executar testes de penetração
- [ ] Configurar monitoramento de segurança
- [ ] Implementar alertas de transações suspeitas

---

## 4. Backup e Recuperação

### 4.1. Backup do MongoDB

**Backup manual:**
```bash
mongodump --db bitcoin_wallet --out /backup/mongodb/$(date +%Y%m%d)
```

**Backup automático (cron):**
```bash
sudo crontab -e
```
Adicione:
```
0 2 * * * mongodump --db bitcoin_wallet --out /backup/mongodb/$(date +\%Y\%m\%d)
```

### 4.2. Restauração

```bash
mongorestore --db bitcoin_wallet /backup/mongodb/20251006/bitcoin_wallet
```

---

## 5. Troubleshooting

### Problema: Backend não inicia

**Solução:**
1. Verifique os logs: `sudo journalctl -u bitcoin-wallet-backend -n 50`
2. Verifique se MongoDB e Redis estão rodando
3. Verifique se as dependências foram instaladas corretamente

### Problema: Frontend não conecta ao backend

**Solução:**
1. Verifique se a URL da API está correta no frontend
2. Verifique as configurações de CORS no backend
3. Verifique os logs do Nginx

### Problema: Erro ao consultar blockchain

**Solução:**
1. Verifique a conexão com a internet
2. Verifique se as APIs de blockchain estão disponíveis
3. Tente adicionar APIs alternativas no arquivo de configuração

---

## 6. Suporte e Manutenção

Para suporte técnico ou dúvidas sobre o deployment:

- Consulte a documentação técnica em `README.md`
- Revise o relatório de auditoria de segurança em `SECURITY_AUDIT.md`
- Execute os testes unitários para validar a instalação

---

**Nota Final:** Este sistema foi desenvolvido para fins educacionais e de demonstração. Para uso em produção com fundos reais, é **OBRIGATÓRIO** implementar todas as correções de segurança listadas na auditoria antes do deployment.

---

*Documento gerado por Manus AI - Sistema Autônomo de Desenvolvimento de Software*
