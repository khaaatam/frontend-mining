<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'

// daftar menu buat di sidebar sesuai mockup m04
const menuItems = [
  { name: 'Dashboard', path: '/dashboard' },
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
  <div class="flex min-h-screen bg-[#f5f4f1] text-[#1a1916] font-sans antialiased">

    <aside class="w-[220px] shrink-0 bg-[#f0efe9] border-r border-black/10 py-5 flex flex-col">
      <div class="px-5 pb-5 mb-3 text-[13px] font-bold tracking-tight border-b border-black/10">
        Mining Tracking
      </div>

      <nav class="flex flex-col">
        <RouterLink v-for="item in menuItems" :key="item.path" :to="item.path"
          class="group flex items-center gap-3 px-5 py-2 text-[13px] text-[#6b6a64] hover:text-[#1a1916] transition-all"
          active-class="bg-[#e8e7e0] !text-[#1a1916] font-semibold border-r-2 border-[#1a1916]">
          <div
            class="w-1.5 h-1.5 rounded-full bg-black/10 group-hover:bg-[#1a1916]/40 group-[.router-link-active]:bg-[#1a1916]">
          </div>
          {{ item.name }}
        </RouterLink>
      </nav>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <div class="p-8">
        <RouterView />
      </div>
    </main>

  </div>
</template>