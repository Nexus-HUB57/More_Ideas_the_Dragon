# Guia de Deployment - Exchange Benjamin57

## 🚀 Opções de Deployment

### 1. Desenvolvimento Local

#### Backend
```bash
cd crypto_exchange_backend
source venv/bin/activate
python src/main.py
```
- **URL**: http://localhost:5000
- **Ambiente**: Desenvolvimento
- **Debug**: Habilitado

#### Frontend
```bash
cd crypto_exchange_frontend
npm run dev
```
- **URL**: http://localhost:5173
- **Hot Reload**: Habilitado
- **Source Maps**: Habilitados

### 2. Build de Produção

#### Frontend Build
```bash
cd crypto_exchange_frontend
npm run build
```
- Gera arquivos otimizados em `dist/`
- Minificação automática
- Tree shaking
- Assets otimizados

#### Backend Produção
```bash
cd crypto_exchange_backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```
- **Workers**: 4 processos
- **Bind**: Todas as interfaces
- **WSGI**: Gunicorn

### 3. Docker (Recomendado)

#### Dockerfile Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY src/ ./src/
COPY database/ ./database/

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "src.main:app"]
```

#### Dockerfile Frontend
```dockerfile
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./crypto_exchange_backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=sqlite:///database/exchange.db
    volumes:
      - ./data:/app/database

  frontend:
    build: ./crypto_exchange_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://backend:5000

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

### 4. Cloud Deployment

#### AWS
```bash
# EC2 + RDS + S3
aws ec2 run-instances --image-id ami-12345 --instance-type t3.medium
aws rds create-db-instance --db-instance-identifier exchange-db
aws s3 create-bucket --bucket exchange-assets
```

#### Google Cloud
```bash
# App Engine + Cloud SQL + Cloud Storage
gcloud app deploy app.yaml
gcloud sql instances create exchange-db
gcloud storage buckets create gs://exchange-assets
```

#### Azure
```bash
# App Service + SQL Database + Blob Storage
az webapp create --name exchange-app --resource-group rg
az sql db create --name exchange-db --server sql-server
az storage account create --name exchangestorage
```

### 5. Kubernetes

#### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: exchange-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: exchange-backend
  template:
    metadata:
      labels:
        app: exchange-backend
    spec:
      containers:
      - name: backend
        image: exchange-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          value: "postgresql://user:pass@db:5432/exchange"
```

#### Frontend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: exchange-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: exchange-frontend
  template:
    metadata:
      labels:
        app: exchange-frontend
    spec:
      containers:
      - name: frontend
        image: exchange-frontend:latest
        ports:
        - containerPort: 80
```

## 🔧 Configurações de Ambiente

### Variáveis de Ambiente

#### Backend (.env)
```bash
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///database/exchange.db
CORS_ORIGINS=https://yourdomain.com
JWT_SECRET_KEY=your-jwt-secret
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env)
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://ws.yourdomain.com
VITE_APP_NAME=Exchange Benjamin57
VITE_APP_VERSION=1.0.0
```

### Configuração Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📊 Monitoramento

### Health Checks
```python
# Backend health check
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }
```

### Métricas
```python
# Prometheus metrics
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('requests_total', 'Total requests')
REQUEST_LATENCY = Histogram('request_duration_seconds', 'Request latency')
```

### Logs
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('exchange.log'),
        logging.StreamHandler()
    ]
)
```

## 🔒 Segurança

### SSL/TLS
```bash
# Let's Encrypt
certbot --nginx -d yourdomain.com
```

### Firewall
```bash
# UFW rules
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 5000/tcp  # Block direct backend access
```

### Rate Limiting
```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/api/login')
@limiter.limit("5 per minute")
def login():
    pass
```

## 📈 Performance

### Caching
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@cache.cached(timeout=300)
def get_market_data():
    pass
```

### Database Optimization
```sql
-- Índices importantes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_pair ON orders(pair);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### CDN
```javascript
// Frontend assets via CDN
const CDN_URL = 'https://cdn.yourdomain.com'
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy Exchange

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm test
          python -m pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker build -t exchange .
          docker push registry/exchange:latest
          kubectl apply -f k8s/
```

## 📋 Checklist de Deployment

### Pré-deployment
- [ ] Testes unitários passando
- [ ] Testes de integração passando
- [ ] Build de produção funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/TLS configurado
- [ ] Backup do banco de dados

### Pós-deployment
- [ ] Health checks funcionando
- [ ] Logs sendo coletados
- [ ] Métricas sendo monitoradas
- [ ] Alertas configurados
- [ ] Documentação atualizada
- [ ] Equipe notificada

## 🆘 Troubleshooting

### Problemas Comuns

#### CORS Errors
```python
# Verificar configuração CORS
CORS(app, origins=['https://yourdomain.com'])
```

#### Database Connection
```python
# Verificar string de conexão
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///exchange.db')
```

#### Build Errors
```bash
# Limpar cache
npm run clean
rm -rf node_modules
npm install
```

### Logs Úteis
```bash
# Backend logs
tail -f exchange.log

# Frontend logs
docker logs frontend-container

# Nginx logs
tail -f /var/log/nginx/access.log
```

---

**Exchange Benjamin57** - Deployment Guide 🚀

