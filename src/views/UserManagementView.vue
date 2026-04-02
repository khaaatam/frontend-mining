<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'

const auth = useAuthStore()
const users = ref([])
const loading = ref(false)
const displayModal = ref(false)
const submitted = ref(false)
const isEdit = ref(false)
const selectedUserId = ref<number | null>(null)

const userForm = ref({
    name: '',
    email: '',
    password: '', // Password opsional saat edit
    role: 'Operator'
})

const roles = ref([
    { label: 'Admin', value: 'Admin' },
    { label: 'Operator', value: 'Operator' },
    { label: 'Viewer', value: 'Viewer' }
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
    userForm.value = { name: '', email: '', password: '', role: 'Operator' }
    isEdit.value = false
    submitted.value = false
    displayModal.value = true
}

const editUser = (user: any) => {
    selectedUserId.value = user.id
    userForm.value = {
        name: user.name,
        email: user.email,
        password: '', // Kosongkan password saat edit kecuali ingin diubah
        role: user.roles?.[0]?.name || 'Operator'
    }
    isEdit.value = true
    submitted.value = false
    displayModal.value = true
}

const saveUser = async () => {
    submitted.value = true

    // Validasi dasar (password wajib hanya saat tambah user baru)
    const isFormValid = userForm.value.name && userForm.value.email && (isEdit.value || userForm.value.password);

    if (isFormValid) {
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };

            if (isEdit.value) {
                // Logika Update (PUT)
                await axios.put(`http://127.0.0.1:8000/api/users/${selectedUserId.value}`, userForm.value, config);
            } else {
                // Logika Create (POST)
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
    <div class="min-h-screen bg-zinc-50 p-4 sm:p-8">
        <div class="max-w-6xl mx-auto space-y-6">
            <div
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-lg shadow-sm border border-zinc-200 gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-zinc-900 text-left">Manajemen User</h1>
                    <p class="text-sm text-zinc-500 text-left">Kelola hak akses dan informasi pengguna sistem.</p>
                </div>
                <div class="flex gap-2">
                    <Button label="Tambah User" icon="pi pi-plus" severity="success" size="small" @click="openNew" />
                    <router-link to="/">
                        <Button label="Kembali" icon="pi pi-arrow-left" severity="secondary" size="small" outlined />
                    </router-link>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
                <DataTable :value="users" :loading="loading" stripedRows size="small" responsiveLayout="scroll">
                    <Column field="name" header="Nama Lengkap" sortable style="min-width: 12rem"></Column>
                    <Column field="email" header="Email" sortable style="min-width: 12rem"></Column>
                    <Column header="Role" style="min-width: 8rem">
                        <template #body="slotProps">
                            <span
                                class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                                {{ slotProps.data.roles?.[0]?.name || 'N/A' }}
                            </span>
                        </template>
                    </Column>
                    <Column header="Action" style="min-width: 8rem">
                        <template #body="slotProps">
                            <div class="flex items-center justify-start gap-1 -ml-2">
                                <Button icon="pi pi-pencil" severity="warn" text rounded
                                    @click="editUser(slotProps.data)" />
                                <Button icon="pi pi-trash" severity="danger" text rounded
                                    @click="deleteUser(slotProps.data.id)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Dialog v-model:visible="displayModal" :header="isEdit ? 'Ubah Informasi Pengguna' : 'Tambah Pengguna Baru'"
            :modal="true" :style="{ width: '450px' }" class="p-fluid">
            <div class="flex flex-col gap-4 mt-2">
                <div class="flex flex-col gap-2">
                    <label for="name" class="text-sm font-semibold text-left">Nama Lengkap</label>
                    <InputText id="name" v-model="userForm.name" :class="{ 'p-invalid': submitted && !userForm.name }"
                        placeholder="Masukkan nama" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="email" class="text-sm font-semibold text-left">Alamat Email</label>
                    <InputText id="email" v-model="userForm.email"
                        :class="{ 'p-invalid': submitted && !userForm.email }" placeholder="contoh@email.com" />
                </div>
                <div class="flex flex-col gap-2">
                    <label for="password" class="text-sm font-semibold text-left">Kata Sandi {{ isEdit ? '(Opsional)' :
                        ''
                    }}</label>
                    <InputText id="password" type="password" v-model="userForm.password"
                        :class="{ 'p-invalid': submitted && !isEdit && !userForm.password }" placeholder="********" />
                    <small v-if="isEdit" class="text-zinc-400">Kosongkan jika tidak ingin mengubah kata sandi.</small>
                </div>
                <div class="flex flex-col gap-2">
                    <label for="role" class="text-sm font-semibold text-left">Role Pengguna</label>
                    <Dropdown v-model="userForm.role" :options="roles" optionLabel="label" optionValue="value"
                        placeholder="Pilih Role" />
                </div>
            </div>
            <template #footer>
                <Button label="Batal" icon="pi pi-times" severity="secondary" text @click="displayModal = false" />
                <Button label="Simpan Perubahan" icon="pi pi-check" severity="success" @click="saveUser" />
            </template>
        </Dialog>
    </div>
</template>