from flask_security import SQLAlchemySessionUserDatastore
from flask_security.utils import hash_password
from models import User, Role, db 

def create_data(user_datastore : SQLAlchemySessionUserDatastore):
    print("Creating roles and users")  # For debug purposes

    # Creating roles
    user_datastore.find_or_create_role(name='user', description='Regular user')
    user_datastore.find_or_create_role(name='librarian', description='Librarian role')

    # Creating initial users
    if not user_datastore.find_user(email='user@example.com'):
        user_datastore.create_user(email='user@example.com', password=hash_password('user'), roles=['user'],name="username", username="username")
    if not user_datastore.find_user(email='librarian@example.com'):
        user_datastore.create_user(email='librarian@example.com', password=hash_password('librarian'), roles=['librarian'],name="librarian", username="librarian")

    # Commit the changes to the database
    db.session.commit()

