<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/toast/use-toast'
import VehicleStatusBadge from '@/components/VehicleStatusBadge.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { toast } = useToast()

const vehicle = ref<Record<string, any>>({})
const activities = ref<any[]>([])
const providers = ref<any[]>([])
const loading = ref(true)
const isSubmitting = ref(false)
const activeTab = ref('info')

// pake reactive biar lebih aman dan stabil buat form v-model
const gpsForm = reactive({
    gps_provider_id: '',
    gps_device_id: ''
})

const canManage = computed(() => {
    const userRole = (auth.role || '').toLowerCase()
    return userRole === 'admin' || userRole === 'operator'
})

const isAdmin = computed(() => {
    const userRole = (auth.role || '').toLowerCase()
    return userRole === 'admin'
})

const deleteVehicle = async () => {
    if (!window.confirm('Yakin mau hapus kendaraan ini?')) return
    try {
        await axios.delete(`http://127.0.0.1:8000/api/vehicles/${route.params.id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        toast({ title: 'Berhasil', description: 'Kendaraan berhasil dihapus' })
        router.push('/vehicles')
    } catch (error) {
        toast({ title: 'Error', description: 'Gagal menghapus kendaraan', variant: 'destructive' })
    }
}

const fetchVehicleDetail = async () => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/vehicles/${route.params.id}?include=vehicleType,currentOperator,gpsProvider`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        vehicle.value = response.data.data || {}

        // set form dengan data yang ditarik, kalau kosong kasih string kosong biar gak undefined
        gpsForm.gps_provider_id = vehicle.value.gps_provider_id || ''
        gpsForm.gps_device_id = vehicle.value.gps_device_id || ''
    } catch (error) {
        console.error('Gagal mengambil detail kendaraan', error)
    }
}

const fetchActivities = async () => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/vehicles/${route.params.id}/activities`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        activities.value = response.data.data || []
    } catch (error) {
        console.warn('Endpoint log aktivitas belum tersedia')
    }
}

const fetchProviders = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/gps-providers', {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        providers.value = response.data || []
    } catch (error) {
        console.error('Gagal mengambil daftar provider', error)
    }
}

const submitAssignment = async () => {
    if (!gpsForm.gps_provider_id || !gpsForm.gps_device_id) {
        toast({ title: 'Error', description: 'Provider dan IMEI harus diisi blay', variant: 'destructive' })
        return
    }

    isSubmitting.value = true
    try {
        await axios.patch(`http://127.0.0.1:8000/api/vehicles/${route.params.id}/gps-link`, gpsForm, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        toast({ title: 'Berhasil', description: 'GPS berhasil dipasang' })

        // REFRESH SEMUA DATA
        await fetchVehicleDetail()
        await fetchProviders() // Biar total 'linked vehicles' di mana-mana ikut update
    } catch (error: any) {
        const msg = error.response?.data?.message || 'Gagal melakukan assignment'
        toast({ title: 'Error', description: msg, variant: 'destructive' })
    } finally {
        isSubmitting.value = false
    }
}

