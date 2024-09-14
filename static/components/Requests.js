
export default Vue.extend({
  data() {
    return {
      requests: [],
      selectedRequest: null,
      showDetails: false,
      filterStatus: 'requested', 
      filteredRequests: [],
    };
  },
  methods: {
    formatContent(content) {
        return content.replace(/\n/g, '<br>'); // Replaces \n with <br>
      },
    fetchRequests() {
      axios.get(`/admin/see-requests?status=${this.filterStatus}`)
        .then(response => {
          this.requests = response.data;
          this.applyFilter();
        })
        .catch(error => {
          console.error('Error fetching requests:', error);
        });
    },
    grantRequest(requestId, event) {
      event.stopPropagation();
      axios.post(`/admin/requests/${requestId}/grant`)
        .then(() => {
          this.updateRequestStatus(requestId, 'granted');
        })
        .catch(error => {
          console.error('Error granting request:', error);
        });
    },
    rejectRequest(requestId, event) {
      event.stopPropagation();
      axios.post(`/admin/requests/${requestId}/reject`)
        .then(() => {
          this.updateRequestStatus(requestId, 'rejected');
        })
        .catch(error => {
          console.error('Error rejecting request:', error);
        });
    },
    updateRequestStatus(requestId, status) {
      const index = this.requests.findIndex(req => req.id === requestId);
      if (index !== -1) {
        this.$set(this.requests, index, { ...this.requests[index], status });
        if (status === 'granted' || status==='rejected') {
          setTimeout(() => {
            this.requests.splice(index, 1);
            this.applyFilter(); 
          }, 5000);
        }
      }
    },
    viewDetails(request) {
      this.selectedRequest = request;
      this.showDetails = true;
    },
    closeDetails() {
      this.showDetails = false;
    },
    applyFilter() {
      if (this.filterStatus === 'granted') {
        this.filteredRequests = this.requests.map(request => ({
          ...request,
          date_issued: this.requests.find(req => req.id === request.id).date_issued,
        }));
      } else if (this.filterStatus === 'rejected') {
        this.filteredRequests = this.requests.map(request => ({
          ...request,
          date_requested: this.requests.find(req => req.id === request.id).request_date,
        }));
      } else {
        this.filteredRequests = this.requests;
      }
    },
    changeFilter(status) {
      this.filterStatus = status;
      this.fetchRequests();
    }
  },
  created() {
    this.fetchRequests();
  },
  template: `
    <div class="requests">
      <div class="container mt-4">
        <h1>Requests</h1>
        <p>Select the buttons based on the type of requests to display.</p>
        <div class="filter-bar">
          <button @click="changeFilter('requested')">Requested</button>
          <button @click="changeFilter('granted')">Granted</button>
          <button @click="changeFilter('rejected')">Rejected</button>
        </div>
        <table v-if="filteredRequests.length" class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Section</th>
              <th>User</th>
              <th v-if="filterStatus === 'granted'">Date Issued</th>
              <th v-if="filterStatus === 'rejected'">Date Requested</th>
              <th v-if="filterStatus === 'requested'">Ageing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in filteredRequests" :key="request.id" @click="viewDetails(request)">
              <td>{{ request.book_name }}</td>
              <td>{{ request.section_name }}</td>
              <td>{{ request.user_name }}</td>
              <td v-if="filterStatus === 'granted'">{{ request.date_issued }}</td>
              <td v-if="filterStatus === 'rejected'">{{ request.date_request}}</td>
              <td v-if="filterStatus === 'requested'">{{ request.days_requested }} days</td>

              <td>
                <button
                  v-if="request.status === 'requested'"
                  class="btn btn-success"
                  @click.stop="grantRequest(request.id, $event)"
                >
                  Grant
                </button>
                <button
                  v-if="request.status === 'requested'"
                  class="btn btn-danger"
                  @click.stop="rejectRequest(request.id, $event)"
                >
                  Reject
                </button>
                <button
                  v-if="request.status === 'granted'"
                  class="btn btn-success"
                  disabled
                >
                  Granted
                </button>
                <button
                  v-if="request.status === 'rejected'"
                  class="btn btn-danger"
                  disabled
                >
                  Rejected
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Modal for Request Details -->
        <div v-if="showDetails" class="modal">
          <div class="modal-content">
            <span @click="closeDetails" class="close">&times;</span>
            <h2>Request Details</h2>
            <p><strong>User:</strong> {{ selectedRequest.user_name }}</p>
            <p><strong>Book Name:</strong> {{ selectedRequest.book_name }}</p>
             <div class="ebook-content preserve-line-breaks">
              <p v-html="formatContent(selectedRequest.book_content)"></p> 
          </div>
          </div>
        </div>
      </div>
      <p v-if="filteredRequests.length === 0" class="no-requests-message">No current requests found.</p>
    </div>
  `
});
