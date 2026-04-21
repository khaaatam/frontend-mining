import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import VehicleListView from '@/views/vehicles/VehicleListView.vue'
import DashboardView from '../views/DashboardView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { authRequired: true }
    },
    {
      path: '/users',
      name: 'user-management',
      component: () => import('../views/UserManagementView.vue'),
      meta: { authRequired: true, role: 'admin' }
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
    {
      path: '/gps-providers',
      name: 'gps-providers.index',
      component: () => import('@/views/gps/GpsProviderIndex.vue'),
      meta: { title: 'GPS Providers' }
    },
    {
      path: '/gps-providers/create',
      name: 'gps-providers.create',
      component: () => import('@/views/gps/GpsProviderForm.vue'),
      meta: { title: 'Add GPS Provider', authRequired: true }
    },
    {
      path: '/gps-providers/:id/edit',
      name: 'gps-providers.edit',
      component: () => import('@/views/gps/GpsProviderForm.vue'),
      meta: { title: 'Edit GPS Provider', authRequired: true }
    },
    {
      path: '/live-map',
      name: 'LiveMap',
      component: () => import('@/views/map/LiveMapView.vue'),
      meta: { authRequired: true, hideGlobalSidebar: true }
    }
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