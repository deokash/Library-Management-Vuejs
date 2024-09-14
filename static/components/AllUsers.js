export default {
    data() {
      return {
        searchQuery: '',
        users: [],  
        filteredUsers: [],
      };
    },
    methods: {
      filterUsers() {
        const query = this.searchQuery.toLowerCase();
        this.filteredUsers = this.users.filter(user => 
          user.username.toLowerCase().includes(query) || 
          user.name.toLowerCase().includes(query)
        );
      },
      async fetchUsers() {
        try {
          const response = await fetch('/admin/see-users');
          let data = await response.json();
          this.users = data.users.filter(user => user.id !== 1 && user.id !== 2);
          this.filteredUsers = this.users;
         
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    },
    mounted() {
      this.fetchUsers();
    },

    template:`
    <body class="admin-users-body">
        <div class="admin-users">
        <h1>Active Users <i class="bi bi-people-fill"></i></h1>
        <div class="search-bar">
        <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search by Username or Name..." 
            @input="filterUsers" 
        />
        </div>
        <table class= "table">
        <thead>
            <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Books Issued</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.books_issued }}</td>
            </tr>
        </tbody>
        </table>
    </div>
   </body> 
    `
  };