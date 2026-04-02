import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true } // Cuma buat yang BELUM login
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { authRequired: true } // Harus login
    },
    {
      path: '/users',
      name: 'user-management',
      component: () => import('../views/UserManagementView.vue'),
      meta: { authRequired: true, role: 'Admin' } // CUMA Admin
    }
  ]
})

// Logika Satpam (Navigation Guard)
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // 1. Kalau halaman butuh login tapi user belum login
  if (to.meta.authRequired && !auth.isAuthenticated) {
    return next('/login')
  }

  // 2. Kalau user sudah login tapi maksa buka halaman login
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next('/')
  }

  // 3. Cek batasan Role (Misal: Operator mau akses halaman Admin)
  if (to.meta.role && to.meta.role !== auth.role) {
    alert('Lu bukan Admin, jangan macem-macem!')
    return next('/')
  }

  next()
})

export default router