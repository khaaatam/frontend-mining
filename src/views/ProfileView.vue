<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'

const auth = useAuthStore()
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    password: '',
    password_confirmation: ''
})

const handleUpdate = async () => {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    try {
        const response = await axios.post('http://127.0.0.1:8000/api/profile/update', form.value, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })

        // Update data di Pinia store dan LocalStorage
        auth.user = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))

        successMessage.value = 'Profil dan kata sandi berhasil diperbarui.'
        form.value.password = ''
        form.value.password_confirmation = ''
    } catch (err: any) {
        errorMessage.value = err.response?.data?.message || 'Gagal memperbarui profil.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-zinc-50 p-8">
        <div class="max-w-2xl mx-auto space-y-6">
            <div class="flex items-center gap-4">
                <router-link to="/">
                    <Button icon="pi pi-arrow-left" severity="secondary" rounded text />
                </router-link>
                <h1 class="text-2xl font-bold text-zinc-900">Pengaturan Profil</h1>
            </div>

            <div class="bg-white p-8 rounded-lg shadow-sm border border-zinc-200">
                <form @submit.prevent="handleUpdate" class="space-y-6">
                    <div class="flex flex-col gap-2 text-left">
                        <label for="name" class="font-semibold text-sm">Nama Lengkap</label>
                        <InputText id="name" v-model="form.name" required />
                    </div>

                    <div class="flex flex-col gap-2 text-left">
                        <label for="email" class="font-semibold text-sm">Alamat Email</label>
                        <InputText id="email" v-model="form.email" required />
                    </div>

                    <hr class="border-zinc-100" />
                    <p class="text-xs text-zinc-500 text-left italic">* Kosongkan kata sandi jika tidak ingin
                        mengubahnya.</p>

                    <div class="flex flex-col gap-2 text-left">
                        <label for="password" class="font-semibold text-sm">Kata Sandi Baru</label>
                        <InputText id="password" type="password" v-model="form.password" placeholder="********" />
                    </div>

                    <div class="flex flex-col gap-2 text-left">
                        <label for="confirm" class="font-semibold text-sm">Konfirmasi Kata Sandi Baru</label>
                        <InputText id="confirm" type="password" v-model="form.password_confirmation"
                            placeholder="********" />
                    </div>

                    <Message v-if="successMessage" severity="success">{{ successMessage }}</Message>
                    <Message v-if="errorMessage" severity="error">{{ errorMessage }}</Message>

                    <div class="flex justify-end pt-4">
                        <Button type="submit" label="Simpan Perubahan" :loading="loading" severity="success"
                            class="w-full sm:w-auto" />
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>