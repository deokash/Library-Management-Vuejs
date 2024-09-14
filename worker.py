# from celery import Celery, Task

# class FlaskTask(Task):
#     def __call__(self, *args, **kwargs):
#         with self.app.app_context():
#             return self.run(*args, **kwargs)

# def celery_init_app(app):
#     celery_app = Celery(app.name, task_cls=FlaskTask)
#     celery_app.config_from_object("celeryconfig")
    
#     # Bind the Flask app to the FlaskTask
#     FlaskTask.app = app
#     return celery_app

# from celery import Celery, Task

# class FlaskTask(Task):
#     def __call__(self, *args, **kwargs):
#         if not hasattr(self, 'app'):
#             raise RuntimeError('Flask application context is not set.')
#         with self.app.app_context():
#             return self.run(*args, **kwargs)

# def celery_init_app(flask_app):
#     """Initialize the Celery app with Flask app context."""
#     celery_app = Celery(flask_app.import_name, task_cls=FlaskTask)
#     celery_app.config_from_object('celeryconfig')

#     # Attach the Flask app to the FlaskTask class
#     FlaskTask.app = flask_app
    
#     return celery_app


from celery import Celery, Task

def celery_init_app(app):
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object("celeryconfig")
    return celery_app