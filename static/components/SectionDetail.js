export default Vue.extend({
  data() {
    return {
      section: {},
      books: [],
      showAddBookForm: false,
      bookName: '',
      bookLink: '',
      bookContent: '',
      bookAuthor: '',
      flashMessage: '',
      isEditing: false,
      editingSection: {
        name: '',
        description: ''
      },
      isEditingBook: false,
      editingBook: {
        id: null,
        name: '',
        content: '',
        author: '',
        link: '',
      }
    };
  },
  methods: {
    toggleAddBookForm() {
      this.showAddBookForm = !this.showAddBookForm;
      if (!this.showAddBookForm) {
        this.resetBookForm();
      }
    },
    fetchSectionDetails(sectionId) {
      axios.get(`/api/sections/${sectionId}`)
        .then(response => {
          this.section = response.data;
          this.books = response.data.ebooks || []; 
          this.editingSection.name = this.section.name;
          this.editingSection.description = this.section.description;
        })
        .catch(error => {
          console.error('Error fetching section details:', error);
        });
    },
    startEditSection() {
      this.isEditing = true;
    },
    cancelEditSection() {
      this.isEditing = false;
      this.editingSection.name = this.section.name;
      this.editingSection.description = this.section.description;
    },
    saveSection() {
      axios.put(`/api/sections/${this.section.id}`, {
        name: this.editingSection.name,
        description: this.editingSection.description
      })
      .then(response => {
        this.flashMessage = 'Section updated!';
        this.clearFlashMessage();
        this.section = response.data;
        this.isEditing = false;
      })
      .catch(error => {
        console.error('Error updating section:', error);
      });
    },
    clearFlashMessage() {
      setTimeout(() => {
        this.flashMessage = '';
      }, 5000); // 5000 milliseconds = 5 seconds
    },
    deleteSection() {
      if (confirm('Are you sure you want to delete this section?')) {
        axios.delete(`/api/sections/${this.section.id}`)
          .then(response => {
            alert('Section deleted successfully');
            this.$router.push('/admin/dashboard');
          })
          .catch(error => {
            console.error('Error deleting section:', error);
          });
      }
    },
    addBook() {
      axios.post(`/api/sections/${this.section.id}/ebooks`, {
        name: this.bookName,
        content: this.bookContent,
        author: this.bookAuthor,
        link: this.bookLink,
      })
      .then(response => {
        this.flashMessage = 'Book added successfully!';
        this.clearFlashMessage();
        this.resetBookForm();
        this.showAddBookForm = false;
        this.fetchSectionDetails(this.section.id);  // Refresh book list
      })
      .catch(error => {
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
      });
    },
    startEditBook(book) {
      this.isEditingBook = true;
      this.editingBook = { ...book };
    },
    cancelEditBook() {
      this.isEditingBook = false;
      this.resetBookForm();
    },
    viewEbook(ebookId) {
      this.$router.push(`/admin/ebooks/${ebookId}/view`);
    },
    saveBook() {
      axios.put(`/api/ebooks/${this.editingBook.id}`, {
        name: this.editingBook.name,
        content: this.editingBook.content,
        author: this.editingBook.author,
        link: this.editingBook.link,
      })
      .then(response => {
        this.flashMessage = 'Book updated successfully';
        this.clearFlashMessage();
        this.fetchSectionDetails(this.section.id);  // Refresh book list
        this.isEditingBook = false;
        this.resetBookForm();
      })
      .catch(error => {
        console.error('Error updating book:', error);
      });
    },
    deleteBook(bookId) {
      if (confirm('Are you sure you want to delete this book?')) {
        axios.delete(`/api/ebooks/${bookId}`)
          .then(response => {
            alert('Book deleted successfully');
            this.fetchSectionDetails(this.section.id);  
          })
          .catch(error => {
            console.error('Error deleting book:', error);
          });
      }
    },
    resetBookForm() {
      this.bookName = '';
      this.bookContent = '';
      this.bookAuthor = '';
      this.bookLink='';
    }
  },
  created() {
    const sectionId = this.$route.params.sectionId;
    this.fetchSectionDetails(sectionId);
  },
  template: `
    <div class="section-detail">
    <div class="heading">
      <h1>{{ section.name }}</h1>
      <p>Date created: {{ section.date_created }}</p>
      <p v-if="section.modified_date">Modified Date & Time: {{ section.modified_date }}</p>
      <p>{{ section.description }}</p>
    </div>
        <!-- Add Book Form -->
      <div class="button-row">
        <button @click="toggleAddBookForm" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Add Book
        </button>
        <button @click="startEditSection" class="btn btn-secondary">
          <i class="bi bi-pencil-square"></i> Edit Section
        </button>
        <button @click="deleteSection" class="btn btn-danger">
          <i class="bi bi-trash"></i> Delete Section
        </button>
      </div>

      <div v-if="showAddBookForm && !isEditingBook" class="addbook">
        <h5>Add Book</h5>
        <form @submit.prevent="addBook">
          <div class="row">
            <!-- Left Column -->
            <div class="col-md-6">
              <div class="form-group">
                <label for="bookName">Book Name:</label>
                <input type="text" class="form-control" v-model="bookName" required>
              </div>
              <div class="form-group">
                <label for="bookAuthor">Author:</label>
                <input type="text" class="form-control" v-model="bookAuthor" required>
              </div>
              <div class="form-group">
                <label for="bookLink">Link for Book:</label>
                <input type="text" class="form-control" v-model="bookLink">
              </div>
            </div>

            <!-- Right Column -->
            <div class="col-md-6">
              <div class="form-group">
                <label for="bookContent">Book Content:</label>
                <textarea class="form-control preserve-line-breaks"  v-model="bookContent" rows="8" required></textarea>
              </div>
            </div>
          </div>

          <!-- Buttons Row -->
          
          <div class="row mt-3">
            <div class="col-12">
              <button type="submit" class="btn btn-success">Save Book</button>
              <button @click="toggleAddBookForm" type="button" class="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </form>
      </div>

      <!-- Edit Section Form -->
      <div v-if="isEditing" class="edit-section-form">
        <h6>Edit Section: {{ section.name }}</h6>
        <form @submit.prevent="saveSection">
          <div class="form-group">
            <label for="sectionName">Section Name:</label>
            <input type="text" v-model="editingSection.name" class="form-control" required>
          </div>
          <div class="form-group"> 
            <label for="sectionDescription">Description:</label>
            <textarea type="text" v-model="editingSection.description" class="form-control preserve-line-breaks"  rows="5" required></textarea>
          </div class="form-group">
          <button type="submit" class="btn btn-success">Save Changes</button>
          <button @click="cancelEditSection" class="btn btn-secondary">Cancel</button>
        </form>
      </div>
      
      <!-- Flash Message -->
      <p v-if="flashMessage" class="text-success">{{ flashMessage }}</p>

      <!-- Edit Book Form -->
      <div v-if="isEditingBook" class='edit-book-form'>
        <h6>Edit Book: {{ editingBook.name }}</h6>
        <form @submit.prevent="saveBook">
        <div class="row">
          <!-- Left Column -->
          <div class="col-md-6">
            <div class="form-group">
              <label for="bookName">Book Name:</label>
              <input type="text" class="form-control" v-model="editingBook.name"  required>
            </div>
            <div class="form-group">
              <label for="bookAuthor">Author:</label>
              <input type="text" class="form-control" v-model="editingBook.author" required>
            </div>
            <div class="form-group">
              <label for="bookLink">Link for Book:</label>
              <input type="text" class="form-control" v-model="editingBook.link">
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-md-6">
            <div class="form-group">
              <label for="bookContent">Book Content:</label>
              <textarea class="form-control preserve-line-breaks"  v-model="editingBook.content" rows="8" required></textarea>
            </div>
          </div>
        </div>

        <!-- Buttons Row -->
        <div class="row mt-3">
          <div class="col-12">
            <button type="submit" class="btn btn-success">Save Book</button>
            <button @click="cancelEditBook"  type="button" class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </form>
      </div>
      <!-- Books Table -->
      <div class="table-container mt-4">
        <table v-if="books.length" class="table table-striped table-bordered">
        <thead>
          <tr>
            <th>Book Name</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.name }}</td>
            <td>{{ book.author }}</td>
            <td class="d-flex justify-content-center align-items-center">
              <button @click="startEditBook(book)" class="btn btn-icon btn-secondary custom-margin"><i class="bi bi-pencil-square"></i> </button>
              <button  @click="viewEbook(book.id)"class="btn btn-icon btn-primary custom-margin"><i class="bi bi-book"></i> </button>
              <button @click="deleteBook(book.id)" class="btn btn-icon btn-danger custom-margin"><i class="bi bi-trash"></i> </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  `
});
