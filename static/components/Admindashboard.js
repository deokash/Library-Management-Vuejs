export default {
  template: `
    <div class="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <!-- Search Bar -->
      <div class="search-bar ml-2">
        <input
          type="text"
          class="form-control search-input"
          v-model="searchQuery"
          @input="searchSections"
          placeholder="Search sections or description.. "
          />
      </div>
      
      <!-- Add Section Button -->
      <button @click="toggleAddSectionForm" id=addsection class="btn btn-primary">
        <i class="bi bi-plus-circle"></i> Add Sections 
      </button>
      
      <!-- Add Section Form -->
      <div v-if="showAddSectionForm"  class="add-section-form">
        <form @submit.prevent="addSection">
          <div class="form-group">
            <label for="sectionName">Section Name</label>
            <input type="text" class="form-control" id="sectionName" v-model="newSectionName" placeholder="Enter section name" required />
          </div>
          <div class="form-group">
            <label for="sectionDescription">Description</label>
            <textarea class="form-control" rows="4" id="sectionDescription" v-model="newSectionDescription" placeholder="Enter section description" required></textarea>
          </div>
          <button type="submit" class="btn btn-success">Save Section</button>
          <button @click="toggleAddSectionForm" type="button" class="btn btn-secondary">Cancel</button>
        </form>
      </div>
      
      <!-- Flash Message -->
      <p v-if="flashMessage" class="text-success">{{ flashMessage }}</p>
      
      <!-- Section Boxes -->
      <div v-if="sections.length" class="section-boxes" >
        <div class="section-box" v-for="section in sections" :key="section.id" >
          <h4>{{ section.name }}</h4>
          <p class="date-created">{{ new Date(section.date_created).toLocaleDateString() }}</p>
          <p>{{ section.description }}</p>
          <button @click="viewSection(section.id)" class="btn btn-secondary">View Section</button>
        </div>
      </div>
      <p v-if="!sections.length && !searching">No sections found.</p>
    </div>
  `,
  data() {
    return {
      searchQuery: '',
      sections: [],
      newSectionName: '',
      newSectionDescription: '',
      flashMessage: '',
      showAddSectionForm: false,
      searching: false,
    };
  },
  methods: {
    // Toggle Add Section Form
    toggleAddSectionForm() {
      this.showAddSectionForm = !this.showAddSectionForm;
      if (!this.showAddSectionForm) {
        this.newSectionName = '';
        this.newSectionDescription = '';
      }
    },
    
    // Search Sections
    searchSections() {
      if (this.searchQuery.trim() === '') {
        // If search query is empty, fetch all sections
        this.fetchSections();
      } else {
        // Filter sections locally based on the search query
        this.sections = this.sections.filter(section =>
          section.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          section.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    },
    fetchSections() {
    axios.get('/api/sections', {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }
    })
    .then(response => {
      this.sections = response.data;
    })
    .catch(error => {
      console.error('Error fetching sections:', error);
      this.flashMessage = 'An error occurred while fetching sections';
      this.clearFlashMessage();
    });
  },
    // Add Section
    addSection() {
      axios.post('/api/sections', {
        name: this.newSectionName,
        description: this.newSectionDescription
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
      })
      .then(response => {
        this.flashMessage = 'Section added successfully!';
        this.newSectionName = '';
        this.newSectionDescription = '';
        this.showAddSectionForm = false;
        this.searchSections();  // Refresh section list after adding
        this.clearFlashMessage(); // Clear flash message after a delay
      })
      .catch(error => {
        console.error('Error adding section:', error);
        this.flashMessage = error.response?.data?.message || 'An error occurred';
        this.clearFlashMessage(); // Ensure flash message clears if error
      });
    },
    viewSection(sectionId) {
      this.$router.push(`/admin/section/${sectionId}`);
    },  
    // Clear Flash Message after a delay
    clearFlashMessage() {
      setTimeout(() => {
        this.flashMessage = '';
      }, 5000); // 5000 milliseconds = 5 seconds
    }
  },
  created() {
    this.searchSections();  // Fetch sections on component creation
  }
};
