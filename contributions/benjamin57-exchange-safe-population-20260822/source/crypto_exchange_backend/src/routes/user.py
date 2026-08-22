from flask import Blueprint, jsonify, request
from src.models.user import User, db
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.json
        
        # Validações básicas
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se usuário já existe
        existing_user = User.query.filter(
            (User.username == data['username']) | (User.email == data['email'])
        ).first()
        
        if existing_user:
            return jsonify({'error': 'Usuário ou email já existe'}), 400
        
        # Criar usuário
        user = User(
            username=data['username'], 
            email=data['email'],
            password=data['password']
        )
        
        # Campos opcionais
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'country' in data:
            user.country = data['country']
        if 'city' in data:
            user.city = data['city']
        if 'address' in data:
            user.address = data['address']
        if 'document_number' in data:
            user.document_number = data['document_number']
        if 'document_type' in data:
            user.document_type = data['document_type']
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário criado com sucesso',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.json
        
        # Campos que podem ser atualizados
        updatable_fields = ['first_name', 'last_name', 'phone', 'country', 
                           'city', 'address', 'document_number', 'document_type']
        
        for field in updatable_fields:
            if field in data:
                setattr(user, field, data[field])
        
        # Campos especiais
        if 'password' in data:
            user.set_password(data['password'])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário atualizado com sucesso',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'Usuário deletado com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username e password são obrigatórios'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Usuário desativado'}), 401
        
        # Atualizar último login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'user': user.to_dict(),
            'token': user.api_key  # Em produção seria um JWT
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/auth/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    try:
        user = User.query.get_or_404(user_id)
        return jsonify(user.to_dict(include_sensitive=True))
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
