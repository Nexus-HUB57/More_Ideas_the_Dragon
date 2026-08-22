import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.swap_operations import swap_bp
from src.routes.custody_monitor import custody_bp
from src.routes.pesbm_routes import pesbm_bp
from src.routes.wallet_upload import wallet_upload_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'ENTERPRISE_BITCOIN_DASHBOARD_SECRET_2025'

# Habilitar CORS para integração frontend-backend
CORS(app, origins="*")

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(swap_bp, url_prefix='/')
app.register_blueprint(custody_bp, url_prefix='/')
app.register_blueprint(pesbm_bp, url_prefix='/')
app.register_blueprint(wallet_upload_bp, url_prefix='/')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/health')
def health_check():
    """Health check endpoint para monitoramento"""
    return {
        "status": "OPERATIONAL",
        "service": "Enterprise Bitcoin Dashboard",
        "version": "1.0.0",
        "custody_balance": "31089.84 BTC",
        "timestamp": "2025-08-20T04:05:23Z"
    }

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
