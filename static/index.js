import Router from './router.js';
import { getNavbar } from './components/Navbar.js';

// Function to add navbar based on role and current path
function addNavbar(role, currentPath) {
  const existingNavbar = document.querySelector('.navbar');
  if (existingNavbar) {
    document.body.removeChild(existingNavbar);
  }
  document.body.appendChild(getNavbar(role, currentPath));
}

// Create a new Vue instance
new Vue({
  router: Router,
  el: '#app',
  created() {
    const role = sessionStorage.getItem('role');
    const token = sessionStorage.getItem('authToken');

    // If the user is logged in and on a dashboard route, add the navbar
    if (role && token && (this.$route.path.startsWith('/user') || this.$route.path.startsWith('/admin'))) {
      addNavbar(role, this.$route.path);
    }

    // Handle route changes
    this.$router.beforeEach((to, from, next) => {
      const storedRole = sessionStorage.getItem('role'); 
      if (to.path.startsWith('/user') || to.path.startsWith('/admin')) {
        if (storedRole && token) {
          addNavbar(storedRole, to.path);
        }
      } else {
        const existingNavbar = document.querySelector('.navbar');
        if (existingNavbar) {
          document.body.removeChild(existingNavbar);
        }
      }
      next();
    });
  },
  methods: {
    handleLogout() {
      fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          sessionStorage.removeItem('role');
          sessionStorage.removeItem('authToken');
          window.location.href = '/'; // Redirect to home page
        } else {
          console.error('Logout failed:', data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    },
  },
  template: '<router-view></router-view>',
});
