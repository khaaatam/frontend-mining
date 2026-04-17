<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { Toaster } from '@/components/ui/toast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const isMobile = ref(false)
const isSidebarOpen = ref(true)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

watch(() => route.path, () => {
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
})

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
  <div class="flex flex-col md:flex-row min-h-screen text-[#1a1916] font-sans antialiased bg-gray-50">

    <template v-if="!isLoginPage">

      <div
        class="md:hidden flex items-center justify-between bg-white border-b border-black/10 px-6 py-4 shrink-0 shadow-sm z-30">
        <span class="font-bold text-[16px] tracking-tight">Mining Tracking</span>
        <button @click="toggleSidebar" class="p-2 -mr-2 text-[#6b6a64] hover:text-[#1a1916] focus:outline-none">
          <i class="pi pi-bars text-xl"></i>
        </button>
      </div>

      <div v-if="isMobile && isSidebarOpen" @click="isSidebarOpen = false"
        class="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"></div>

      <aside
        class="fixed inset-y-0 left-0 z-50 shrink-0 bg-[#f5f4f1] border-r border-black/10 py-6 flex flex-col transition-all duration-300 ease-in-out md:relative md:translate-x-0"
        :class="[
          isSidebarOpen ? 'translate-x-0 w-[240px] shadow-2xl md:shadow-none' : '-translate-x-full md:w-[80px]'
        ]">
        <div class="px-6 mb-8 flex items-center justify-between">
          <span v-show="isSidebarOpen"
            class="text-[15px] font-semibold tracking-tight whitespace-nowrap overflow-hidden transition-opacity duration-300">
            Mining Tracking
          </span>
          <button v-if="!isMobile" @click="toggleSidebar"
            class="p-1.5 rounded-md hover:bg-black/5 text-[#6b6a64] hover:text-[#1a1916] transition-colors focus:outline-none"
            :class="!isSidebarOpen ? 'mx-auto' : ''">
            <i class="pi pi-bars text-sm"></i>
          </button>
          <button v-if="isMobile" @click="isSidebarOpen = false"
            class="p-1.5 rounded-md hover:bg-black/10 text-[#6b6a64] hover:text-[#1a1916] transition-colors focus:outline-none">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>

        <nav class="flex flex-col flex-1 overflow-y-auto">
          <RouterLink v-for="item in filteredMenuItems" :key="item.path" :to="item.path"
            class="group flex items-center gap-3 py-3 md:py-2.5 text-[14px] md:text-[13px] text-[#6b6a64] hover:text-[#1a1916] transition-all border-r-[3px] overflow-hidden"
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

      <main class="flex-1 overflow-y-auto bg-white transition-all duration-300 w-full relative">
        <div class="flex justify-center w-full min-h-full">
          <div class="w-full max-w-[1000px] p-4 md:p-8">
            <RouterView />
          </div>
        </div>
      </main>

    </template>

    <template v-else>
      <main class="flex-1 flex items-center justify-center w-full px-4 md:px-0">
        <RouterView />
      </main>
    </template>

  </div>
  <Toaster />
</template>
