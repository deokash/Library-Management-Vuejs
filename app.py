from flask import Flask,  render_template, flash, session
from flask_security import Security, SQLAlchemyUserDatastore
from models import db, User, Role, Ebook
from config import DevelopmentConfig
import initial_data
from datetime import datetime
from worker import celery_init_app
from tasks import send_daily_reminders, send_monthly_report
from celery.schedules import crontab
import flask_excel as excel
import pytz

from resources import resources_bp

app=Flask(__name__)

# Initialize the database
app.config.from_object(DevelopmentConfig)
db.init_app(app)
app.app_context().push
# api.init_app(app)
app.register_blueprint(resources_bp, url_prefix='/api')
# Setup Flask-Security
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)

from application.controllers import auth,user,admin
app.register_blueprint(user.us)
app.register_blueprint(admin.ad)
app.register_blueprint(auth.bp)

excel.init_excel(app)
celery_app = celery_init_app(app)

@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=18, minute=30),
        send_daily_reminders.s('Library Reminder'),
    )
    sender.add_periodic_task(
        crontab(hour=10, minute=30, day_of_month=1 ),
        send_monthly_report.s(),
    )
 

with app.app_context():
    db.create_all()
    initial_data.create_data(user_datastore)

    
@app.route('/')
def index():    
    return render_template('index.html')
    
if __name__ == "__main__":
    app.run(debug=True)