const unlinkDevice = async () => {
    if (!window.confirm('Yakin mau nyopot perangkat GPS?')) return

    isSubmitting.value = true
    try {
        await axios.patch(`http://127.0.0.1:8000/api/vehicles/${route.params.id}/gps-link`, {
            gps_provider_id: null,
            gps_device_id: null
        }, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        toast({ title: 'Berhasil', description: 'GPS dicopot blay' })

        // REFRESH SEMUA DATA
        await fetchVehicleDetail()
        await fetchProviders()
    } catch (error) {
        toast({ title: 'Error', description: 'Gagal mencopot GPS', variant: 'destructive' })
    } finally {
        isSubmitting.value = false
    }
}

onMounted(async () => {
    loading.value = true
    await fetchVehicleDetail()
    await fetchActivities()
    await fetchProviders()
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
        <span class="text-[#6b6a64] font-medium text-[13px]">Memuat data...</span>
    </div>

    <div v-else class="pb-6">
        <div class="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div>
                <h1 class="text-[22px] font-semibold tracking-tight text-[#1a1916]">
                    {{ vehicle.asset_number }} — {{ activeTab === 'gps' ? 'GPS assignment' : 'Vehicle detail' }}
                </h1>
                <p class="text-[13px] text-[#9e9d96] mt-[1px]">Vehicle detail · {{ activeTab }} tab</p>
            </div>

            <div class="flex items-center gap-2">
                <button @click="activeTab = 'info'"
                    :class="activeTab === 'info' ? 'border-[#1a1916] font-semibold text-[#1a1916]' : 'border-[#d1d5db] text-[#9e9d96]'"
                    class="px-3 py-1.5 text-[12px] rounded-md border transition-all">info</button>
                <button @click="activeTab = 'compliance'"
                    :class="activeTab === 'compliance' ? 'border-[#1a1916] font-semibold text-[#1a1916]' : 'border-[#d1d5db] text-[#9e9d96]'"
                    class="px-3 py-1.5 text-[12px] rounded-md border transition-all">compliance</button>
                <button @click="activeTab = 'gps'"
                    :class="activeTab === 'gps' ? 'border-[#1a1916] font-semibold text-[#1a1916]' : 'border-[#d1d5db] text-[#9e9d96]'"
                    class="px-3 py-1.5 text-[12px] rounded-md border transition-all uppercase">GPS</button>
            </div>
        </div>

        <div v-if="activeTab === 'info'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-4">
                <div class="bg-white border border-[#e5e7eb] rounded-[12px] p-5 shadow-sm">
                    <div
                        class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-4 pb-2 border-b border-[#e5e7eb]">
                        Informasi Identitas</div>
                    <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-[13px]">
                        <div class="flex flex-col"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Asset
                                Number</span><span class="font-medium text-[#1a1916]">{{ vehicle.asset_number }}</span>
                        </div>
                        <div class="flex flex-col"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Plat
                                Nomor</span><span class="font-medium text-[#1a1916] font-mono text-[12px]">{{
                                    vehicle.plate_number || '-' }}</span></div>
                        <div class="flex flex-col"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Merek
                                & Model</span><span class="font-medium text-[#1a1916]">{{ vehicle.make }} {{
                                    vehicle.model }}</span></div>
                        <div class="flex flex-col"><span
                                class="text-[11px] text-[#9e9d96] uppercase font-medium">Tahun</span><span
                                class="font-medium text-[#1a1916]">{{ vehicle.year || '-' }}</span></div>
                        <div class="flex flex-col"><span
                                class="text-[11px] text-[#9e9d96] uppercase font-medium">Tipe</span><span
                                class="font-medium text-[#1a1916]">{{ vehicle.vehicle_type?.name || '-' }}</span></div>
                        <div class="flex flex-col"><span
                                class="text-[11px] text-[#9e9d96] uppercase font-medium">Kepemilikan</span><span
                                class="font-medium text-[#1a1916] capitalize">{{ vehicle.ownership_type }}</span></div>
                        <div class="col-span-2 flex flex-col"><span
                                class="text-[11px] text-[#9e9d96] uppercase font-medium">VIN / Nomor Rangka</span><span
                                class="font-medium text-[#1a1916] font-mono text-[12px]">{{ vehicle.vin || '-' }}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white border border-[#e5e7eb] rounded-[12px] p-5 shadow-sm">
                    <div
                        class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-4 pb-2 border-b border-[#e5e7eb]">
                        Operasional</div>
                    <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-[13px]">
                        <div class="flex flex-col"><span
                                class="text-[11px] text-[#9e9d96] uppercase font-medium">Operator</span><span
                                class="font-medium text-[#1a1916]">
                                {{ vehicle.current_operator?.name || 'Belum di - assign' }}</span></div>
                        <div class="flex flex-col"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Op.
                                Hours</span><span class="font-medium text-[#1a1916]">{{ vehicle.operating_hours || '0'
                                }} h</span></div>
                    </div>
                </div>
            </div>

            <div class="bg-white border border-[#e5e7eb] rounded-[12px] p-5 shadow-sm">
                <div
                    class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-4 pb-2 border-b border-[#e5e7eb]">
                    Activity Log</div>
                <div v-if="activities.length === 0" class="text-[12px] text-[#9e9d96] text-center py-6">Belum ada
                    riwayat aktivitas.</div>
                <div v-else class="space-y-5">
                    <div v-for="log in activities" :key="log.id" class="border-l border-black/10 pl-4 relative">
                        <div class="absolute w-1.5 h-1.5 bg-black/20 rounded-full -left-[3.5px] top-1"></div>
                        <p class="text-[10px] text-[#9e9d96] mb-1 font-medium">{{ new
                            Date(log.created_at).toLocaleString('id-ID') }}</p>
                        <p class="text-[12px] font-medium text-[#1a1916] leading-tight">{{ log.description }}</p>
                        <p class="text-[11px] text-[#6b6a64] mt-1 italic capitalize">By: {{ log.causer?.name || 'System'
                        }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'compliance'" class="bg-white border border-[#e5e7eb] rounded-[12px] p-6 shadow-sm">
            <div
                class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-5 pb-2 border-b border-[#e5e7eb]">
                Kepatuhan & Dokumen</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-[13px]">
                <div class="flex flex-col gap-1"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Masa
                        Berlaku STNK</span><span class="font-medium text-[#1a1916]">{{ formatDate(vehicle.stnk_expiry)
                        }}</span></div>
                <div class="flex flex-col gap-1"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Masa
                        Berlaku KIR</span><span class="font-medium text-[#1a1916]">{{ formatDate(vehicle.kir_expiry)
                        }}</span></div>
                <div class="flex flex-col gap-1"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Masa
                        Berlaku Asuransi</span><span class="font-medium text-[#1a1916]">{{
                            formatDate(vehicle.insurance_expiry) }}</span></div>
                <div class="flex flex-col gap-1"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Servis
                        Terakhir</span><span class="font-medium text-[#1a1916]">{{ formatDate(vehicle.last_service_date)
                        }}</span></div>
                <div class="flex flex-col gap-1"><span class="text-[11px] text-[#9e9d96] uppercase font-medium">Jadwal
                        Servis Berikutnya</span><span class="font-medium text-[#1a1916]">{{
                            formatDate(vehicle.next_service_date) }}</span></div>
            </div>
        </div>

        <div v-if="activeTab === 'gps'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white border border-[#e5e7eb] rounded-[12px] p-5 shadow-sm">
                    <div
                        class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-4 pb-2 border-b border-[#e5e7eb]">
                        vehicle summary</div>
                    <div class="flex items-center gap-3 mb-5">
                        <div
                            class="w-11 h-11 bg-[#f9fafb] border border-black/5 rounded-md flex items-center justify-center text-xl">
                            🚛</div>
                        <div>
                            <div class="text-[15px] font-semibold text-[#1a1916]">{{ vehicle?.asset_number }}</div>
                            <div class="text-[12px] text-[#6b6a64]">{{ vehicle?.make }} {{ vehicle?.model }} · {{
                                vehicle?.vehicle_type?.name }}</div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-0.5"><span
                                class="text-[11px] text-[#9e9d96] font-medium uppercase tracking-[0.04em]">plate</span><span
                                class="text-[13px] font-medium font-mono">{{ vehicle?.plate_number || '-' }}</span>
                        </div>
                        <div class="flex flex-col gap-0.5"><span
                                class="text-[11px] text-[#9e9d96] font-medium uppercase tracking-[0.04em]">status</span>
                            <div class="w-fit">
                                <VehicleStatusBadge :status="vehicle?.status" />
                            </div>
                        </div>
                        <div class="flex flex-col gap-0.5"><span
                                class="text-[11px] text-[#9e9d96] font-medium uppercase tracking-[0.04em]">site</span><span
                                class="text-[13px] font-medium text-[#1a1916]">Pit Area B</span></div>
                        <div class="flex flex-col gap-0.5"><span
                                class="text-[11px] text-[#9e9d96] font-medium uppercase tracking-[0.04em]">op.
                                hours</span><span class="text-[13px] font-medium text-[#1a1916]">{{
                                    vehicle?.operating_hours || 0 }} h</span></div>
                    </div>
                </div>

                <div class="bg-white border border-[#e5e7eb] rounded-[12px] p-5 shadow-sm">
                    <div
                        class="flex items-center justify-between text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-4 pb-2 border-b border-[#e5e7eb]">
                        current gps device
                        <span v-if="vehicle?.gps_device_id"
                            class="text-[#3b6d11] bg-[#eaf3de] px-1.5 py-0.5 rounded text-[9px]">LINKED</span>
                    </div>
                    <div class="mb-5">
                        <div class="text-[15px] font-semibold text-[#1a1916]">
                            {{ vehicle?.gps_provider?.name || 'Tidak ada perangkat' }}</div>
                        <div class="font-mono text-[11px] text-[#6b6a64] mt-0.5">IMEI: {{ vehicle?.gps_device_id || '-'
                        }}</div>
                    </div>
                    <div class="flex items-center gap-2 p-2.5 bg-[#f9fafb] rounded-md text-[11px] text-[#6b6a64]">
                        <div class="w-2 h-2 rounded-full"
                            :class="vehicle?.gps_device_id ? 'bg-[#3b6d11] animate-pulse' : 'bg-[#9e9d96]'"></div>
                        {{ vehicle?.last_seen_at ? `Last seen ${formatDate(vehicle.last_seen_at)}`
                            : 'Perangkat belum pernah mengirim data' }}
                    </div>
                </div>
            </div>

            <div class="bg-white border border-[#e5e7eb] rounded-[12px] p-6 shadow-sm">
                <div
                    class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-5 pb-2 border-b border-[#e5e7eb]">
                    {{ vehicle?.gps_provider_id ? 'reassign device' : 'assign device' }}
                </div>
                <form @submit.prevent="submitAssignment">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="flex flex-col gap-1.5">
                            <label class="text-[11px] font-medium text-[#6b6a64]">GPS provider</label>
                            <select v-model="gpsForm.gps_provider_id" required
                                class="w-full px-3 py-1.5 text-[12px] bg-white border border-[#d1d5db] rounded-md outline-none focus:border-[#1a1916]">
                                <option value="" disabled>Pilih Provider</option>
                                <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                                    {{ provider.name }}
                                </option>
                            </select>
                        </div>
                        <div class="flex flex-col gap-1.5">
                            <label class="text-[11px] font-medium text-[#6b6a64]">device ID / IMEI</label>
                            <input type="text" v-model="gpsForm.gps_device_id" required placeholder="Masukkan IMEI"
                                class="w-full px-3 py-1.5 font-mono text-[11px] bg-white border border-[#d1d5db] rounded-md outline-none focus:border-[#1a1916]" />
                        </div>
                    </div>
                    <div v-if="vehicle?.gps_provider_id"
                        class="flex items-center gap-2.5 p-3 bg-[#faeeda] rounded-md text-[11px] text-[#854f0b] mb-5 border border-[#fde68a]">
                        <span class="text-[14px]">⚠</span> reassigning will stop pings from the current device
                        immediately
                    </div>
                    <div class="flex items-center gap-2.5">
                        <button type="submit" :disabled="isSubmitting"
                            class="px-4 py-1.5 text-[12px] font-medium rounded-md bg-[#1a1916] text-white hover:bg-black transition-colors disabled:opacity-50">
                            {{ isSubmitting ? 'saving...' : 'save assignment' }}
                        </button>
                        <button v-if="vehicle?.gps_provider_id" type="button" @click="unlinkDevice"
                            :disabled="isSubmitting"
                            class="px-4 py-1.5 text-[12px] font-medium rounded-md border border-[#a32d2d]/30 bg-white text-[#a32d2d] hover:bg-[#fcebeb] transition-colors disabled:opacity-50">
                            unlink device
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="mt-8 flex items-center justify-between border-t border-black/5 pt-6">
            <button @click="router.push('/vehicles')"
                class="text-[12px] font-medium text-[#6b6a64] hover:text-[#1a1916] flex items-center gap-1">
                <i class="pi pi-arrow-left text-[10px]"></i> Kembali ke daftar
            </button>
            <div class="flex items-center gap-3">
                <button v-if="canManage" @click="router.push(`/vehicles/${vehicle.id}/edit`)"
                    class="px-4 py-1.5 text-[12px] font-medium rounded-md border border-black/20 bg-white text-[#1a1916] hover:bg-[#f9fafb] transition-colors">Edit
                    Data</button>
                <button v-if="isAdmin" @click="deleteVehicle"
                    class="px-4 py-1.5 text-[12px] font-medium rounded-md border border-[#a32d2d]/30 bg-[#fcebeb] text-[#a32d2d] hover:bg-[#f8d7d7] transition-colors">Hapus</button>
            </div>
        </div>
    </div>
</template>