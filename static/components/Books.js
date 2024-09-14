export default {
  template: `
  <div class="library">
    <div class="container mt-4">
      <h2>Library Books</h2>
      <p>Welcome to the library! Here, you can browse books by section, request access, and find all the available ebooks.</p>
      
      <div class="filter-bar">
        <div class="filter-section mb-4">
          <label for="sectionFilter">Filter by Section:</label>
          <select v-model="selectedSection" @change="filterBooks" class="form-control filter-select">
            <option value="">All Sections</option>
            <option v-for="section in sections" :key="section.id" :value="section.id">{{ section.name }}</option>
          </select>
        </div>
        <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            @input="searchBooks"
            placeholder="Search by name or author"
            class="form-control search-input"
          />
        </div>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Author</th>
            <th>Section</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ebook in filteredBooks" :key="ebook.id">
            <td>{{ ebook.name }}</td>
            <td>{{ ebook.author }}</td>
            <td>{{ ebook.section_name }}</td>
            <td>
              <button v-if="ebook.requestStatus === 'none'" @click="requestEbook(ebook.id)" class="btn btn-info">Request</button>
              <button v-else-if="ebook.requestStatus === 'requested'" disabled class="btn btn-secondary">Requested</button>
              <button v-else-if="ebook.requestStatus === 'granted'" @click="viewEbook(ebook.id)" class="btn btn-success">View</button>
              <button v-else-if="ebook.requestStatus === 'rejected'" @click="requestEbook(ebook.id)" class="btn btn-info">Request Again</button>
              <button v-else-if="ebook.requestStatus === 'returned'" @click="requestEbook(ebook.id)" class="btn btn-info">Request Again</button>

            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="flashMessage" class="flash-message-overlay">
      <div class="flash-message-content">
        <span>{{ flashMessage }}</span>
        <button class="close-btn" @click="flashMessage = ''">&times;</button>
      </div>
    </div>
    </div>
  </div>
  `,
  data() {
    return {
      ebooks: [],
      sections: [],
      selectedSection: '',
      searchQuery: '',
      filteredBooks: [],
      flashMessage: '', // Add this for flash messages
    };
  },
  created() {
    this.fetchEbooks();
    this.fetchSections();
  },
  methods: {
    fetchEbooks() {
      fetch('/user/ebooks')
        .then(response => response.json())
        .then(data => {
          this.ebooks = data;
          this.filterBooks(); 
        });
    },
    fetchSections() {
      fetch('/api/sections')
        .then(response => response.json())
        .then(data => {
          this.sections = data;
        });
    },
    filterBooks() {
      this.filteredBooks = this.ebooks.filter(book => {
        const matchesSection = !this.selectedSection || book.section_id === this.selectedSection;
        const matchesSearch = this.searchQuery === '' || 
                              book.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              book.author.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesSection && matchesSearch;
      });
    },
    searchBooks() {
      this.filterBooks(); // Ensure the filterBooks method is applied
    },
    requestEbook(ebookId) {
      const requestCount = this.ebooks.filter(ebook => ebook.requestStatus === 'requested' || ebook.requestStatus === 'granted').length;
      
      if (requestCount >= 5) {
        this.flashMessage = 'Request limit reached';
        this.clearFlashMessage();
        return;
      }
      
      fetch(`/user/ebooks/${ebookId}/request`, {
        method: 'POST',
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.fetchEbooks(); 
          }
        });
    },
    viewEbook(ebookId) {
      this.$router.push(`/user/ebooks/${ebookId}/view`);
    },
    showFlashMessage() {
      // Automatically hide the flash message after 4 seconds
      setTimeout(() => {
        this.flashMessage = '';
      }, 4000);
    },
  },
};
