from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime 
from flask_security.models import fsqla_v3 as fsq

db = SQLAlchemy()

roles_users = db.Table(
    'roles_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), default='user')
    description = db.Column(db.String(255), default='This is a user')

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True)
    name=db.Column(db.String(30), nullable=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True)
    password= db.Column(db.String(255))
    active = db.Column(db.Boolean())
    confirmed_at = db.Column(db.DateTime())
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    

class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    date_created = db.Column(db.DateTime, nullable=False)
    modified_date=db.Column(db.DateTime, nullable=True)
    description = db.Column(db.Text, nullable=True)
    ebooks = db.relationship('Ebook', back_populates='section', cascade='all, delete-orphan')

class Ebook(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(100), nullable=False)
    date_created = db.Column(db.DateTime, nullable=False)
    modified_date=db.Column(db.DateTime, nullable=True)
    link = db.Column(db.String(255), nullable=True)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)
    section = db.relationship('Section', back_populates='ebooks')
    issuances = db.relationship('Issuance', back_populates='ebook', cascade='all, delete-orphan')

class Issuance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ebook_id = db.Column(db.Integer, db.ForeignKey('ebook.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey('request.id', ondelete='CASCADE'), nullable=False)
    date_issued = db.Column(db.DateTime, default=datetime.utcnow)
    return_date = db.Column(db.DateTime, nullable=True)

    ebook = db.relationship('Ebook', back_populates='issuances')
    request = db.relationship('Request', back_populates='issuance')

class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ebook_id = db.Column(db.Integer, db.ForeignKey('ebook.id'), nullable=False)
    request_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='requested')

    user = db.relationship('User', backref=db.backref('requests', lazy=True))
    ebook = db.relationship('Ebook', backref=db.backref('requests', lazy=True, cascade='all, delete-orphan'))
    issuance = db.relationship('Issuance', uselist=False, back_populates='request', cascade="all, delete-orphan")

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ebook_id = db.Column(db.Integer, db.ForeignKey('ebook.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)

    ebook = db.relationship('Ebook', backref='feedbacks')
    user = db.relationship('User', backref='feedbacks')
