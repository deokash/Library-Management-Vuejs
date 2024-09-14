export default Vue.extend({
    data() {
      return {
        feedbacks: [],
      };
    },
    methods: {
      fetchFeedbacks() {
        axios.get('/admin/feedbacks')
          .then(response => {
            this.feedbacks = response.data;
          })
          .catch(error => {
            console.error('Error fetching feedbacks:', error);
          });
      },
    },
    created() {
      this.fetchFeedbacks();
    },
    template: `
      <div class="admin-feedback">
        <h1>All Feedbacks</h1>
        <div class="feedback-list mt-4">
          <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-item card p-3 mb-3">
            <h5>{{ feedback.ebook_name }}</h5>
            <p><strong>User:</strong> {{ feedback.user_name }}</p>
            <div class="rating">
              <span v-for="star in 5" :class="{ 'text-warning': star <= feedback.rating }">&#9733;</span>
            </div>
            <p>{{ feedback.comment }}</p>
            <p><small><strong>Submitted on:</strong> {{ new Date(feedback.created_at).toLocaleString() }}</small></p>
          </div>
        </div>
      </div>
    `,
  });
  