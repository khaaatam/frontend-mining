<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
    email: '',
    password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
        await auth.login(form.value)
        /* Mengalihkan pengguna ke halaman dashboard jika proses autentikasi berhasil. */
        router.push('/dashboard')
    } catch (err: any) {
        errorMessage.value = err.message || 'Proses login gagal, silakan periksa kembali email dan kata sandi Anda.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="w-full px-4 flex justify-center">
        <Card class="w-full max-w-[480px] shadow-xl border-zinc-200">
            <CardHeader class="space-y-3 pt-8 pb-6">
                <CardTitle class="text-3xl font-bold text-center text-zinc-900 tracking-tight">Mining App</CardTitle>
                <CardDescription class="text-center text-zinc-500 text-base">
                    Masuk untuk melanjutkan ke dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent class="pb-8">
                <form @submit.prevent="handleLogin" class="space-y-6">
                    <div class="space-y-2.5">
                        <Label for="email" class="text-zinc-700 font-medium">Email</Label>
                        <Input id="email" type="email" v-model="form.email" placeholder="admin@mining.test"
                            class="h-11 text-base" required />
                    </div>
                    <div class="space-y-2.5">
                        <Label for="password" class="text-zinc-700 font-medium">Password</Label>
                        <Input id="password" type="password" v-model="form.password" class="h-11 text-base" required />
                    </div>

                    <div v-if="errorMessage"
                        class="text-sm text-red-500 font-medium italic p-3 bg-red-50 rounded-md border border-red-100">
                        ⚠ {{ errorMessage }}
                    </div>

                    <Button type="submit" class="w-full h-11 text-base font-semibold mt-2" :disabled="loading">
                        {{ loading ? 'Sedang memproses...' : 'Login' }}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
</template>