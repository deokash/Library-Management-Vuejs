// static/js/components/Register.js

export default {
    template: `
      <div class="register">
        <h3>Register yourself <i class="bi bi-emoji-smile" ></i></h3>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" class="form-control" id="name" v-model="name" placeholder="Enter name" required>
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control" id="username" v-model="username" placeholder="Enter username" required>
          </div>
          <div class="form-group">
            <label for="email">Email address</label>
            <input type="email" class="form-control" id="email" v-model="email" placeholder="Enter email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control" id="password" v-model="password" placeholder="Enter password" required>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" placeholder="Confirm password" required>
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <router-link to="/" class="btn btn-link btn-block mt-3">Back to Home</router-link>
  
      </div>
    `,
    data() {
      return {
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        error: null,
      };
    },
    methods: {
      handleRegister() {
        if (this.password !== this.confirmPassword) {
          this.error = 'Passwords do not match';
          return;
        }
  
        fetch('/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.name,
            username: this.username,
            email: this.email,
            password: this.password
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            window.location.href = '/'; 
          } else {
            this.error = data.message || 'An error occurred';
          }
        });
      }
    }
  };
  