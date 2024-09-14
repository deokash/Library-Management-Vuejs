import os
import pytz
current_dir=os.path.abspath(os.path.dirname(__file__))

class Config():
    DEBUG=False
    SQLITE_DB_DIR= None
    SQLALCHEMY_DATABASE_URI=None
    SQLALCHEMEY_TRACK_MODIFICATIONS=False

class DevelopmentConfig(Config):
    DEBUG = True
    SECRET_KEY = 'ddhhjdjashfiud0099v'
    SQLALCHEMY_DATABASE_URI= 'sqlite:///'+ os.path.join(current_dir,'test.sqlite3')
    SECURITY_PASSWORD_SALT = 'mypasswordokokok9090'
    SECURITY_TOKEN_AUTHENTICATION_HEADER= 'Authentication-Token'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SESSION_TYPE= 'filesystem'
    LOCAL_TIMEZONE = pytz.timezone('Asia/Kolkata') 