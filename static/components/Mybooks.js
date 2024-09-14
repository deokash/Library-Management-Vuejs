export default {
  data() {
    return {
      currentRequests: [],
      completedRequests: [],
      userId: null, 
      flashMessage: '',
    };
  },
  methods: {
    fetchRequests() {
      this.userId = this.getUserId();
      axios.get('/user/allrequests-user', { params: { user_id: this.userId } })
        .then(response => {
          this.currentRequests = response.data.current_requests;
          this.completedRequests = response.data.completed_requests;
        })
        .catch(error => {
          console.error('Error fetching requests:', error);
        });
    },
    getUserId() {
      return localStorage.getItem('userId');
    },
    viewBook(bookId) {
      if (bookId) {
        this.$router.push(`/user/ebooks/${bookId}/view`);
      } else {
        console.error('Book ID is undefined');
      }
    },
    returnBook(requestId) {
      axios.post(`/user/requests/${requestId}/return`)
        .then(() => {
          const returnedRequest = this.currentRequests.find(req => req.id === requestId);
          this.currentRequests = this.currentRequests.filter(req => req.id !== requestId);
          this.completedRequests.push({
            ...returnedRequest,
            status: 'returned'
          });
          this.flashMessage = 'Book returned!';
          this.clearFlashMessage();
        })
        .catch(error => {
          console.error('Error returning book:', error);
        });
    },
    clearFlashMessage() {
      setTimeout(() => {
        this.flashMessage = '';
      }, 5000); 
    },
  },
  created() {
    this.fetchRequests();
  },
  template: `
    <div class="my-books">
      <div class="container mt-4">
        <h2>Requested Books</h2>
        <div>
          <p>All the books that you have currently requested and have been reading can be found here!</p>
          <p><b>NOTE:</b> Ebooks must be returned in 7 days from issued date.</p>
        </div>
        <p></p>
        
        <!-- Current Requests -->
        <h5 style="margin-top: 50px;">Current Requests</h5>
        <div class="table-container">
          <table v-if="currentRequests.length" class="table">
            <thead>
              <tr>
                <th>Book Name</th>
                <th>Author</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in currentRequests" :key="request.id">
                <td>{{ request.book_name }}</td>
                <td>{{ request.author }}</td>
                <td>{{ request.section }}</td>
                <td>
                  <button v-if="request.status === 'granted'" @click="viewBook(request.book_id)" class="btn btn-info">View</button>
                  <button v-if="request.status === 'granted'" @click="returnBook(request.id)" class="btn btn-primary">Return Book</button>
                  <button v-if="request.status === 'requested'" class="btn btn-secondary" disabled>Requested</button>
                
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else>No current requests found.</p> <!-- Handle empty current requests -->
        </div>
        <!-- Flash Message -->
        <p v-if="flashMessage" class="text-success">{{ flashMessage }}</p>

        <!-- Completed Requests -->
        <h5 style="margin-top: 40px;">Completed Requests</h5>
        <div class="table-container">
          <table v-if="completedRequests.length" class="table">
            <thead>
              <tr>
                <th>Book Name</th>
                <th>Author</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in completedRequests" :key="request.id">
                <td>{{ request.book_name }}</td>
                <td>{{ request.author }}</td>
                <td>{{ request.section }}</td>
                <td>{{ request.status }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>No completed requests found.</p> <!-- Handle empty completed requests -->
        </div>
      </div>
    </div>
  `
}
