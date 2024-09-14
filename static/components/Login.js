
export default {
  template: `
    <div class="login">
      <h3>Hi, Please login! </h3>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email address</label>
          <input type="email" class="form-control" id="email" v-model="email" placeholder="Enter email" required>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" class="form-control" id="password" v-model="password" placeholder="Enter password" required>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
      <p v-if="error" class="text-danger">{{ error }}</p>
      <router-link to="/" class="btn btn-link btn-block mt-3">Back to Home</router-link>
 
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      error: null,
    };
  },
  methods: {
    handleLogin() {
      console.log('Login button clicked');
      fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      })
      .then(response => {
        console.log('Response received');
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.message || 'Network response was not ok');
          });
        }
        
        return response.json();
       })
      .then(data => {
        console.log('Data received:', data);
        if (data.success) {
          sessionStorage.setItem('authToken', data.token); 
          sessionStorage.setItem('role', data.role);
          if (data.role === 'librarian') {
            this.$router.push('/admin/dashboard');
          } else if (data.role === 'user') {
            this.$router.push('/user/dashboard');
          }
        } else {
          this.error = data.message || 'An error occurred';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        this.error = error.message;
      });
    }
  }
};
