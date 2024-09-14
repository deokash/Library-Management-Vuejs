export default {
  template: `
<div class="user-dashboard container mt-5 pt-25">
  <div class="text-center">
    <h1>Welcome to BookSouls Library</h1>
    <p class="lead">
      Explore a wide range of books, manage your requests, and discover new sections.  
      Enjoy your reading journey!
    </p>
  </div>

  <div class="row mt-5">
    <div class="col-lg-4 col-md-6 mb-4">
      <div class="card">
        <img src="/static/images/library-books.jpg" class="card-img-top" alt="Browse Books">
        <div class="card-body">
          <h5 class="card-title">Browse Books</h5>
          <p class="card-text">Explore our extensive collection of books and find your next read.</p>
          <a href="/user/books" class="btn btn-primary">
            <i class="bi bi-book"></i> Browse
          </a>
        </div>
      </div>
    </div>

    <div class="col-lg-4 col-md-6 mb-4">
      <div class="card">
        <img src="/static/images/manage-books.jpg" class="card-img-top" alt="Manage Requests">
        <div class="card-body">
          <h5 class="card-title">Manage Requests</h5>
          <p class="card-text">Check the status of your book requests and return books you've finished reading.</p>
          <a href="/user/mybooks" class="btn btn-secondary">
            <i class="bi bi-journal-check"></i> Manage
          </a>
        </div>
      </div>
    </div>

    <div class="col-lg-4 col-md-6 mb-4">
      <div class="card">
        <img src="/static/images/feedback.png" class="card-img-top" alt="Give Feedbacks">
        <div class="card-body">
          <h5 class="card-title">Give Feedbacks</h5>
          <p class="card-text">You can rate the ebooks and tell us how to improve our service.</p>
          <a href="/user/feedbacks" class="btn btn-info">
            <i class="bi bi-chat-left-text"></i> Rate us 
          </a>
        </div>
      </div>
    </div>
  </div>
  <!-- Welcome Message or Tips -->
  <div class="mt-5 p-4 bg-light rounded">
    <h4><i class="bi bi-lightbulb"></i> Did You Know?</h4>
    <p>
      You can request up to 5 books at a time and have 7 days to return them. 
      Make sure to explore new sections regularly, as we update our catalog frequently with new books and resources.
    </p>
  </div>
</div>
  `,
};