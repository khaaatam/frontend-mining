<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'

// daftar menu buat di sidebar sesuai mockup m04
const menuItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Vehicles', path: '/vehicles' },
  { name: 'GPS Providers', path: '/gps-providers' },
  { name: 'Live Map', path: '/live-map' },
  { name: 'History', path: '/history' },
  { name: 'Overlays', path: '/overlays' },
  { name: 'Reports', path: '/reports' },
  { name: 'Users', path: '/users' }
]
</script>

<template>
  <div class="flex min-h-screen text-[#1a1916] font-sans antialiased">

    <aside class="w-[240px] shrink-0 bg-[#f5f4f1] border-r border-black/10 py-6 flex flex-col">
      <div class="px-6 mb-8 text-[15px] font-semibold tracking-tight">
        Mining Tracking
      </div>

      <nav class="flex flex-col">
        <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path"
          class="group flex items-center gap-3 px-6 py-2.5 text-[13px] text-[#6b6a64] hover:text-[#1a1916] transition-all border-r-[3px] border-transparent"
          active-class="bg-[#e8e7e0] !text-[#1a1916] font-medium !border-[#1a1916]">
          <div
            class="w-1.5 h-1.5 rounded-full bg-black/20 group-hover:bg-[#1a1916]/40 group-[.router-link-active]:bg-[#1a1916]">
          </div>
          {{ item.name }}
        </RouterLink>
      </nav>
    </aside>

    <main class="flex-1 bg-white overflow-y-auto">
      <div class="p-8">
        <RouterView />
      </div>
    </main>

  </div>
</template>