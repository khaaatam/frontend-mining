<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/toast/use-toast'
import VehicleStatusBadge from '@/components/VehicleStatusBadge.vue'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { toast } = useToast()

const vehicle = ref<Record<string, any>>({})
const activities = ref<any[]>([])
const loading = ref(true)

// Memeriksa hak akses pengguna untuk fitur pembaruan data
const canManage = computed(() => {
    const userRole = (auth.role || '').toLowerCase()
    return userRole === 'admin' || userRole === 'operator'
})

// Memeriksa hak akses eksklusif administrator
const isAdmin = computed(() => {
    const userRole = (auth.role || '').toLowerCase()
    return userRole === 'admin'
})

// Menjalankan proses penghapusan data kendaraan
const deleteVehicle = async () => {
    if (!window.confirm('Yakin mau hapus kendaraan ini? Data yang sudah dihapus tidak dapat dikembalikan.')) return

    try {
        await axios.delete(`http://127.0.0.1:8000/api/vehicles/${route.params.id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })

        toast({
            title: 'Berhasil',
            description: 'Kendaraan berhasil dihapus',
        })

        router.push('/vehicles')
    } catch (error) {
        console.error('Gagal menghapus kendaraan', error)
        toast({
            title: 'Error',
            description: 'Gagal menghapus kendaraan',
            variant: 'destructive'
        })
    }
}

const fetchVehicleDetail = async () => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/vehicles/${route.params.id}?include=vehicleType,currentOperator,gpsProvider`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        vehicle.value = response.data.data
    } catch (error) {
        console.error('Gagal mengambil detail kendaraan', error)
    }
}

const fetchActivities = async () => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/vehicles/${route.params.id}/activities`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        activities.value = response.data.data
    } catch (error) {
        console.warn('Endpoint log aktivitas belum tersedia')
    }
}

onMounted(async () => {
    loading.value = true
    await fetchVehicleDetail()
    await fetchActivities()
    loading.value = false
})

const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric'
    })
}
</script>

<template>
    <div v-if="loading" class="flex justify-center items-center min-h-[50vh]">
        <span class="text-gray-500 font-medium">Memuat data...</span>
    </div>
    <div v-else class="max-w-6xl mx-auto p-6 space-y-6">
        <div class="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div>
                <div class="flex items-center gap-3 mb-1">
                    <h1 class="text-2xl font-bold text-gray-800">{{ vehicle.asset_number }}</h1>
                    <VehicleStatusBadge :status="vehicle.status" />
                </div>
                <p class="text-gray-500 text-lg">{{ vehicle.make }} {{ vehicle.model }}</p>
            </div>
            <div class="flex items-center gap-3">
                <Button variant="outline" @click="router.push('/vehicles')">Kembali</Button>
                <Button v-if="canManage" @click="router.push(`/vehicles/${vehicle.id}/edit`)">Edit Data</Button>
                <Button v-if="isAdmin" variant="destructive" @click="deleteVehicle">Hapus</Button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-6">
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 class="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Informasi Identitas</h2>
                    <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        <div>
                            <p class="text-gray-500 mb-1">Asset Number</p>
                            <p class="font-medium text-gray-900">{{ vehicle.asset_number }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Plat Nomor</p>
                            <p class="font-medium text-gray-900">{{ vehicle.plate_number || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Merek & Model</p>
                            <p class="font-medium text-gray-900">{{ vehicle.make }} {{ vehicle.model }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Tahun Pembuatan</p>
                            <p class="font-medium text-gray-900">{{ vehicle.year || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Tipe Kendaraan</p>
                            <p class="font-medium text-gray-900">{{ vehicle.vehicle_type?.name || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Tipe Kepemilikan</p>
                            <p class="font-medium text-gray-900 capitalize">{{ vehicle.ownership_type }}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-gray-500 mb-1">VIN / Nomor Rangka</p>
                            <p class="font-medium text-gray-900 font-mono">{{ vehicle.vin || '-' }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 class="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Operasional</h2>
                    <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        <div>
                            <p class="text-gray-500 mb-1">Operator Saat Ini</p>
                            <p class="font-medium text-gray-900">{{ vehicle.current_operator?.name || 'Belum di-assign'
                            }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Jam Operasional (Hours)</p>
                            <p class="font-medium text-gray-900">{{ vehicle.operating_hours || '0' }} Jam</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 class="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Kepatuhan & Dokumen</h2>
                    <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        <div>
                            <p class="text-gray-500 mb-1">Masa Berlaku STNK</p>
                            <p class="font-medium text-gray-900">{{ formatDate(vehicle.stnk_expiry) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Masa Berlaku KIR</p>
                            <p class="font-medium text-gray-900">{{ formatDate(vehicle.kir_expiry) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Masa Berlaku Asuransi</p>
                            <p class="font-medium text-gray-900">{{ formatDate(vehicle.insurance_expiry) }}</p>
                        </div>
                        <div></div>
                        <div>
                            <p class="text-gray-500 mb-1">Servis Terakhir</p>
                            <p class="font-medium text-gray-900">{{ formatDate(vehicle.last_service_date) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Jadwal Servis Berikutnya</p>
                            <p class="font-medium text-gray-900">{{ formatDate(vehicle.next_service_date) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 class="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">GPS Tracking</h2>
                    <div class="space-y-4 text-sm">
                        <div>
                            <p class="text-gray-500 mb-1">Device ID</p>
                            <p class="font-medium text-gray-900 font-mono">{{ vehicle.gps_device_id ||
                                'Tidak ada perangkat' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 mb-1">Terakhir Terlihat (Last Seen)</p>
                            <p class="font-medium text-gray-900">{{ vehicle.last_seen_at ? new
                                Date(vehicle.last_seen_at).toLocaleString('id-ID') : 'Belum pernah online' }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 class="text-lg font-semibold mb-4 border-b pb-2 text-gray-800">Activity Log</h2>
                    <div v-if="activities.length === 0" class="text-sm text-gray-500 text-center py-6">
                        Belum ada riwayat aktivitas.
                    </div>
                    <div v-else class="space-y-6">
                        <div v-for="log in activities" :key="log.id" class="border-l-2 border-indigo-200 pl-4 relative">
                            <div class="absolute w-2.5 h-2.5 bg-indigo-500 rounded-full -left-[6px] top-1"></div>
                            <p class="text-xs text-gray-400 mb-1">{{ new Date(log.created_at).toLocaleString('id-ID') }}
                            </p>
                            <p class="text-sm font-medium text-gray-800">{{ log.description }}</p>
                            <p class="text-xs text-gray-500 mt-1 capitalize">Oleh: {{ log.causer?.name || 'Sistem' }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>