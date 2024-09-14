from flask import Blueprint, request, jsonify,session
from flask_security import Security, login_user, logout_user, current_user
from flask_security.utils import verify_password, hash_password
from datetime import datetime
from models import db, User, Role
from tasks import send_welcome

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['GET','POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()

    if user and verify_password(password, user.password):
        user.confirmed_at = datetime.utcnow()
        db.session.commit()
        login_user(user)
        session['user_id'] = user.id
        session['email'] = user.email
        session['role'] = user.roles[0].name  

        return jsonify({
            'success': True,
            'message': 'User logged in successfully',
            'role': session['role'],
            "token": user.get_auth_token()
        }), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid email or password'
        }), 400


@bp.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'User logged out successfully'}), 200

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Username already taken'}), 400
    
    user_role = Role.query.filter_by(name='user').first()
    if not user_role:
        user_role = user_datastore.create_role(name='user', description='This is a user')
    
    user = user_datastore.create_user(
        name=data['name'],
        username=data['username'],
        email=data['email'],
        password=hash_password(data['password']),
        roles=[user_role]
    )
    db.session.commit()
    send_welcome.delay(user.id)
    return jsonify({'success': True, 'message': 'User registered successfully'}), 201


from app import user_datastore