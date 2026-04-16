<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { Toaster } from '@/components/ui/toast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

/* Memeriksa apakah pengguna sedang berada di halaman login. */
const isLoginPage = computed(() => {
  return route.path === '/login'
})

const isMenuActive = (path: string) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

/* Konfigurasi menu beserta pembatasan akses hak guna (peran). */
const menuItems = [
  { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'operator', 'viewer'] },
  { name: 'Vehicles', path: '/vehicles', roles: ['admin', 'operator', 'viewer'] },
  { name: 'GPS Providers', path: '/gps-providers', roles: ['admin', 'operator', 'viewer'] },
  { name: 'Live Map', path: '/live-map', roles: ['admin', 'operator', 'viewer'] },
  { name: 'History', path: '/history', roles: ['admin', 'operator', 'viewer'] },
  { name: 'Overlays', path: '/overlays', roles: ['admin', 'operator', 'viewer'] },
  { name: 'Reports', path: '/reports', roles: ['admin', 'operator', 'viewer'] },
  { name: 'Users', path: '/users', roles: ['admin'] }
]

/* Memfilter menu yang akan ditampilkan berdasarkan peran dari pengguna yang sedang masuk. */
const filteredMenuItems = computed(() => {
  const currentRole = (auth.role || 'viewer').toLowerCase()
  return menuItems.filter(item => item.roles.includes(currentRole))
})
</script>

<template>
  <div class="flex min-h-screen text-[#1a1916] font-sans antialiased bg-gray-50">

    <template v-if="!isLoginPage">
      <aside class="w-[240px] shrink-0 bg-[#f5f4f1] border-r border-black/10 py-6 flex flex-col">
        <div class="px-6 mb-8 text-[15px] font-semibold tracking-tight">
          Mining Tracking
        </div>

        <nav class="flex flex-col">
          <RouterLink v-for="item in filteredMenuItems" :key="item.path" :to="item.path"
            class="group flex items-center gap-3 px-6 py-2.5 text-[13px] text-[#6b6a64] hover:text-[#1a1916] transition-all border-r-[3px]"
            :class="isMenuActive(item.path)
              ? 'bg-[#e8e7e0] !text-[#1a1916] font-medium border-[#1a1916]'
              : 'border-transparent'">
            <div class="w-1.5 h-1.5 rounded-full transition-colors"
              :class="isMenuActive(item.path) ? 'bg-[#1a1916]' : 'bg-black/20 group-hover:bg-[#1a1916]/40'">
            </div>
            {{ item.name }}
          </RouterLink>
        </nav>
      </aside>

      <main class="flex-1 overflow-y-auto bg-white">
        <div class="flex justify-center w-full min-h-full">
          <div class="w-full max-w-[1000px] p-8">
            <RouterView />
          </div>
        </div>
      </main>
    </template>

    <template v-else>
      <main class="flex-1 flex items-center justify-center w-full">
        <RouterView />
      </main>
    </template>

  </div>
  <Toaster />
</template>