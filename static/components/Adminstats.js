export default {
  name: 'Librarian_Stats',
  data() {
    return {
      activeUsers: 0,
      grantedRequests: 0,
      issuedEbooks: 0,
      revokedEbooks: 0,
      avgRating: 0,
      flashMessage: '',
      chartData: null,
      booksPerSection: [], 
      isWaiting: false,
    };
  },
  mounted() {
    this.fetchStats();
  },
  methods: {
    async downloadcsv() {
      this.isWaiting = true
      const res = await fetch('/admin/download-csv')
      const data = await res.json()
      if (res.ok) {
        const taskId = data['task-id']
        const intv = setInterval(async () => {
          const csv_res = await fetch(`/admin/get-csv/${taskId}`)
          if (csv_res.ok) {
            this.isWaiting = false
            this.flashMessage = 'Downloaded successfully!';
            clearInterval(intv)
            window.location.href = `/admin/get-csv/${taskId}`
          }
        }, 1000)
      }
    },
    clearFlashMessage() {
      setTimeout(() => {
        this.flashMessage = '';
      }, 5000); 
    },
    fetchStats() {
      axios.get('/admin/stats/active-users')
        .then(response => {
          this.activeUsers = response.data.count;
        })
        .catch(error => {
          console.error('Error fetching active users:', error);
        });

      axios.get('/admin/stats/granted-requests')
        .then(response => {
          this.grantedRequests = response.data.count;
        })
        .catch(error => {
          console.error('Error fetching granted requests:', error);
        });

      axios.get('/admin/stats/ebooks-issued')
        .then(response => {
          this.issuedEbooks = response.data.count;
        })
        .catch(error => {
          console.error('Error fetching issued e-books:', error);
        });

      axios.get('/admin/stats/revoked-ebooks')
        .then(response => {
          this.revokedEbooks = response.data.count;
        })
        .catch(error => {
          console.error('Error fetching revoked e-books:', error);
        });

      axios.get('/admin/stats/avg-rating')
        .then(response => {
          this.avgRating = response.data.avgRating;
        });
      axios.get('/admin/stats/granted-books-per-section')
        .then(response => {
          this.booksPerSection = response.data.sections;
          this.loadChartData();  // Ensure this is called after the data is set
        })
        .catch(error => {
          console.error('Error fetching granted books per section:', error);
        });
    },
    loadChartData() {
      if (!this.booksPerSection.length) {
        console.warn('No data available for chart.');
        return;
      }

      const labels = this.booksPerSection.map(section => section.name);
      const totalBooks = this.booksPerSection.map(section => section.totalBooks);
      const grantedBooks = this.booksPerSection.map(section => section.grantedBooks);
      console.log('Chart Data:', {
        labels,
        totalBooks,
        grantedBooks
      });

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Total Books',
            backgroundColor: '#42A5F5',
            data: totalBooks
          },
          {
            label: 'Granted Books',
            backgroundColor: '#66BB6A',
            data: grantedBooks
          }
        ]
      };

      this.renderChart();  // Call renderChart after chartData is set
    },
    renderChart() {
      const ctx = document.getElementById('myChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: this.chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
            },
            title: {
              display: true,
              text: 'Books Granted per Section'
            }
          }
        }
      });
    }
  },
  template: `
    <div class="statsdashboard">
      <h1>Library Dashboard <i class="bi bi-bar-chart"></i></h1>
      <button @click='downloadcsv' class="btn btn-primary">
      Download CSV </button><span v-if='isWaiting'> Waiting... </span>
      <p v-if="flashMessage" class="text-success">{{ flashMessage }}</p>
      <div class="stats-cards">
        <div class="card">
          <h3>Active Users</h3>
          <p>{{ activeUsers }}</p>
        </div>
        <div class="card">
          <h3>Granted Requests</h3>
          <p>{{ grantedRequests }}</p>
        </div>
        <div class="card">
          <h3>E-books Issued</h3>
          <p>{{ issuedEbooks }}</p>
        </div>
        <div class="card">
          <h3>Revoked E-books</h3>
          <p>{{ revokedEbooks }}</p>
        </div>
        <div class="card">
          <h3>Average Rating</h3>
          <p>{{ avgRating.toFixed(1)}}</p>
        </div>
      </div>
      <p></p>
      <canvas id="myChart" width="300" height="100"></canvas>
    </div>
  `
};
