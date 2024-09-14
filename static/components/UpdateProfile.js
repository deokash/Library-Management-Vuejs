export default {
    data() {
      return {
        userProfile: {
          username: '',
          name: '',
          email: '',
          password: ''
        },
        errorMessage: '',
        successMessage: ''
      };
    },
    methods: {
      fetchUserProfile() {
        axios.get('/user/profile-data')
          .then(response => {
            this.userProfile = response.data;
          })
          .catch(error => {
            console.error('Error fetching profile data:', error);
          });
      },
      updateUserProfile() {
        axios.put('/user/update-profile', this.userProfile)
          .then(response => {
            this.successMessage = 'Profile updated successfully!';
            this.errorMessage = '';
          })
          .catch(error => {
            if (error.response && error.response.data) {
              this.errorMessage = error.response.data.message;
            } else {
              this.errorMessage = 'An error occurred while updating the profile.';
            }
            this.successMessage = '';
          });
      }
    },
    created() {
      this.fetchUserProfile();
    },
    template: `
      <div class="profile-container">
        <h1>Edit Profile</h1>
        <form @submit.prevent="updateUserProfile" class="profile-form">
          <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="userProfile.username" required>
          </div>
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" v-model="userProfile.name" required>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="userProfile.email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="userProfile.password">
          </div>
          <button type="submit" class="btn-submit">Update Profile</button>
        </form>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>
    `
  };
  