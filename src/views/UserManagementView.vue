<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import Dialog from 'primevue/dialog'

const auth = useAuthStore()
const users = ref<any[]>([])
const loading = ref(false)
const displayModal = ref(false)
const submitted = ref(false)
const isEdit = ref(false)
const selectedUserId = ref<number | null>(null)

const userForm = ref({
    name: '',
    email: '',
    password: '',
    role: 'operator'
})

const roles = ref([
    { label: 'Admin', value: 'admin' },
    { label: 'Operator', value: 'operator' },
    { label: 'Viewer', value: 'viewer' }
])

const fetchUsers = async () => {
    loading.value = true
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/users', {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        users.value = response.data.data
    } catch (error) {
        console.error('Error fetching users:', error)
    } finally {
        loading.value = false
    }
}

const openNew = () => {
    userForm.value = { name: '', email: '', password: '', role: 'operator' }
    isEdit.value = false
    submitted.value = false
    displayModal.value = true
}

const editUser = (user: any) => {
    selectedUserId.value = user.id
    userForm.value = {
        name: user.name,
        email: user.email,
        password: '',
        role: user.roles?.[0]?.name || 'operator'
    }
    isEdit.value = true
    submitted.value = false
    displayModal.value = true
}

const saveUser = async () => {
    submitted.value = true

    const isFormValid = userForm.value.name && userForm.value.email && (isEdit.value || userForm.value.password);

    if (isFormValid) {
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };

            if (isEdit.value) {
                await axios.put(`http://127.0.0.1:8000/api/users/${selectedUserId.value}`, userForm.value, config);
            } else {
                await axios.post('http://127.0.0.1:8000/api/users', userForm.value, config);
            }

            displayModal.value = false
            fetchUsers()
        } catch (error) {
            console.error('Error saving user:', error)
        }
    }
}

const deleteUser = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
            fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }
}

onMounted(() => {
    fetchUsers()
})
</script>

<template>
    <div class="pb-12">

        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-[22px] font-semibold tracking-tight text-[#1a1916]">Manajemen User</h1>
                <p class="text-[13px] text-[#9e9d96] mt-1">Kelola hak akses dan informasi pengguna sistem</p>
            </div>
            <div class="flex items-center gap-2">
                <button @click="openNew"
                    class="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-lg bg-[#1a1916] text-white hover:bg-black transition-colors">
                    <i class="pi pi-plus text-[11px]"></i> Tambah User
                </button>
            </div>
        </div>

        <div class="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden shadow-sm">
            <div
                class="grid grid-cols-[1.5fr_1.5fr_1fr_100px] gap-4 px-6 py-3.5 bg-[#f9fafb] border-b border-[#e5e7eb] text-[10px] font-bold tracking-[0.05em] uppercase text-[#9e9d96]">
                <span>Nama Lengkap</span>
                <span>Email</span>
                <span>Role</span>
                <span class="text-right">Aksi</span>
            </div>

            <div v-if="loading" class="text-center p-12 text-[13px] text-[#6b6a64]">
                Memuat data pengguna...
            </div>

            <div v-else class="flex flex-col">
                <div v-for="user in users" :key="user.id"
                    class="grid grid-cols-[1.5fr_1.5fr_1fr_100px] gap-4 px-6 py-4 border-b border-[#e5e7eb] text-[13px] items-center hover:bg-[#f9fafb]/50 transition-colors last:border-b-0">
                    <span class="font-semibold text-[#1a1916]">{{ user.name }}</span>
                    <span class="text-[#6b6a64]">{{ user.email }}</span>
                    <div>
                        <span
                            class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#f0efe9] text-[#6b6a64]">
                            {{ user.roles?.[0]?.name || 'viewer' }}
                        </span>
                    </div>
                    <div class="flex justify-end gap-1">
                        <button @click="editUser(user)"
                            class="p-1.5 text-[#6b6a64] hover:text-[#1a1916] transition-colors rounded-md hover:bg-[#f0efe9]">
                            <i class="pi pi-pencil text-[13px]"></i>
                        </button>
                        <button @click="deleteUser(user.id)"
                            class="p-1.5 text-[#a32d2d] hover:text-red-700 transition-colors rounded-md hover:bg-red-50">
                            <i class="pi pi-trash text-[13px]"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <Dialog v-model:visible="displayModal" :header="isEdit ? 'Ubah Informasi Pengguna' : 'Tambah Pengguna Baru'"
            :modal="true" :style="{ width: '400px' }" class="p-fluid custom-dialog">
            <div class="flex flex-col gap-5 mt-4">
                <div class="flex flex-col gap-1.5">
                    <label class="text-[12px] font-medium text-[#6b6a64]">Nama Lengkap</label>
                    <input v-model="userForm.name" placeholder="Masukkan nama"
                        class="w-full px-3 py-2 text-[13px] border border-[#d1d5db] rounded-md outline-none focus:border-[#1a1916]" />
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-[12px] font-medium text-[#6b6a64]">Alamat Email</label>
                    <input v-model="userForm.email" type="email" placeholder="contoh@email.com"
                        class="w-full px-3 py-2 text-[13px] border border-[#d1d5db] rounded-md outline-none focus:border-[#1a1916]" />
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-[12px] font-medium text-[#6b6a64]">Role Pengguna</label>
                    <select v-model="userForm.role"
                        class="w-full px-3 py-2 text-[13px] border border-[#d1d5db] rounded-md outline-none focus:border-[#1a1916]">
                        <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
                    </select>
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-[12px] font-medium text-[#6b6a64]">Kata Sandi {{ isEdit ? '(Opsional)' : ''
                        }}</label>
                    <input v-model="userForm.password" type="password" placeholder="********"
                        class="w-full px-3 py-2 text-[13px] border border-[#d1d5db] rounded-md outline-none focus:border-[#1a1916]" />
                    <p v-if="isEdit" class="text-[11px] text-[#9e9d96] italic">Kosongkan jika tidak ingin mengubah
                        sandi.</p>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-2 justify-end mt-4">
                    <button @click="displayModal = false"
                        class="px-4 py-2 text-[12px] font-medium rounded-md border border-[#d1d5db] text-[#6b6a64] hover:bg-[#f9fafb]">Batal</button>
                    <button @click="saveUser"
                        class="px-4 py-2 text-[12px] font-medium rounded-md bg-[#1a1916] text-white hover:bg-black">Simpan</button>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
:deep(.p-dialog-header) {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    padding-top: 1.25rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}

:deep(.p-dialog-title) {
    font-size: 16px;
    font-weight: 600;
}

:deep(.p-dialog-content) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}

:deep(.p-dialog-footer) {
    padding-top: 0;
    padding-bottom: 1.25rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    border: none;
}
</style>