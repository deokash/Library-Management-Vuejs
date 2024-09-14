from flask import Blueprint, request, jsonify
from datetime import datetime
from flask_restful import Api, Resource, reqparse, fields, marshal_with
from flask_security import roles_required
from models import db, Section, Ebook, Issuance, Request

resources_bp = Blueprint('api', __name__, url_prefix='/api')
api = Api(resources_bp)

# Fields for serialization
section_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'date_created': fields.String(attribute=lambda x: x.date_created.strftime('%Y-%m-%d')),
    'modified_date': fields.String(attribute=lambda x: x.modified_date.strftime('%Y-%m-%d %H:%M:%S') if x.modified_date else None),
    'ebooks': fields.List(fields.Nested({
        'id': fields.Integer,
        'name': fields.String,
        'content': fields.String,
        'author': fields.String,
        'link': fields.String,
        'date_created': fields.String(attribute=lambda x: x.date_created.strftime('%Y-%m-%d %H:%M:%S')),
        'modified_date': fields.String(attribute=lambda x: x.modified_date.strftime('%Y-%m-%d %H:%M:%S') if x.modified_date else None),
    }))
}

ebook_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'content': fields.String,
    'author': fields.String,
    'link': fields.String,
    'date_created': fields.String(attribute=lambda x: x.date_created.strftime('%Y-%m-%d %H:%M:%S')),
    'modified_date': fields.String(attribute=lambda x: x.modified_date.strftime('%Y-%m-%d %H:%M:%S') if x.modified_date else None),
}

issuance_fields = {
    'id': fields.Integer,
    'ebook_id': fields.Integer,
    'user_id': fields.Integer,
    'date_issued': fields.String(attribute=lambda x: x.date_issued.strftime('%Y-%m-%d %H:%M:%S')),
    'return_date': fields.String(attribute=lambda x: x.return_date.strftime('%Y-%m-%d %H:%M:%S') if x.return_date else None),
}

# Parsers for POST and PUT requests
section_parser = reqparse.RequestParser()
section_parser.add_argument('name', type=str, required=True, help='Name cannot be blank')
section_parser.add_argument('description', type=str, required=True, help='Description cannot be blank')


ebook_parser = reqparse.RequestParser()
ebook_parser.add_argument('name', type=str, required=True, help='Name cannot be blank')
ebook_parser.add_argument('content', type=str, required=True, help='Content cannot be blank')
ebook_parser.add_argument('author', type=str, required=True, help='Author cannot be blank')
ebook_parser.add_argument('link', type=str, required=False)

issuance_parser = reqparse.RequestParser()
issuance_parser.add_argument('ebook_id', type=int, required=True, help='Ebook ID cannot be blank')
issuance_parser.add_argument('user_id', type=int, required=True, help='User ID cannot be blank')
issuance_parser.add_argument('return_date', type=str, required=False)

class SectionResource(Resource):
    @marshal_with(section_fields)
    def get(self):
        sections = Section.query.all()
        return sections, 200

    @roles_required('librarian')
    @marshal_with(section_fields)
    def post(self):
        args = section_parser.parse_args()
        new_section = Section(
            name=args['name'],
            description=args['description'],
            date_created=datetime.utcnow()
        )
        db.session.add(new_section)
        db.session.commit()
        return new_section, 201

class SectionResourceById(Resource):
    @marshal_with(section_fields)
    def get(self, id):
        section = Section.query.get(id)
        if not section:
            return {'error': 'Section not found'}, 404
        print("Section Data:", section)  
        return section, 200

    @marshal_with(section_fields)
    @roles_required('librarian')
    def put(self, id):
        args = section_parser.parse_args()
        section = Section.query.get(id)
        if not section:
            return {'error': 'Section not found'}, 404
        section.name = args['name']
        section.description = args['description']
        section.modified_date=datetime.utcnow()
        db.session.commit()
        return section, 200

    @roles_required('librarian')
    def delete(self, id):
        section = Section.query.get(id)
        if not section:
            return {'error': 'Section not found'}, 404
        db.session.delete(section)
        db.session.commit()
        return {'message': 'Section deleted successfully'}, 200

