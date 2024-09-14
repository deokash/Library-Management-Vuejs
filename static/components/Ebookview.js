export default {
    data() {
      return {
        ebook: null,
        loading: true,
        error: null
      };
    },
    async created() {
      const ebookId = this.$route.params.ebookId;
      try {
        const response = await fetch(`/user/ebooks/${ebookId}/view`);
        if (response.ok) {
          this.ebook = await response.json();
        } else {
          this.error = 'Ebook not found';
        }
      } catch (error) {
        this.error = 'Error fetching ebook details';
        console.error('Error fetching ebook:', error);
      } finally {
        this.loading = false;
      }
    },
    methods: {
      goBack() {
        this.$router.go(-1); 
      },
      formatContent(content) {
        return content.replace(/\n/g, '<br>'); // Replaces \n with <br>
      }
    },
    template: `
      <div class="ebook-view">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="ebook" class="ebook-details">
          <div class="header">
            <h1>{{ ebook.name }}</h1>
            <button @click="goBack" class="btn btn-link">Go back</button>
        </div>
          <h2>By {{ ebook.author }}</h2>
          <h3>Section: {{ ebook.section }}</h3>
          <p>Link: <a :href="ebook.link" class="btn btn-link" target="_blank">{{ ebook.link }}</a></p>
          <div class="ebook-content preserve-line-breaks">
            <p v-html="formatContent(ebook.content)"></p> 
          </div>
        </div>
      </div>
    `,
  };
  