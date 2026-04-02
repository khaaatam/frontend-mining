<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const auth = useAuthStore()
const users = ref([])
const loading = ref(false)

const fetchUsers = async () => {
    loading.value = true
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/users', {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        users.value = response.data.data
    } catch (error) {
        console.error('Gagal ambil data user:', error)
    } finally {
        loading.value = false
    }
}

const deleteUser = async (id: number) => {
    if (confirm('Yakin mau hapus user ini, blay?')) {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/users/${id}`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            })
            // Refresh data setelah hapus
            fetchUsers()
            alert('User berhasil dihapus!')
        } catch (error) {
            console.error('Gagal hapus user:', error)
            alert('Gagal hapus user, cek koneksi atau role lu.')
        }
    }
}

onMounted(() => {
    fetchUsers()
})
</script>

<template>
    <div class="min-h-screen bg-zinc-50 p-8">
        <div class="max-w-6xl mx-auto space-y-6">
            <div class="flex justify-between items-center bg-white p-6 rounded-lg border border-zinc-200 shadow-sm">
                <div>
                    <h1 class="text-2xl font-bold text-zinc-900">Manajemen User</h1>
                    <p class="text-sm text-zinc-500">Kelola akun admin, operator, dan viewer di sini.</p>
                </div>
                <router-link to="/">
                    <Button label="Kembali ke Dashboard" icon="pi pi-arrow-left"
                        class="p-button-outlined p-button-secondary" />
                </router-link>
            </div>

            <div class="bg-white shadow-sm rounded-lg border border-zinc-200 overflow-hidden p-4">
                <DataTable :value="users" :loading="loading" stripedRows responsiveLayout="scroll"
                    class="p-datatable-sm custom-table">
                    <Column field="name" header="Nama" sortable class="py-4"></Column>
                    <Column field="email" header="Email" sortable></Column>
                    <Column header="Role">
                        <template #body="slotProps">
                            <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                                :class="slotProps.data.roles?.[0]?.name === 'Admin' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'">
                                {{ slotProps.data.roles?.[0]?.name || 'no role' }}
                            </span>
                        </template>
                    </Column>
                    <Column header="Aksi">
                        <template #body="slotProps">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" severity="warn" text rounded size="small" />

                                <Button icon="pi pi-trash" severity="danger" text rounded size="small"
                                    @click="deleteUser(slotProps.data.id)" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Biar header tabel gak item banget kalau bentrok sama theme */
:deep(.p-datatable-thead > tr > th) {
    background-color: #f9fafb !important;
    color: #374151 !important;
    border-bottom: 1px solid #e5e7eb !important;
}
</style>