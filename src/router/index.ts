import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import VehicleListView from '@/views/vehicles/VehicleListView.vue'


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
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { authRequired: true }
    },
    {
      path: '/vehicles',
      name: 'vehicles',
      component: VehicleListView,
      meta: {
        authRequired: true
      }
    },
    {
      path: '/vehicles/create',
      name: 'vehicle-create',
      component: () => import('@/views/vehicles/VehicleFormView.vue'),
      meta: { authRequired: true }
    },
    {
      path: '/vehicles/:id/edit',
      name: 'vehicle-edit',
      component: () => import('@/views/vehicles/VehicleFormView.vue'),
      meta: { authRequired: true }
    },
    {
      path: '/vehicles/:id',
      name: 'vehicle-detail',
      component: () => import('@/views/vehicles/VehicleDetailView.vue'),
      meta: { authRequired: true }
    },
  ]
})

// Logika Satpam (Navigation Guard)
router.beforeEach((to) => {
  const auth = useAuthStore()

  // 1. Kalau halaman butuh login tapi user belum login
  if (to.meta.authRequired && !auth.isAuthenticated) {
    return '/login' // Langsung return path-nya
  }

  // 2. Kalau user sudah login tapi maksa buka halaman login
  if (to.meta.role && to.meta.role !== auth.role) {
    alert('Maaf, Anda tidak memiliki hak akses untuk membuka halaman ini.')
    return '/'
  }
})

export default router