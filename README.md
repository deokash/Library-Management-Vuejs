# Library Management System using Vue.js and Flask 📚

## Frameworks used:
-  SQLite for database
- Flask for API
- VueJS for UI
- Bootstrap for HTML generation and styling
- Redis and Celery for batch jobs

## Functionalities:
- Role-Based Access Control (RBAC) is implemented to manage user and admin permissions.
- Users can give feedbacks to books, search for books. authors based on book sections.
- Users can request books to read from the librarian.
- A user can request max 5 books at one time.
- Librarian can create/delete/edit book sections and books present in it.
- Librarian can grant/reject book requests. Also, can see all the registered users, feedbacks and has a dashboard for all the numbers with a button to download a csv file for current granted books and users.
- An automatic revoke for granted books with more than 7 days of access using Celery tasks.
