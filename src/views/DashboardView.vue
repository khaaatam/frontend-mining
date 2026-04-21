<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MapBase from '@/components/MapBase.vue'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="max-w-[1000px] mx-auto pb-12">

    <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-[17px] font-semibold tracking-tight text-[#1a1916]">Dashboard</h1>
        <p class="text-[12px] text-[#9e9d96] mt-[1px]">
          selamat datang kembali,
          <span class="font-medium text-[#1a1916]">{{ auth.user?.name || 'pengguna' }}</span>
          <span class="mx-2 text-black/20">|</span>
          <span
            class="px-1.5 py-0.5 bg-[#f0efe9] rounded text-[10px] font-bold uppercase tracking-widest text-[#6b6a64]">
            {{ auth.role }}
          </span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <router-link to="/profile"
          class="inline-flex items-center gap-1.5 px-4 py-[7px] text-[13px] font-medium rounded-md border border-black/20 bg-white text-[#1a1916] hover:bg-[#f0efe9] transition-colors">
          <i class="pi pi-user-edit text-[11px]"></i> edit profil
        </router-link>

        <div class="h-6 w-[1px] bg-black/10 mx-1 hidden md:block"></div>

        <button @click="handleLogout"
          class="inline-flex items-center gap-1.5 px-4 py-[7px] text-[13px] font-medium rounded-md border border-[#a32d2d]/30 bg-[#fcebeb] text-[#a32d2d] hover:bg-[#f8d7d7] transition-colors cursor-pointer">
          <i class="pi pi-sign-out text-[11px]"></i> keluar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  width: 100%;
  height: 600px;
}
</style>