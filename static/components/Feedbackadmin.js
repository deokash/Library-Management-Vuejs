export default {
    data() {
      return {
        feedbacks: [],
        error: null
      };
    },
    async created() {
      await this.fetchFeedbacks();
    },
    methods: {
      async fetchFeedbacks() {
        try {
          const response = await fetch('/admin/see-feedbacks');
          if (response.ok) {
            this.feedbacks = await response.json();
          } else {
            console.error('Failed to fetch feedbacks');
          }
        } catch (error) {
          console.error('Error fetching feedbacks:', error);
        }
      }
    },
    template: `
        <div class="container mt-5">
        <div class="adminfeedback">
          <h3 class="mb-20 mt-20">Feedbacks from the users <i class="bi bi-chat-text-fill"></i></h3>
          <div v-if="feedbacks.length === 0" class="alert alert-info">No feedback available.</div>
          <table v-if="feedbacks.length > 0" class="table table-striped table-bordered">
              <thead class="thead-dark">
                  <tr>
                      <th scope="col">Book Name</th>
                      <th scope="col">Section</th>
                      <th scope="col">User Name</th>
                      <th scope="col">Rating</th>
                      <th scope="col">Comment</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="feedback in feedbacks" :key="feedback.id">
                      <td>{{ feedback.bookName }}</td>
                      <td>{{ feedback.section }}</td>
                      <td>{{ feedback.userName }}</td>
                      <td>
                          <span v-for="star in feedback.rating" class="text-warning">&#9733;</span>
                          <span v-for="star in 5 - feedback.rating" class="text-muted">&#9733;</span>
                      </td>
                      <td>{{ feedback.comment }}</td>
                  </tr>
              </tbody>
          </table>
      </div>
    </div>


    `
  };