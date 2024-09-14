

export default {
  data() {
    return {
      ebooks: [], // List of available ebooks
      selectedEbook: null,
      rating: null, // No pre-filled rating
      comment: '',
      isEditing: false,
      editingFeedbackId: null, // ID of the feedback currently being edited
      feedbacks: [], // User's feedbacks
      showAddForm: false, // Show the form to add feedback
      showEditForm: false, // Show the form to edit feedback
    };
  },
  methods: {
    fetchEbooks() {
      axios.get('/api/ebooks')
        .then(response => {
          this.ebooks = response.data;
        })
        .catch(error => {
          console.error('Error fetching ebooks:', error);
        });
    },
    fetchUserFeedbacks() {
      axios.get('/user/see-feedbacks')
        .then(response => {
          this.feedbacks = response.data;
        })
        .catch(error => {
          console.error('Error fetching feedbacks:', error);
        });
    },
    submitFeedback() {
      if (this.rating === null || this.rating < 1 || this.rating > 5) {
        alert('Please select a valid rating between 1 and 5.');
        return;
      }
      if (this.selectedEbook === null) {
        alert('Please select a book.');
        return;
      }
      const feedbackData = {
        ebook_id: this.selectedEbook,
        rating: this.rating,
        comment: this.comment,
      };
      axios.post('/user/feedbacks', feedbackData)
        .then(() => {
          this.resetAddForm();
          this.fetchUserFeedbacks(); // Refresh feedback list after submission
        })
        .catch(error => {
          console.error('Error submitting feedback:', error);
        });
    },
    updateFeedback() {
      if (this.rating === null || this.rating < 1 || this.rating > 5) {
        alert('Please select a valid rating between 1 and 5.');
        return;
      }
      const feedbackData = {
        rating: this.rating,
        comment: this.comment,
      };
      axios.put(`/user/feedbacks/${this.editingFeedbackId}`, feedbackData)
        .then(() => {
          this.resetEditForm();
          this.fetchUserFeedbacks(); // Refresh feedback list after update
        })
        .catch(error => {
          console.error('Error updating feedback:', error);
        });
    },
    resetAddForm() {
      this.selectedEbook = null;
      this.rating = null;
      this.comment = '';
      this.showAddForm = false;
    },
    resetEditForm() {
      this.selectedEbook = null;
      this.rating = null;
      this.comment = '';
      this.editingFeedbackId = null;
      this.showEditForm = false;
    },
    handleAddForm() {
      this.resetEditForm();
      this.showAddForm = true;
    },
    handleEditForm(feedback) {
      this.selectedEbook = feedback.ebook_id;
      this.rating = feedback.rating;
      this.comment = feedback.comment;
      this.editingFeedbackId = feedback.id;
      this.showEditForm = true;
    },
    handleCancel() {
      this.resetAddForm();
      this.resetEditForm();
    },
  },
  created() {
    this.fetchEbooks();
    this.fetchUserFeedbacks();
  },
  computed: {
  reversedFeedbacks() {
    return this.feedbacks.slice().reverse();
  }
},
  template: `
    <div class="feedback">
      <h3>BooksSouls Feedbacks by you <i class="bi bi-chat-left-text-fill"></i></h3>
      <p>Do let us know how you liked our ebooks collection and what can we do to improve our service for you!</p>

      <button v-if="!showAddForm && !showEditForm" @click="handleAddForm" id="addreview" class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Add Review
      </button>

      <div v-if="showAddForm" class="feedback-form">
        <h3>Submit Your Feedback</h3>
        <form @submit.prevent="submitFeedback">
          <div class="form-group">
            <label for="ebook">Book Name</label>
            <select v-model="selectedEbook" class="form-control">
              <option value="" disabled>Select a book</option>
              <option v-for="ebook in ebooks" :value="ebook.id">{{ ebook.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="rating">Rating</label>
            <div class="rating">
              <span v-for="star in 5" 
                    :class="{ 'text-warning': star <= rating }" 
                    @click="rating = star">
                &#9733;
              </span>
            </div>
          </div>
          <div class="form-group">
            <label for="comment">Comment</label>
            <textarea v-model="comment" class="form-control" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-success">Submit</button>
          <button @click="handleCancel" class="btn btn-secondary">Cancel</button>
        </form>
      </div>

      <div v-if="showEditForm" class="feedback-form">
        <h3>Edit Your Feedback</h3>
        <form @submit.prevent="updateFeedback">
          <div class="form-group">
            <label for="ebook">Book Name</label>
            <select v-model="selectedEbook" class="form-control" disabled>
              <option :value="selectedEbook" disabled>{{ feedbacks.find(f => f.id === editingFeedbackId)?.ebook_name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="rating">Rating</label>
            <div class="rating">
              <span v-for="star in 5" 
                    :class="{ 'text-warning': star <= rating }" 
                    @click="rating = star">
                &#9733;
              </span>
            </div>
          </div>
          <div class="form-group">
            <label for="comment">Comment</label>
            <textarea v-model="comment" class="form-control" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-success">Save</button>
          <button @click="handleCancel" class="btn btn-secondary">Cancel</button>
        </form>
      </div>

      <div class="feedback-list mt-4">
        <div v-for="feedback in reversedFeedbacks" :key="feedback.id" class="feedback-item card p-3 mb-3">
          <div v-if="editingFeedbackId !== feedback.id">
            <h5>{{ feedback.ebook_name }}</h5>
            <div class="rating">
              <span v-for="star in 5" :class="{ 'text-warning': star <= feedback.rating }">&#9733;</span>
            </div>
            <p>{{ feedback.comment }}</p>
            <button @click="handleEditForm(feedback)" class="btn btn-link"><i class="bi bi-pencil-fill"></i> Edit</button>
          </div>
        </div>
        <p v-if="!reversedFeedbacks.length">No feedback found.</p>
      </div>

    </div>
  `,
};
