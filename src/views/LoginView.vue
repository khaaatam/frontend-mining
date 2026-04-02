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
        // Kalau berhasil, lempar ke dashboard atau home
        router.push('/')
    } catch (err: any) {
        errorMessage.value = err.message || 'Login gagal, cek email/password lu.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <Card class="w-full max-w-md shadow-lg">
            <CardHeader class="space-y-1">
                <CardTitle class="text-2xl font-bold text-center text-zinc-900">Mining App</CardTitle>
                <CardDescription class="text-center text-zinc-500">
                    Masuk untuk melanjutkan ke dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div class="space-y-2">
                        <Label for="email">Email</Label>
                        <Input id="email" type="email" v-model="form.email" placeholder="admin@mining.test" required />
                    </div>
                    <div class="space-y-2">
                        <Label for="password">Password</Label>
                        <Input id="password" type="password" v-model="form.password" required />
                    </div>

                    <div v-if="errorMessage" class="text-sm text-red-500 font-medium italic">
                        * {{ errorMessage }}
                    </div>

                    <Button type="submit" class="w-full" :disabled="loading">
                        {{ loading ? 'Logging in...' : 'Login' }}
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
</template>