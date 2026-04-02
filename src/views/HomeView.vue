<script setup lang="ts">
import MapBase from '@/components/MapBase.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <main class="min-h-screen bg-zinc-50 p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="flex justify-between items-center bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
        <div>
          <h1 class="text-2xl font-bold text-zinc-900">Mining Dashboard</h1>
          <p class="text-sm text-zinc-500">
            Halo, <span class="font-semibold text-zinc-700">{{ auth.user?.name || 'User' }}</span>
            anda login sebagai <span class="px-2 py-0.5 bg-zinc-100 rounded text-xs">{{ auth.role }}</span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <router-link v-if="auth.role === 'Admin'" to="/users">
            <Button variant="outline" size="sm">Kelola User</Button>
          </router-link>

          <Button @click="handleLogout" variant="destructive" size="sm">
            Logout
          </Button>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
        <MapBase />
      </div>
    </div>
  </main>
</template>