class EbookResource(Resource):
    @marshal_with(ebook_fields)
    def get(self):
        ebooks = Ebook.query.order_by(Ebook.id.desc()).all()
        return ebooks, 200

    @roles_required('librarian')
    @marshal_with(ebook_fields)
    def post(self):
        args = ebook_parser.parse_args() 
        new_ebook = Ebook(
            name=args['name'],
            content=args['content'],
            author=args['author'],
            section_id=args['section_id'],
            link = args['link'],
            date_created=datetime.utcnow(),
        )
        db.session.add(new_ebook)
        db.session.commit()
        return new_ebook, 201

class EbookResourceById(Resource):
    @marshal_with(ebook_fields)
    def get(self, id):
        ebook = Ebook.query.get(id)
        if not ebook:
            return {'error': 'E-book not found'}, 404
        return ebook, 200

    @marshal_with(ebook_fields)
    def put(self, id):
        args = ebook_parser.parse_args()
        ebook = Ebook.query.get(id)
        if not ebook:
            return {'error': 'E-book not found'}, 404

        ebook.name = args['name']
        ebook.content = args['content']
        ebook.author = args['author']
        ebook.link = args['link']
        ebook.modified_date=datetime.utcnow()

        db.session.commit()
        return ebook, 200

    @roles_required('librarian')
    def delete(self, id):
        ebook = Ebook.query.get(id)
        if ebook:
            requests = Request.query.filter_by(ebook_id=id).all()
            for request in requests:
                db.session.delete(request) 

            db.session.delete(ebook)
            db.session.commit()
            return {"message": "Ebook deleted successfully"}, 200
        return {"message": "Ebook not found"}, 404

class SectionEbooksResource(Resource):
    @marshal_with(ebook_fields)
    def get(self, section_id):
        section = Section.query.get(section_id)
        if not section:
            return {'error': 'Section not found'}, 404
        ebooks = section.ebooks.order_by(Ebook.id.desc()).all()
        return ebooks, 200

    @roles_required('librarian')
    @marshal_with(ebook_fields)
    def post(self, section_id):
        args = ebook_parser.parse_args()
        section = Section.query.get(section_id)
        if not section:
            return {'error': 'Section not found'}, 404
        
        new_ebook = Ebook(
            name=args['name'],
            content=args['content'],
            author=args['author'],
            section_id=section_id,
            link=args['link'],
            date_created=datetime.utcnow()
        )
        db.session.add(new_ebook)
        db.session.commit()
        return new_ebook, 201

# class IssuanceResource(Resource):
#     @marshal_with(issuance_fields)
#     def get(self):
#         issuances = Issuance.query.all()
#         return issuances, 200

#     @roles_required('librarian')
#     @marshal_with(ebook_fields)
#     def post(self, section_id):
#         args = ebook_parser.parse_args()
#         if not args.get('name') or not args.get('content') or not args.get('author'):
#             return {'error': 'Missing required fields'}, 400
#         section = Section.query.get(section_id)
#         if not section:
#             return {'error': 'Section not found'}, 404
#         new_ebook = Ebook(
#             name=args['name'],
#             content=args['content'],
#             author=args['author'],
#             sections_id=section_id,
#             date_created=datetime.utcnow()
#         )
#         db.session.add(new_ebook)
#         db.session.commit()
#         return new_ebook, 201



# class IssuanceResourceById(Resource):
#     @marshal_with(issuance_fields)
#     def put(self, id):
#         args = issuance_parser.parse_args()
#         issuance = Issuance.query.get(id)
#         if not issuance:
#             return {'error': 'Issuance not found'}, 404
#         issuance.return_date = datetime.strptime(args['return_date'], '%Y-%m-%d') if args['return_date'] else issuance.return_date
#         db.session.commit()
#         return issuance, 200

#     @roles_required('librarian')
#     def delete(self, id):
#         issuance = Issuance.query.get(id)
#         if not issuance:
#             return {'error': 'Issuance not found'}, 404
#         db.session.delete(issuance)
#         db.session.commit()
#         return {'message': 'Issuance deleted successfully'}, 200

api.add_resource(SectionResource, '/sections')
api.add_resource(SectionResourceById, '/sections/<int:id>')
api.add_resource(EbookResource, '/ebooks')
api.add_resource(EbookResourceById, '/ebooks/<int:id>')
api.add_resource(SectionEbooksResource, '/sections/<int:section_id>/ebooks')
