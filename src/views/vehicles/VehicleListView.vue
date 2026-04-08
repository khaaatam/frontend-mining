<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/toast/use-toast'
import Select from 'primevue/select'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import VehicleStatusBadge from '@/components/VehicleStatusBadge.vue'

const router = useRouter()
const auth = useAuthStore()
const { toast } = useToast()

const vehicles = ref<any[]>([])
const vehicleTypes = ref<any[]>([])
const loading = ref(true)

const filters = ref({
    status: null,
    vehicle_type_id: null,
    asset_number: ''
})

const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Idle', value: 'idle' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Breakdown', value: 'breakdown' },
    { label: 'Decommissioned', value: 'decommissioned' }
]

// Memeriksa apakah pengguna memiliki hak akses manajemen kendaraan (Admin atau Operator)
const canManage = computed(() => {
    const userRole = (auth.role || '').toLowerCase()
    return userRole === 'admin' || userRole === 'operator'
})

const isAdmin = computed(() => {
    const userRole = (auth.role || '').toLowerCase()
    return userRole === 'admin'
})

const deleteVehicle = async (id: number) => {
    if (!window.confirm('Yakin hapus aset ini?')) return

    try {
        await axios.delete(`http://127.0.0.1:8000/api/vehicles/${id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })

        // Hapus data secara lokal biar gak perlu fetch/refresh ulang (smooth UX)
        vehicles.value = vehicles.value.filter(v => v.id !== id)

        toast({ title: 'Berhasil', description: 'Aset kendaraan dihapus' })
    } catch (error) {
        toast({ title: 'Error', description: 'Gagal menghapus kendaraan', variant: 'destructive' })
    }
}

const fetchVehicleTypes = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/vehicle-types', {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        vehicleTypes.value = response.data.data.map((type: any) => ({
            label: type.name,
            value: type.id
        }))
    } catch (error) {
        console.error('Failed to fetch vehicle types', error)
    }
}

const fetchVehicles = async () => {
    loading.value = true
    try {
        const params: any = {
            include: 'vehicleType,currentOperator',
            sort: '-created_at',
            per_page: 100
        }

        if (filters.value.status) params['filter[status]'] = filters.value.status
        if (filters.value.vehicle_type_id) params['filter[vehicle_type_id]'] = filters.value.vehicle_type_id
        if (filters.value.asset_number) params['filter[asset_number]'] = filters.value.asset_number

        const response = await axios.get('http://127.0.0.1:8000/api/vehicles', {
            params,
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        vehicles.value = response.data.data
    } catch (error) {
        console.error('Failed to fetch vehicles', error)
    } finally {
        loading.value = false
    }
}

const updateStatus = async (vehicleId: number, newStatus: string) => {
    try {
        await axios.patch(`http://127.0.0.1:8000/api/vehicles/${vehicleId}/status`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${auth.token}` } }
        )

        const index = vehicles.value.findIndex(v => v.id === vehicleId)
        if (index !== -1) {
            vehicles.value[index].status = newStatus
        }

        toast({
            title: 'Berhasil',
            description: 'Status kendaraan berhasil diperbarui',
        })
    } catch (error) {
        console.error('Gagal mengupdate status', error)
        toast({
            title: 'Error',
            description: 'Gagal mengubah status kendaraan',
            variant: 'destructive'
        })
    }
}

const goToDetail = (event: any) => {
    router.push(`/vehicles/${event.data.id}`)
}

const goToAdd = () => {
    router.push('/vehicles/create')
}

watch(filters, () => {
    fetchVehicles()
}, { deep: true })

onMounted(() => {
    fetchVehicleTypes()
    fetchVehicles()
})
</script>

<template>
    <div class="p-6 bg-white rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Vehicle Management</h1>
            <Button v-if="canManage" label="Tambah Kendaraan" icon="pi pi-plus" @click="goToAdd"
                class="p-button-success" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cari Asset</label>
                <InputText v-model="filters.asset_number" placeholder="Contoh: VEH-123" class="w-full" />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value"
                    placeholder="Semua Status" class="w-full" showClear />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Kendaraan</label>
                <Select v-model="filters.vehicle_type_id" :options="vehicleTypes" optionLabel="label"
                    optionValue="value" placeholder="Semua Tipe" class="w-full" showClear />
            </div>
            <div class="flex items-end">
                <Button label="Refresh" icon="pi pi-refresh" @click="fetchVehicles" class="p-button-outlined w-full" />
            </div>
        </div>

        <DataTable :value="vehicles" :loading="loading" scrollable scrollHeight="500px"
            :virtualScrollerOptions="{ itemSize: 60 }" @row-click="goToDetail" class="p-datatable-sm" rowHover
            stripedRows>
            <template #empty>
                <div class="text-center p-4">Tidak ada data kendaraan ditemukan.</div>
            </template>

            <Column field="asset_number" header="Asset Number" style="min-width: 150px"></Column>

            <Column header="Tipe" style="min-width: 150px">
                <template #body="{ data }">
                    {{ data.vehicle_type?.name || '-' }}
                </template>
            </Column>

            <Column field="plate_number" header="Plat Nomor" style="min-width: 150px"></Column>

            <Column header="Operator" style="min-width: 150px">
                <template #body="{ data }">
                    {{ data.current_operator?.name || 'Belum di-assign' }}
                </template>
            </Column>

            <Column header="Status" style="min-width: 150px">
                <template #body="{ data }">
                    <div v-if="canManage" @click.stop>
                        <Select :modelValue="data.status" @update:modelValue="updateStatus(data.id, $event)"
                            :options="statusOptions" optionLabel="label" optionValue="value" class="ghost-select">
                            <template #value="slotProps">
                                <VehicleStatusBadge v-if="slotProps.value" :status="slotProps.value" is-dropdown />
                                <span v-else>Pilih Status</span>
                            </template>
                            <template #option="slotProps">
                                <VehicleStatusBadge :status="slotProps.option.value" />
                            </template>
                            <template #dropdownicon>
                                <span></span>
                            </template>
                        </Select>
                    </div>
                    <div v-else>
                        <VehicleStatusBadge :status="data.status" />
                    </div>
                </template>
            </Column>

            <Column header="Last Seen" style="min-width: 150px">
                <template #body="{ data }">
                    {{ data.last_seen_at ? new Date(data.last_seen_at).toLocaleString('id-ID') : '-' }}
                </template>
            </Column>

            <Column v-if="isAdmin" style="min-width: 100px">
                <template #header>
                    <div class="flex justify-center w-full font-semibold">
                        Aksi
                    </div>
                </template>

                <template #body="{ data }">
                    <div class="flex justify-center w-full">
                        <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text p-button-sm"
                            @click.stop="deleteVehicle(data.id)" title="Hapus Kendaraan" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
:deep(.p-datatable-tbody > tr) {
    cursor: pointer;
}

:deep(.ghost-select) {
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    height: auto !important;
}

:deep(.ghost-select .p-select-label) {
    padding: 0 !important;
    display: flex;
    align-items: center;
}

:deep(.ghost-select:not(.p-disabled):hover) {
    background: transparent !important;
}
</style>