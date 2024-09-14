
function getNavbar(role, currentPath) {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
  
    const left = document.createElement('div');
    left.className = 'navbar-left';
    left.textContent = role === 'librarian' ? 'Librarian Dashboard' : 'User Dashboard';
    navbar.appendChild(left);
  
    const right = document.createElement('div');
    right.className = 'navbar-right';
  
    const routes = role === 'librarian' ? [
      { name: 'Home', path: '/admin/dashboard' },
      { name: 'Users', path: '/admin/allusers' },
      { name: 'Requests', path: '/admin/requests' },
      { name: 'Feedbacks', path: '/admin/feedbacks' },
      { name: 'Stats', path: '/admin/stats' },
      { name: 'Logout', path: '/logout' }
    ] : [
      { name: 'Home', path: '/user/dashboard' },
      { name: 'Profile', path: '/user/profile' },
      { name: 'My Books', path: '/user/mybooks' },
      { name: 'EBooks', path: '/user/books' },
      { name: 'Logout', path: '/logout' }
    ];
  
    routes.forEach(route => {
      const link = document.createElement('a');
      link.href = route.path;
      link.textContent = route.name;
      link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default anchor behavior
        if (route.name === 'Home' && window.location.pathname === route.path) {
          // Handle Home button click on the same page
          window.location.reload(); // Reload to reflect changes
        } else {
          // Navigate to the new route
          window.location.href = route.path;
        }
      });
      right.appendChild(link);
    });
  
    navbar.appendChild(right);
    return navbar;
  }
  
  export { getNavbar };
