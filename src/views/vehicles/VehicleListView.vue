<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/toast/use-toast'
import Select from 'primevue/select'
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
    <div class="max-w-[1000px] mx-auto pb-12">

        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-[17px] font-semibold tracking-tight text-[#1a1916]">Vehicle Management</h1>
                <p class="text-[12px] text-[#9e9d96] mt-[1px]">Kelola data aset kendaraan tambang</p>
            </div>
            <button v-if="canManage" @click="goToAdd"
                class="inline-flex items-center gap-1.5 px-4 py-[7px] text-[13px] font-medium rounded-md bg-[#1a1916] text-white hover:bg-black transition-colors shrink-0">
                <i class="pi pi-plus text-[11px]"></i> <span class="hidden sm:inline">tambah kendaraan</span>
            </button>
        </div>

        <div class="bg-white border border-black/10 rounded-[16px] p-5 mb-5 shadow-sm">
            <div
                class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-4 pb-2 border-b border-black/10">
                filter pencarian
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div class="flex flex-col gap-1.5">
                    <label class="text-[12px] font-medium text-[#6b6a64]">Cari Asset</label>
                    <input type="text" v-model="filters.asset_number" placeholder="Contoh: VEH-123"
                        class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30" />
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-[12px] font-medium text-[#6b6a64]">Status</label>
                    <select v-model="filters.status"
                        class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]">
                        <option :value="null">Semua Status</option>
                        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}
                        </option>
                    </select>
                </div>
                <div class="flex flex-col gap-1.5">
                    <label class="text-[12px] font-medium text-[#6b6a64]">Tipe Kendaraan</label>
                    <select v-model="filters.vehicle_type_id"
                        class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]">
                        <option :value="null">Semua Tipe</option>
                        <option v-for="type in vehicleTypes" :key="type.value" :value="type.value">{{ type.label }}
                        </option>
                    </select>
                </div>
                <div class="flex flex-col gap-1.5">
                    <button @click="fetchVehicles"
                        class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-md border border-black/20 bg-white text-[#1a1916] hover:bg-[#f0efe9] transition-colors">
                        <i class="pi pi-refresh text-[11px]"></i> refresh data
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-white border border-black/10 rounded-[16px] shadow-sm">
            <div class="w-full overflow-x-auto rounded-[16px]">

                <div
                    class="min-w-[800px] grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1fr)_50px] gap-3 px-5 py-3 bg-[#f0efe9] border-b border-black/10 text-[11px] font-bold tracking-[0.05em] uppercase text-[#9e9d96]">
                    <span>Asset Number</span>
                    <span>Tipe</span>
                    <span>Plat Nomor</span>
                    <span>Operator</span>
                    <span>Status</span>
                    <span>Last Seen</span>
                    <span class="text-right" v-if="isAdmin">Aksi</span>
                    <span v-else></span>
                </div>

                <div v-if="loading" class="text-center p-8 text-[13px] text-[#6b6a64] min-w-[800px]">
                    Memuat data kendaraan...
                </div>

                <div v-else-if="!vehicles || vehicles.length === 0"
                    class="text-center p-8 text-[13px] text-[#6b6a64] min-w-[800px]">
                    Tidak ada data kendaraan ditemukan.
                </div>

                <div v-else class="flex flex-col min-w-[800px]">
                    <div v-for="v in vehicles" :key="v.id" @click="goToDetail({ data: v })"
                        class="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1fr)_50px] gap-3 px-5 py-3.5 border-b border-black/10 text-[13px] items-center hover:bg-[#f0efe9]/40 transition-colors last:border-b-0 cursor-pointer">
                        <span class="font-semibold text-[#1a1916] whitespace-nowrap">{{ v.asset_number }}</span>
                        <span class="text-[#6b6a64] whitespace-nowrap overflow-hidden text-ellipsis">{{
                            v.vehicle_type?.name || '-' }}</span>
                        <span class="font-mono text-[12px] text-[#6b6a64] whitespace-nowrap">{{ v.plate_number }}</span>
                        <span class="text-[#6b6a64] whitespace-nowrap overflow-hidden text-ellipsis">{{
                            v.current_operator?.name || 'Belum di-assign' }}</span>

                        <div class="min-w-0">
                            <div v-if="canManage" @click.stop>
                                <Select :modelValue="v.status" @update:modelValue="updateStatus(v.id, $event)"
                                    :options="statusOptions" optionLabel="label" optionValue="value"
                                    class="ghost-select">
                                    <template #value="slotProps">
                                        <VehicleStatusBadge v-if="slotProps.value" :status="slotProps.value"
                                            is-dropdown />
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
                                <VehicleStatusBadge :status="v.status" />
                            </div>
                        </div>

                        <span class="text-[#9e9d96] whitespace-nowrap text-[12px]">
                            {{ v.last_seen_at ? new Date(v.last_seen_at).toLocaleString('id-ID') : '-' }}
                        </span>

                        <div class="text-right">
                            <button v-if="isAdmin" @click.stop="deleteVehicle(v.id)" title="Hapus Kendaraan"
                                class="text-[#a32d2d] hover:text-red-700 p-1 rounded transition-colors">
                                <i class="pi pi-trash text-[13px]"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
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