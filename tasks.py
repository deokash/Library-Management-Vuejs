from celery import shared_task
from jinja2 import Environment, FileSystemLoader
from flask_mail import Message
from datetime import datetime, timedelta
from mail import send_message
import flask_excel as excel
from models import User, Request, Ebook, Issuance,db, Section, Feedback


@shared_task(ignore_result=False)
def send_daily_reminders(subject):
        now = datetime.now()
        
        users_with_due_books = db.session.query(User).join(Request).join(Ebook).join(Issuance).filter(
            Request.status == 'granted',
            Issuance.date_issued <= now - timedelta(days=4),
            Issuance.date_issued > now - timedelta(days=7),
        ).all()

        for user in users_with_due_books:
            books_due_soon = db.session.query(Ebook).join(Request).join(Issuance).filter(
                Request.user_id == user.id,
                Request.status == 'granted',
                Issuance.date_issued <= now - timedelta(days=4),
                Issuance.date_issued > now - timedelta(days=7),
            ).all()

            if books_due_soon:
                book_titles = ", ".join([ebook.name for ebook in books_due_soon])
                message = f"Hi {user.username}, you have books ({book_titles}) that are due soon. Please return them within 3 days to avoid losing access of books."
                send_message(user.email, subject, message)

        overdue_books = db.session.query(Request).filter(
            Request.status == 'granted',
            Issuance.date_issued <= now - timedelta(days=7)
        ).all()

        for request in overdue_books:
            request.status = 'returned'
            db.session.commit()

@shared_task(ignore_result=False)
def send_welcome(user_id):
    user = User.query.get(user_id)
    if user:
        subject = "Welcome to Our Library!"
        message = f"Hi {user.username},\n\nWelcome to our library! We're excited to have you with us. Explore our collection and enjoy reading.\n\nBest Regards,\nThe Library Team"
        send_message(user.email, subject,message, )


@shared_task(ignore_result=False)
def send_monthly_report():
    sections = db.session.query(Section, Ebook, Issuance).filter(
        Section.id == Ebook.section_id,
        Ebook.id == Issuance.ebook_id
    ).all()
    
    ratings = db.session.query(Feedback, Ebook).filter(
        Feedback.ebook_id == Ebook.id
    ).all()

    ratings.reverse()

    sections_data = []
    for section, ebook, issuance in sections:
        sections_data.append({
            'name': section.name,
            'ebook_name': ebook.name,
            'date_issued': issuance.date_issued.date(),
            'return_date': issuance.return_date.date() if issuance.return_date else "Not returned",
        })

    ratings_data = []
    for feedback, ebook in ratings:
        ratings_data.append({
            'ebook_name': ebook.name,
            'rating': feedback.rating,
            'comment': feedback.comment,
        })
    env = Environment(loader=FileSystemLoader('./templates'))
    template = env.get_template('monthly_report.html')
        
    
    html_content = template.render(sections=sections_data, ratings=ratings_data)
    subject = "Monthly Activity Report"
    send_message('librarian@example.com', subject, html_content, content_type='html')


@shared_task(ignore_result=False)
def csv_details():
    data = (
            db.session.query(Ebook.name, Ebook.author, Ebook.content, Issuance.date_issued, Issuance.return_date)
            .join(Issuance, Ebook.id == Issuance.ebook_id)
            .all()
        )
    results = []
    for name, author, content, date_issued, return_date in data:
        results.append([
            name,
            author,
            content,
            date_issued.date() if date_issued else None,  
            return_date.date() if return_date else None   
        ])
    
    output= excel.make_response_from_query_sets(results,["Name", "Author(s)", "Content", "Date Issued","Returned Date"], "csv")
    filename = "output.csv"

    with open(filename, 'wb') as f:
        f.write(output.data)

    return filename