<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { Toaster } from '@/components/ui/toast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

/* State untuk mengatur apakah sidebar terbuka atau tertutup (collapse) */
const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const isLoginPage = computed(() => {
  return route.path === '/login'
})

const isMenuActive = (path: string) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'operator', 'viewer'], icon: 'pi-home' },
  { name: 'Vehicles', path: '/vehicles', roles: ['admin', 'operator', 'viewer'], icon: 'pi-car' },
  { name: 'GPS Providers', path: '/gps-providers', roles: ['admin', 'operator', 'viewer'], icon: 'pi-map-marker' },
  { name: 'Live Map', path: '/live-map', roles: ['admin', 'operator', 'viewer'], icon: 'pi-map' },
  { name: 'History', path: '/history', roles: ['admin', 'operator', 'viewer'], icon: 'pi-history' },
  { name: 'Overlays', path: '/overlays', roles: ['admin', 'operator', 'viewer'], icon: 'pi-images' },
  { name: 'Reports', path: '/reports', roles: ['admin', 'operator', 'viewer'], icon: 'pi-chart-bar' },
  { name: 'Users', path: '/users', roles: ['admin'], icon: 'pi-users' }
]

const filteredMenuItems = computed(() => {
  const currentRole = (auth.role || 'viewer').toLowerCase()
  return menuItems.filter(item => item.roles.includes(currentRole))
})
</script>

<template>
  <div class="flex min-h-screen text-[#1a1916] font-sans antialiased bg-gray-50">

    <template v-if="!isLoginPage">
      <aside
        class="shrink-0 bg-[#f5f4f1] border-r border-black/10 py-6 flex flex-col transition-all duration-300 ease-in-out"
        :class="isSidebarOpen ? 'w-[240px]' : 'w-[80px]'">
        <div class="px-6 mb-8 flex items-center justify-between">
          <span v-show="isSidebarOpen"
            class="text-[15px] font-semibold tracking-tight whitespace-nowrap overflow-hidden transition-opacity duration-300">
            Mining Tracking
          </span>
          <button @click="toggleSidebar"
            class="p-1.5 rounded-md hover:bg-black/5 text-[#6b6a64] hover:text-[#1a1916] transition-colors focus:outline-none"
            :class="!isSidebarOpen ? 'mx-auto' : ''">
            <i class="pi pi-bars text-sm"></i>
          </button>
        </div>

        <nav class="flex flex-col">
          <RouterLink v-for="item in filteredMenuItems" :key="item.path" :to="item.path"
            class="group flex items-center gap-3 py-2.5 text-[13px] text-[#6b6a64] hover:text-[#1a1916] transition-all border-r-[3px] overflow-hidden"
            :class="[
              isMenuActive(item.path) ? 'bg-[#e8e7e0] !text-[#1a1916] font-medium border-[#1a1916]' : 'border-transparent',
              isSidebarOpen ? 'px-6' : 'px-0 justify-center'
            ]" :title="!isSidebarOpen ? item.name : ''">
            <i class="pi text-lg shrink-0" :class="item.icon"></i>

            <span class="whitespace-nowrap transition-opacity duration-200"
              :class="isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'">
              {{ item.name }}
            </span>
          </RouterLink>
        </nav>
      </aside>

      <main class="flex-1 overflow-y-auto bg-white transition-all duration-300">
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