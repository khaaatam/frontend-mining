<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MapBase from '@/components/MapBase.vue'
import Button from 'primevue/button'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <main class="min-h-screen bg-zinc-50 p-4 sm:p-8 text-left">
    <div class="max-w-7xl mx-auto space-y-6">

      <header
        class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-zinc-200 shadow-sm gap-4">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold text-zinc-900 tracking-tight">Mining Dashboard</h1>
          <p class="text-sm text-zinc-500">
            Selamat datang kembali,
            <span class="font-semibold text-zinc-800">{{ auth.user?.name || 'Pengguna' }}</span>
            <span class="mx-2 text-zinc-300">|</span>
            <span class="px-2 py-0.5 bg-zinc-100 rounded text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              {{ auth.role }}
            </span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <router-link v-if="auth.isAdmin" to="/users">
            <Button label="Kelola User" icon="pi pi-users" severity="secondary" size="small" outlined />
          </router-link>

          <router-link to="/profile">
            <Button label="Edit Profil" icon="pi pi-user-edit" severity="secondary" size="small" outlined />
          </router-link>

          <div class="h-8 w-[1px] bg-zinc-200 mx-1 hidden md:block"></div>

          <Button label="Keluar" icon="pi pi-sign-out" severity="danger" size="small" @click="handleLogout" />
        </div>
      </header>

      <section class="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm min-h-[600px] relative overflow-hidden">
        <div
          class="absolute top-6 left-6 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-zinc-200 shadow-sm">
          <p class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Live Monitoring Area</p>
        </div>

        <MapBase />
      </section>

    </div>
  </main>
</template>

<style scoped>
:deep(.leaflet-container) {
  width: 100%;
  height: 600px;
  border-radius: 8px;
}
</style>