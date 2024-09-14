from flask import Blueprint, jsonify, render_template, request, send_file
from sqlalchemy import func
import flask_excel as excel
from flask_login import login_required, current_user
from flask_security import auth_required, roles_required
from models import Section, Ebook,db, Request, Issuance, Feedback, User
from datetime import datetime
from celery.result import AsyncResult
from tasks import csv_details
ad= Blueprint('admin', __name__, url_prefix='/admin')

@ad.route('/dashboard', methods=['GET'])
@auth_required()
@roles_required('librarian')
def admin_dashboard():
   return render_template('index.html') 

@ad.route('/requests', methods=['GET'])
@ad.route('/feedbacks', methods=['GET'])
@ad.route('/allusers', methods=['GET'])
@ad.route('/stats', methods=['GET'])
@login_required
@roles_required('librarian')
def user_books():
    return render_template("index.html")

@ad.route('/see-requests', methods=['GET'])
@login_required
@roles_required('librarian')
def see_requests():
    status_filter = request.args.get('status', 'requested')  # Default to 'requested'
    
    if status_filter == 'granted':
        requests = db.session.query(Request, Issuance).join(Issuance, Request.id == Issuance.request_id).filter(Request.status == 'granted').order_by(Issuance.date_issued.desc()).all()
        requests_data = [
            {
                'id': req.id,
                'book_name': req.ebook.name,
                'section_name': req.ebook.section.name,
                'user_name': req.user.username,
                'date_issued': issuance.date_issued.date().strftime('%Y-%m-%d'),
                'status': req.status,
                'book_content': req.ebook.content
            }
            for req, issuance in requests
        ]
    elif status_filter == 'rejected':
        requests = Request.query.filter(Request.status == 'rejected').order_by(Request.request_date.desc()).all()
        requests_data = [
            {
                'id': req.id,
                'book_name': req.ebook.name,
                'section_name': req.ebook.section.name,
                'user_name': req.user.username,
                'date_request': req.request_date.date().strftime('%Y-%m-%d'),
                'status': req.status,
                'book_content': req.ebook.content
            }
            for req in requests
        ]
    else:  
        requests = Request.query.filter(Request.status == 'requested').order_by(Request.request_date.desc()).all()
        requests_data = [
            {
                'id': req.id,
                'book_name': req.ebook.name,
                'section_name': req.ebook.section.name,
                'user_name': req.user.username,
                'days_requested': (datetime.now() - req.request_date).days,
                'status': req.status,
                'book_content': req.ebook.content
            }
            for req in requests
        ]
    
    return jsonify(requests_data)


@ad.route('/requests/<int:request_id>/grant', methods=['POST'])
@login_required
@roles_required('librarian')
def grant_request(request_id):
    req = Request.query.get(request_id)
    if req:
        req.status = 'granted'
        db.session.commit()

        issuance = Issuance(
            ebook_id=req.ebook_id,
            user_id=req.user_id,
            date_issued=datetime.utcnow(),
            request_id=req.id
        )
        db.session.add(issuance)
        db.session.commit()  
        return jsonify({"message": "Request granted"}), 200
    return jsonify({"message": "Request not found"}), 404

@ad.route('/requests/<int:request_id>/reject', methods=['POST'])
@login_required
@roles_required('librarian')
def reject_request(request_id):
    req = Request.query.get(request_id)
    if req:
        req.status = 'rejected'
        db.session.commit()
        return jsonify({"message": "Request rejected"}), 200
    return jsonify({"message": "Request not found"}), 404

@ad.route('/ebooks/<int:ebook_id>/view', methods=['GET'])
@login_required
@roles_required('librarian')
def view_ebook(ebook_id):
    ebook = Ebook.query.get(ebook_id)
    if ebook:
        return jsonify({
            'id': ebook.id,
            'name': ebook.name,
            'author': ebook.author,
            'section': ebook.section.name,
            'content': ebook.content, # Make sure to handle large content appropriately
            'link':ebook.link
        })
    return render_template("index.html")



@ad.route('/see-feedbacks', methods=['GET'])
@login_required
@roles_required('librarian')
def get_feedbacks():
    feedbacks = Feedback.query.order_by(Feedback.id.desc()).all()
    result = [{
        'id': feedback.id,
        'bookName': feedback.ebook.name,  
        'section': feedback.ebook.section.name, 
        'userName': feedback.user.username,  
        'rating': feedback.rating,
        'comment': feedback.comment if feedback.comment else 'No Comment'
    } for feedback in feedbacks]

    return jsonify(result)

@ad.route('/see-users', methods=['GET'])
def api_admin_users():
    users = User.query.filter(User.active == True).all()
    users_data = []

    for user in users:
        books_issued = db.session.query(func.count(Issuance.id)).filter_by(user_id=user.id).scalar()
        users_data.append({
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'books_issued': books_issued
        })

    return jsonify({'users': users_data})

#stats 
@ad.route('/stats/active-users')
def get_active_users():
    active_users = User.query.count()-2
    return jsonify({'count': active_users})

@ad.route('/stats/granted-requests')
def get_granted_requests():
    granted_requests = Request.query.filter_by(status='granted').count()
    return jsonify({'count': granted_requests})

@ad.route('/stats/ebooks-issued')
def get_ebooks_issued():
    issued_ebooks = Issuance.query.count()
    return jsonify({'count': issued_ebooks})

@ad.route('/stats/revoked-ebooks')
def get_revoked_ebooks():
    revoked_ebooks = Request.query.filter_by(status='rejected').count()
    return jsonify({'count': revoked_ebooks})

@ad.route('/stats/avg-rating', methods=['GET'])
@login_required
@roles_required('librarian')
def avg_feedback_rating():
    avg_rating = db.session.query(func.avg(Feedback.rating)).scalar() or 0
    return jsonify({'avgRating': avg_rating})

@ad.route('/stats/granted-books-per-section', methods=['GET'])
@login_required
@roles_required('librarian')
def ebooks_per_section():
    sections = Section.query.all()
    data = []
    for section in sections:
        total_books = len(section.ebooks)
        granted_books = sum(
            1 for ebook in section.ebooks 
            if any(issuance for issuance in ebook.issuances if issuance.request and issuance.request.status == 'granted')
        )
        data.append({
            'name': section.name,
            'totalBooks': total_books,
            'grantedBooks': granted_books
        })
    return jsonify({'sections': data})

#download_csv
@ad.route('/download-csv', methods=['GET'])
def download():
     task = csv_details.delay()
     return jsonify({"task-id": task.id})

@ad.route("/get-csv/<task_id>", methods=['GET'])
def get_csv(task_id):
    res=AsyncResult(task_id)
    if res.ready():
        filename=res.result
        return send_file(filename, as_attachment='True')
    else:
        return jsonify({"message":"Task Pending"}), 400


