# Guia de Instalação - Exchange Benjamin57 no HostGator

## 📋 Pré-requisitos

### Plano HostGator Recomendado
- **Plano Business ou superior** (suporte a Python/Flask)
- **SSL Certificate** (incluído nos planos)
- **Acesso SSH** (para instalação de dependências)
- **Banco de dados MySQL** (opcional, usando SQLite por padrão)

### Recursos Necessários
- **Espaço em disco**: Mínimo 500MB
- **Memória RAM**: Mínimo 512MB
- **Python 3.8+** (disponível no HostGator)
- **Mod_rewrite** habilitado (padrão no HostGator)

## 🚀 Passo a Passo da Instalação

### 1. Upload dos Arquivos

#### Via cPanel File Manager:
1. Acesse o **cPanel** da sua conta HostGator
2. Abra o **File Manager**
3. Navegue até a pasta `public_html`
4. **Delete** todos os arquivos existentes (index.html padrão)
5. **Upload** e **extraia** o arquivo `exchange_benjamin57.zip`
6. Certifique-se que os arquivos estão na raiz de `public_html`

#### Via FTP:
```bash
# Conectar via FTP
ftp seu-dominio.com
# Usuário: seu_usuario_cpanel
# Senha: sua_senha_cpanel

# Navegar para public_html
cd public_html

# Upload dos arquivos (use um cliente FTP como FileZilla)
```

### 2. Configuração do Backend (API)

#### Acessar via SSH:
```bash
ssh seu_usuario@seu-dominio.com
cd public_html/api
```

#### Instalar dependências Python:
```bash
# Verificar versão do Python
python3 --version

# Instalar pip se necessário
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py --user

# Instalar dependências
python3 -m pip install --user -r requirements.txt
```

#### Configurar permissões:
```bash
# Dar permissão de execução
chmod +x main.py
chmod 755 api/
chmod 644 api/*.py

# Criar diretórios necessários
mkdir -p uploads/wallets
mkdir -p backups/wallets
mkdir -p database

# Configurar permissões de escrita
chmod 755 uploads/
chmod 755 backups/
chmod 755 database/
```

### 3. Configuração do Banco de Dados

#### Opção A: SQLite (Recomendado para início)
```bash
cd api
python3 -c "
from main import app, db
with app.app_context():
    db.create_all()
    print('Banco de dados SQLite criado com sucesso!')
"
```

#### Opção B: MySQL (Para produção)
1. No cPanel, acesse **MySQL Databases**
2. Crie um novo banco: `exchange_benjamin57`
3. Crie um usuário e associe ao banco
4. Edite o arquivo `main.py`:

```python
# Substituir a linha do SQLite por:
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://usuario:senha@localhost/exchange_benjamin57'
```

### 4. Configuração de Domínio e SSL

#### Configurar SSL:
1. No cPanel, acesse **SSL/TLS**
2. Ative o **Let's Encrypt SSL** (gratuito)
3. Force redirecionamento HTTPS

#### Configurar DNS (se necessário):
- Aponte o domínio para o IP do HostGator
- Configure subdomínio `api.seudominio.com` se desejar

### 5. Teste da Instalação

#### Testar Frontend:
```
https://seudominio.com
```
- Deve carregar a página de login da Exchange

#### Testar Backend:
```
https://seudominio.com/api/users
```
- Deve retornar JSON com lista de usuários

#### Testar Upload:
1. Faça login com: `Lucas` / `<SET_VIA_ENVIRONMENT>`
2. Acesse "Repositório" no menu
3. Teste o upload de um arquivo .txt

### 6. Configurações Avançadas

#### Configurar Cron Jobs (Opcional):
No cPanel > Cron Jobs, adicione:
```bash
# Backup diário às 2h da manhã
0 2 * * * cd /home/usuario/public_html/api && python3 backup_script.py

# Limpeza de logs semanalmente
0 0 * * 0 cd /home/usuario/public_html && find . -name "*.log" -mtime +7 -delete
```

#### Configurar Limites de Upload:
No cPanel > PHP Configuration:
- `upload_max_filesize = 16M`
- `post_max_size = 20M`
- `max_execution_time = 300`
- `memory_limit = 256M`

### 7. Monitoramento e Logs

#### Verificar logs de erro:
```bash
# Logs do Apache
tail -f /home/usuario/logs/error_log

# Logs da aplicação
tail -f /home/usuario/public_html/api/app.log
```

#### Configurar alertas:
- Configure notificações por email no cPanel
- Use ferramentas como UptimeRobot para monitorar disponibilidade

## 🔧 Solução de Problemas

### Erro 500 - Internal Server Error
```bash
# Verificar permissões
ls -la public_html/
chmod 755 public_html/
chmod 644 public_html/index.html

# Verificar logs
tail -f ~/logs/error_log
```

### Erro de Módulo Python
```bash
# Reinstalar dependências
cd public_html/api
python3 -m pip install --user --force-reinstall -r requirements.txt
```

### Problemas de CORS
- Verifique se o arquivo `.htaccess` está na pasta `api/`
- Confirme que mod_headers está habilitado

### Upload não funciona
```bash
# Verificar permissões da pasta uploads
chmod 755 uploads/
chmod 755 uploads/wallets/

# Verificar limites PHP
php -i | grep upload_max_filesize
```

### Banco de dados não conecta
```bash
# Testar conexão SQLite
cd api
python3 -c "
import sqlite3
conn = sqlite3.connect('database/app.db')
print('SQLite conectado com sucesso!')
conn.close()
"
```

## 📊 Configurações de Performance

### Otimização Apache:
Adicione ao `.htaccess` principal:
```apache
# Compressão Gzip
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json
</IfModule>

# Cache de arquivos estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
</IfModule>
```

### Otimização Python:
```python
# No main.py, adicionar:
if __name__ != '__main__':
    # Configurações para produção
    app.config['DEBUG'] = False
    app.config['TESTING'] = False
```

## 🔒 Segurança

### Configurações essenciais:
1. **Altere a SECRET_KEY** no `main.py`
2. **Configure firewall** no cPanel
3. **Ative 2FA** na conta HostGator
4. **Backup regular** dos arquivos e banco

### Arquivo de configuração segura:
Crie `config.py`:
```python
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'sua-chave-super-secreta-aqui'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///database/app.db'
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
```

## 📞 Suporte

### Contatos HostGator:
- **Chat 24/7**: Disponível no painel
- **Telefone**: 0800-600-6656
- **Email**: suporte@hostgator.com.br

### Documentação útil:
- [Python no HostGator](https://suporte.hostgator.com.br/hc/pt-br/articles/360058393914)
- [SSL Let's Encrypt](https://suporte.hostgator.com.br/hc/pt-br/articles/360058393934)
- [Configuração de domínio](https://suporte.hostgator.com.br/hc/pt-br/articles/360058393954)

## ✅ Checklist Final

- [ ] Arquivos enviados para `public_html`
- [ ] Dependências Python instaladas
- [ ] Banco de dados criado e configurado
- [ ] SSL ativado e funcionando
- [ ] Teste de login realizado
- [ ] Upload de arquivos testado
- [ ] Backup configurado
- [ ] Monitoramento ativo

---

**Exchange Benjamin57** - Instalação HostGator Completa! 🚀

Para suporte técnico, consulte a documentação oficial ou entre em contato com o suporte HostGator.

