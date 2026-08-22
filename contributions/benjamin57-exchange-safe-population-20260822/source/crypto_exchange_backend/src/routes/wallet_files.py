import os
import hashlib
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from sqlalchemy.exc import SQLAlchemyError
from ..models import db
from ..models.wallet_file import WalletFile, WalletBackup
from ..models.user import User

wallet_files_bp = Blueprint('wallet_files', __name__)

# Configurações de upload
ALLOWED_EXTENSIONS = {'dat', 'txt', 'core'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_hash(file_path):
    """Calcula o hash SHA256 do arquivo"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

@wallet_files_bp.route('/api/wallet-files', methods=['GET'])
def get_wallet_files():
    """Listar arquivos de wallet do usuário"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        wallet_files = WalletFile.query.filter_by(
            user_id=user_id, 
            is_active=True
        ).order_by(WalletFile.created_at.desc()).all()
        
        return jsonify({
            'wallet_files': [wf.to_dict() for wf in wallet_files]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_files_bp.route('/api/wallet-files/upload', methods=['POST'])
def upload_wallet_file():
    """Upload de arquivo de wallet"""
    try:
        # Verificar se o arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo foi enviado'}), 400
        
        file = request.files['file']
        user_id = request.form.get('user_id')
        currency = request.form.get('currency', '')
        wallet_address = request.form.get('wallet_address', '')
        description = request.form.get('description', '')
        
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Verificar se o usuário existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        # Verificar extensão do arquivo
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Tipo de arquivo não permitido. Use apenas .dat, .txt ou .core'
            }), 400
        
        # Verificar tamanho do arquivo
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'error': f'Arquivo muito grande. Tamanho máximo: {MAX_FILE_SIZE // (1024*1024)}MB'
            }), 400
        
        # Gerar nome seguro para o arquivo
        original_filename = file.filename
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"wallet_{user_id}_{timestamp}.{file_extension}"
        
        # Criar diretório de upload se não existir
        upload_dir = os.path.join(current_app.root_path, '..', 'uploads', 'wallets')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Salvar arquivo
        file_path = os.path.join(upload_dir, safe_filename)
        file.save(file_path)
        
        # Criar registro no banco de dados
        wallet_file = WalletFile(
            user_id=user_id,
            filename=safe_filename,
            original_filename=original_filename,
            file_type=file_extension,
            file_size=file_size,
            file_path=file_path,
            currency=currency.upper() if currency else None,
            wallet_address=wallet_address,
            description=description
        )
        
        db.session.add(wallet_file)
        db.session.commit()
        
        return jsonify({
            'message': 'Arquivo de wallet enviado com sucesso',
            'wallet_file': wallet_file.to_dict()
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Erro no banco de dados'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_files_bp.route('/api/wallet-files/<int:file_id>', methods=['GET'])
def get_wallet_file(file_id):
    """Obter detalhes de um arquivo de wallet"""
    try:
        wallet_file = WalletFile.query.get(file_id)
        if not wallet_file:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        return jsonify({'wallet_file': wallet_file.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_files_bp.route('/api/wallet-files/<int:file_id>', methods=['PUT'])
def update_wallet_file(file_id):
    """Atualizar informações de um arquivo de wallet"""
    try:
        wallet_file = WalletFile.query.get(file_id)
        if not wallet_file:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        data = request.get_json()
        
        # Atualizar campos permitidos
        if 'currency' in data:
            wallet_file.currency = data['currency'].upper() if data['currency'] else None
        if 'wallet_address' in data:
            wallet_file.wallet_address = data['wallet_address']
        if 'description' in data:
            wallet_file.description = data['description']
        
        wallet_file.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Arquivo atualizado com sucesso',
            'wallet_file': wallet_file.to_dict()
        }), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Erro no banco de dados'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_files_bp.route('/api/wallet-files/<int:file_id>', methods=['DELETE'])
def delete_wallet_file(file_id):
    """Excluir arquivo de wallet (soft delete)"""
    try:
        wallet_file = WalletFile.query.get(file_id)
        if not wallet_file:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        # Soft delete
        wallet_file.is_active = False
        wallet_file.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Arquivo excluído com sucesso'}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Erro no banco de dados'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_files_bp.route('/api/wallet-files/<int:file_id>/backup', methods=['POST'])
def create_backup(file_id):
    """Criar backup de um arquivo de wallet"""
    try:
        wallet_file = WalletFile.query.get(file_id)
        if not wallet_file:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        data = request.get_json()
        backup_name = data.get('backup_name', f'backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}')
        
        # Verificar se o arquivo original existe
        if not os.path.exists(wallet_file.file_path):
            return jsonify({'error': 'Arquivo original não encontrado'}), 404
        
        # Criar diretório de backup
        backup_dir = os.path.join(current_app.root_path, '..', 'backups', 'wallets')
        os.makedirs(backup_dir, exist_ok=True)
        
        # Gerar nome do backup
        backup_filename = f"{backup_name}_{wallet_file.filename}"
        backup_path = os.path.join(backup_dir, backup_filename)
        
        # Copiar arquivo
        import shutil
        shutil.copy2(wallet_file.file_path, backup_path)
        
        # Calcular hash do backup
        backup_hash = get_file_hash(backup_path)
        backup_size = os.path.getsize(backup_path)
        
        # Criar registro do backup
        backup = WalletBackup(
            user_id=wallet_file.user_id,
            wallet_file_id=wallet_file.id,
            backup_name=backup_name,
            backup_path=backup_path,
            backup_size=backup_size,
            backup_hash=backup_hash
        )
        
        db.session.add(backup)
        db.session.commit()
        
        return jsonify({
            'message': 'Backup criado com sucesso',
            'backup': backup.to_dict()
        }), 201
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Erro no banco de dados'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_files_bp.route('/api/wallet-files/backups', methods=['GET'])
def get_backups():
    """Listar backups do usuário"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        backups = WalletBackup.query.filter_by(user_id=user_id)\
                                   .order_by(WalletBackup.created_at.desc()).all()
        
        return jsonify({
            'backups': [backup.to_dict() for backup in backups]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@wallet_files_bp.route('/api/wallet-files/stats', methods=['GET'])
def get_wallet_stats():
    """Estatísticas dos arquivos de wallet"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id é obrigatório'}), 400
        
        # Contar arquivos por tipo
        stats = db.session.query(
            WalletFile.file_type,
            db.func.count(WalletFile.id).label('count'),
            db.func.sum(WalletFile.file_size).label('total_size')
        ).filter_by(user_id=user_id, is_active=True)\
         .group_by(WalletFile.file_type).all()
        
        # Contar por moeda
        currency_stats = db.session.query(
            WalletFile.currency,
            db.func.count(WalletFile.id).label('count')
        ).filter_by(user_id=user_id, is_active=True)\
         .filter(WalletFile.currency.isnot(None))\
         .group_by(WalletFile.currency).all()
        
        total_files = WalletFile.query.filter_by(user_id=user_id, is_active=True).count()
        total_size = db.session.query(db.func.sum(WalletFile.file_size))\
                              .filter_by(user_id=user_id, is_active=True).scalar() or 0
        
        return jsonify({
            'total_files': total_files,
            'total_size': total_size,
            'by_type': [{'type': stat.file_type, 'count': stat.count, 'size': stat.total_size or 0} 
                       for stat in stats],
            'by_currency': [{'currency': stat.currency, 'count': stat.count} 
                           for stat in currency_stats]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

