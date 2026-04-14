<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

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
    <div class="pb-12">
        <div class="flex items-center gap-4 mb-8">
            <router-link to="/dashboard" class="text-[#9e9d96] hover:text-[#1a1916] transition-colors">
                <i class="pi pi-arrow-left text-[14px]"></i>
            </router-link>
            <div>
                <h1 class="text-[20px] font-semibold tracking-tight text-[#1a1916]">Pengaturan Profil</h1>
                <p class="text-[12px] text-[#9e9d96] mt-[1px]">Kelola informasi akun dan keamanan kata sandi</p>
            </div>
        </div>

        <div class="bg-white border border-[#e5e7eb] rounded-[12px] p-8 shadow-sm">
            <form @submit.prevent="handleUpdate" class="space-y-6">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="flex flex-col gap-1.5">
                        <label for="name" class="text-[12px] font-medium text-[#6b6a64]">Nama Lengkap</label>
                        <input id="name" v-model="form.name" required
                            class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-[#d1d5db] rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label for="email" class="text-[12px] font-medium text-[#6b6a64]">Alamat Email</label>
                        <input id="email" v-model="form.email" required
                            class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-[#d1d5db] rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                    </div>
                </div>

                <div class="pt-4 border-t border-[#e5e7eb]">
                    <p class="text-[11px] text-[#9e9d96] mb-4 italic">* Kosongkan kata sandi jika tidak ingin
                        mengubahnya.</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="flex flex-col gap-1.5">
                            <label for="password" class="text-[12px] font-medium text-[#6b6a64]">Kata Sandi
                                Baru</label>
                            <input id="password" type="password" v-model="form.password" placeholder="********"
                                class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-[#d1d5db] rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                        </div>

                        <div class="flex flex-col gap-1.5">
                            <label for="confirm" class="text-[12px] font-medium text-[#6b6a64]">Konfirmasi Kata
                                Sandi</label>
                            <input id="confirm" type="password" v-model="form.password_confirmation"
                                placeholder="********"
                                class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-[#d1d5db] rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                        </div>
                    </div>
                </div>

                <div v-if="successMessage"
                    class="p-3 bg-[#eaf3de] border border-[#3b6d11]/20 text-[#3b6d11] text-[12px] rounded-md font-medium">
                    {{ successMessage }}
                </div>
                <div v-if="errorMessage"
                    class="p-3 bg-[#fcebeb] border border-[#a32d2d]/20 text-[#a32d2d] text-[12px] rounded-md font-medium">
                    {{ errorMessage }}
                </div>

                <div class="flex justify-end pt-2">
                    <button type="submit" :disabled="loading"
                        class="w-full sm:w-auto px-6 py-2 text-[13px] font-medium rounded-md bg-[#1a1916] text-white hover:bg-black transition-colors disabled:opacity-50">
                        {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
                    </button>
                </div>
            </form>
        </div>

    </div>
</template>