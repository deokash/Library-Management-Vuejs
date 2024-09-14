import Home from "./components/Home.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import UserDashboard from "./components/Dashboard.js";
import AdminDashboard from "./components/Admindashboard.js";
import Books from "./components/Books.js";
import Mybooks from "./components/Mybooks.js";
import Adminstats from "./components/Adminstats.js";
import SectionDetail from "./components/SectionDetail.js";
import Requests from "./components/Requests.js";
import Ebookview from "./components/Ebookview.js";
import Ebookadminview from "./components/Ebookadminview.js";
import Feedback from "./components/Feedback.js";
import Feedbackadmin from "./components/Feedbackadmin.js";
import Allusers from "./components/AllUsers.js";
import Profile from "./components/UpdateProfile.js";

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/login', name: 'login', component: Login },
    {path: '/register', component: Register},
    { path: '/user/dashboard', name: 'user-dashboard', component: UserDashboard, meta: { requiresAuth: true, roles: ['user'] }},
    { path: '/admin/dashboard', name: 'admin-dashboard', component: AdminDashboard, meta: { requiresAuth: true, roles: ['librarian'] }},
    { path: '/user/books', name: 'books', component: Books, meta: { requiresAuth: true, roles: ['user'] }},
    { path: '/user/mybooks', name: 'mybooks', component: Mybooks, meta: { requiresAuth: true, roles: ['user'] }},
    { path: '/user/feedbacks', name: 'feedback', component: Feedback, meta: { requiresAuth: true, roles: ['user'] }},
    { path: '/admin/feedbacks', name: 'feedbackadmin', component: Feedbackadmin, meta: { requiresAuth: true, roles: ['librarian'] }},
    {path: '/user/ebooks/:ebookId/view', name:'ebookview', component: Ebookview,meta: { requiresAuth: true }},
    {path: '/admin/ebooks/:ebookId/view', name:'ebookadminview', component: Ebookadminview,meta: { requiresAuth: true }},
    { path: '/admin/stats', name: 'admin-stats', component: Adminstats, meta: { requiresAuth: true, roles: ['librarian'] }},
    { path: '/admin/requests', name: 'requests', component: Requests, meta: { requiresAuth: true, roles: ['librarian'] }},
    { path: '/admin/allusers', name: 'allusers', component: Allusers, meta: { requiresAuth: true, roles: ['librarian'] }},
    {path: '/admin/section/:sectionId',component: SectionDetail, meta: { requiresAuth: true, roles: ['librarian'] }},
    {path: '/user/profile',name: 'profile', component: Profile, meta: { requiresAuth: true, roles: ['user'] }}

  ]

});
  
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!sessionStorage.getItem('role');
  const userRole = sessionStorage.getItem('role');
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login');
    } else if (to.matched.some(record => record.meta.roles && !record.meta.roles.includes(userRole))) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;