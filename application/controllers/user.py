from models import db, User, Role, Ebook ,Request,Feedback
from datetime import datetime
from flask import Blueprint, jsonify, session,render_template, request
from flask_login import login_required, current_user
from models import Issuance, Request
from datetime import timedelta
from flask_security.utils import verify_password, hash_password
from flask_security import auth_required, roles_required

us = Blueprint('user', __name__, url_prefix='/user')

@us.route('/dashboard', methods=['GET'])
@auth_required()
@roles_required('user')
def user_dashboard():
    return render_template("index.html")

@us.route('/books', methods=['GET'])
@us.route('/mybooks', methods=['GET'])
@us.route('/feedbacks')
@us.route('/profile')
@login_required
@roles_required('user')
def user_books():
    return render_template("index.html")

@us.route('/ebooks', methods=['GET'])
@login_required
def get_ebooks():
    ebooks = Ebook.query.all()
    ebooks_data = []
    for ebook in ebooks:
        request_status = 'none'
        user_request = Request.query.filter_by(user_id=current_user.id, ebook_id=ebook.id).first()
        if user_request:
            user_request = Request.query.filter_by(
                ebook_id=ebook.id,user_id=current_user.id).order_by(Request.request_date.desc()).first()
            request_status = user_request.status

        #if user_request.status in ['granted', 'returned', 'rejected']:
        #         request_status = user_request.status
        #elif user_request.status == 'requested':
        #     request_status = 'requested'

        ebooks_data.append({
            'id': ebook.id,
            'name': ebook.name,
            'author': ebook.author,
            'section_id': ebook.section_id,
            'section_name': ebook.section.name,
            'requestStatus': request_status,
        })
    return jsonify(ebooks_data)

@us.route('/ebooks/<int:ebook_id>/request', methods=['POST'])
@login_required
def request_ebook(ebook_id):
    existing_request = Request.query.filter_by(ebook_id=ebook_id, user_id=current_user.id).order_by(Request.request_date.desc()).first()

    if existing_request and existing_request.status in ['requested']:
        return jsonify({'success': False, 'message': 'Your request for this book is still pending.'}), 400

    if existing_request and existing_request.status == 'granted':
        return jsonify({'success': False, 'message': 'You have already been granted access to this book.'}), 400

    new_request = Request(ebook_id=ebook_id, user_id=current_user.id,request_date=datetime.utcnow(), status='requested')
    db.session.add(new_request)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Request submitted successfully.'}), 200


@us.route('/ebooks/<int:ebook_id>/view', methods=['GET'])
@login_required
def view_ebook(ebook_id):
    ebook = Ebook.query.get(ebook_id)
    if ebook:
        return jsonify({
            'id': ebook.id,
            'name': ebook.name,
            'author': ebook.author,
            'section': ebook.section.name,
            'content': ebook.content, 
            'link':ebook.link
        })
    return render_template("index.html")

@us.route('/allrequests-user', methods=['GET'])
@login_required
@roles_required("user")
def fetch_user_requests():
    user_id = current_user.id  

    # Fetch current requests
    current_requests = Request.query.filter_by(user_id=user_id).filter(Request.status.in_(['requested', 'granted'])).all()
    today = datetime.utcnow()
    # Fetch completed requests
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    completed_requests = Issuance.query.filter_by(user_id=user_id) \
                        .filter(Issuance.return_date.isnot(None)) \
                        .filter(Issuance.return_date <= today) \
                        .order_by(Issuance.return_date.desc()) \
                        .all()
   
    def to_dict(obj):
        data = {
            'id': obj.id,
            'book_id': obj.ebook.id,  
            'book_name': obj.ebook.name,
            'author': obj.ebook.author,
            'section': obj.ebook.section.name 
        }
        
   
        if isinstance(obj, Request):
            data['status'] = obj.status
        elif isinstance(obj, Issuance):
            data['status'] = 'returned' if obj.return_date else 'issued'  
        
        return data
    
    current_requests_data = [to_dict(req) for req in current_requests]
    completed_requests_data = [to_dict(req) for req in completed_requests]

    return jsonify({
        'current_requests': current_requests_data,
        'completed_requests': completed_requests_data
    })

@us.route('/requests/<int:request_id>/return', methods=['POST'])
@login_required
@roles_required('user')
def return_book(request_id):
    issuance = Issuance.query.filter_by(request_id=request_id).first()
    req = Request.query.get(request_id)
    if req and issuance:
        req.status = 'returned'
        issuance.return_date = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Book returned successfully'}), 200
    return jsonify({'message': 'Issuance record not found'}), 404

@us.route('/see-feedbacks', methods=['GET'])
@login_required
@auth_required()
@roles_required('user')
def get_user_feedbacks():
    feedbacks = Feedback.query.filter_by(user_id=current_user.id).all()
    feedbacks_data = [{
        'id': fb.id,
        'ebook_id': fb.ebook_id,
        'rating': fb.rating,
        'comment': fb.comment,
        'ebook_name': Ebook.query.get(fb.ebook_id).name  
    } for fb in feedbacks]

    return jsonify(feedbacks_data)

@us.route('/feedbacks', methods=['POST'])
@auth_required()
@roles_required('user')
def add_feedback():
    data = request.json
    ebook_id = data.get('ebook_id')
    rating = data.get('rating')
    comment = data.get('comment')
    user_id = current_user.id

    if not ebook_id or not rating:
        return jsonify({'message': 'Ebook ID and rating are required'}), 400

    feedback = Feedback(user_id=user_id, ebook_id=ebook_id, rating=rating, comment=comment)
    db.session.add(feedback)
    db.session.commit()

    return jsonify({'message': 'Feedback submitted successfully'}), 201

@us.route('/feedbacks/<int:feedback_id>', methods=['PUT'])
@auth_required()
@roles_required('user')
def update_feedback(feedback_id):
    data = request.json
    rating = data.get('rating')
    comment = data.get('comment')

    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({'message': 'Feedback not found'}), 404

    if rating is not None:
        feedback.rating = rating
    if comment is not None:
        feedback.comment = comment
    
    db.session.commit()

    return jsonify({'message': 'Feedback updated successfully'}), 200


@us.route('/profile-data', methods=['GET'])
@login_required
def profile_data():
    user = current_user
    user_data = {
        'username': user.username,
        'name': user.name,
        'email': user.email
    }
    return jsonify(user_data)

@us.route('/update-profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    username = data.get('username')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

  
    if username != current_user.username:
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"message": "Username already taken"}), 400

    if email != current_user.email:
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "Email already taken"}), 400

  
    current_user.username = username
    current_user.name = name
    current_user.email = email
    if password:
        current_user.password = hash_password(password)
    
    db.session.commit()
    return jsonify({"message": "Profile updated successfully"}), 200
