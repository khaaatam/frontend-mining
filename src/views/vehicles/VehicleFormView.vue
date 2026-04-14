<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast/use-toast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { toast } = useToast()

const isEdit = computed(() => route.params.id !== undefined)
const loading = ref(false)
const vehicleTypes = ref<any[]>([])

const activeTab = ref('identity')

const form = ref<Record<string, any>>({
    asset_number: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    plate_number: '',
    vehicle_type_id: '',
    ownership_type: '',
    status: 'active',
    operating_hours: 0,
    site_id: '',
    current_operator_id: '',
    gps_provider_id: '',
    gps_device_id: '',
    stnk_expiry: '',
    kir_expiry: '',
    insurance_expiry: '',
    last_service_date: '',
    next_service_date: ''
})

const ownershipOptions = ['owned', 'leased', 'rented']
const statusOptions = ['active', 'idle', 'maintenance', 'breakdown', 'decommissioned']

const fetchOptions = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/vehicle-types', {
            headers: { Authorization: `Bearer ${auth.token}` }
        })
        vehicleTypes.value = response.data.data
    } catch (error) {
        console.error('Failed to fetch vehicle types:', error)
    }
}

const fetchVehicle = async () => {
    if (!isEdit.value) return

    loading.value = true
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/vehicles/${route.params.id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })

        const data = response.data.data
        Object.keys(form.value).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
                // Format date to YYYY-MM-DD for HTML date input
                if (key.includes('date') || key.includes('expiry')) {
                    form.value[key] = String(data[key]).split('T')[0]
                } else {
                    form.value[key] = String(data[key])
                }
            }
        })
    } catch (error) {
        toast({
            title: 'Error',
            description: 'Data kendaraan gagal dimuat.',
            variant: 'destructive'
        })
    } finally {
        loading.value = false
    }
}

const submitForm = async () => {
    loading.value = true
    try {
        const url = isEdit.value
            ? `http://127.0.0.1:8000/api/vehicles/${route.params.id}`
            : 'http://127.0.0.1:8000/api/vehicles'

        const method = isEdit.value ? 'put' : 'post'

        await axios[method](url, form.value, {
            headers: { Authorization: `Bearer ${auth.token}` }
        })

        toast({
            title: 'Berhasil',
            description: `Data kendaraan berhasil ${isEdit.value ? 'diperbarui' : 'disimpan'}.`,
        })

        router.push('/vehicles')
    } catch (error: any) {
        toast({
            title: 'Validasi Gagal',
            description: error.response?.data?.message || 'Periksa kembali data yang dimasukkan.',
            variant: 'destructive'
        })
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchOptions()
    fetchVehicle()
})
</script>

<template>
    <div class="max-w-[1000px] mx-auto pb-12">
        
        <form @submit.prevent="submitForm">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 class="text-[17px] font-semibold tracking-tight text-[#1a1916]">
                        {{ isEdit ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru' }}
                    </h1>
                    <p class="text-[12px] text-[#9e9d96] mt-[1px]">Lengkapi data informasi dan spesifikasi kendaraan</p>
                </div>
                
                <div class="flex items-center gap-1.5 p-1 bg-[#f0efe9] rounded-lg border border-black/10">
                    <button type="button" @click="activeTab = 'identity'" :class="activeTab === 'identity' ? 'bg-white shadow-sm border border-black/10 font-semibold text-[#1a1916]' : 'border-transparent text-[#6b6a64] hover:text-[#1a1916]'" class="px-4 py-1.5 text-[12px] rounded-md transition-all">Identity</button>
                    <button type="button" @click="activeTab = 'operational'" :class="activeTab === 'operational' ? 'bg-white shadow-sm border border-black/10 font-semibold text-[#1a1916]' : 'border-transparent text-[#6b6a64] hover:text-[#1a1916]'" class="px-4 py-1.5 text-[12px] rounded-md transition-all">Operational</button>
                    <button type="button" @click="activeTab = 'gps'" :class="activeTab === 'gps' ? 'bg-white shadow-sm border border-black/10 font-semibold text-[#1a1916]' : 'border-transparent text-[#6b6a64] hover:text-[#1a1916]'" class="px-4 py-1.5 text-[12px] rounded-md transition-all">GPS Tracking</button>
                    <button type="button" @click="activeTab = 'compliance'" :class="activeTab === 'compliance' ? 'bg-white shadow-sm border border-black/10 font-semibold text-[#1a1916]' : 'border-transparent text-[#6b6a64] hover:text-[#1a1916]'" class="px-4 py-1.5 text-[12px] rounded-md transition-all">Compliance</button>
                </div>
            </div>

            <div v-show="activeTab === 'identity'" class="bg-white border border-black/10 rounded-[16px] p-6 shadow-sm">
                <div class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-5 pb-2 border-b border-black/10">
                    identitas dasar
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Asset Number</label>
                        <input v-model="form.asset_number" required placeholder="Contoh: TRK-001" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">VIN / Nomor Rangka</label>
                        <input v-model="form.vin" placeholder="Nomor identifikasi kendaraan" class="w-full px-3 py-2 font-mono text-[12px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30 placeholder:font-sans" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Merek (Make)</label>
                        <input v-model="form.make" required placeholder="Contoh: Komatsu, Volvo" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Model</label>
                        <input v-model="form.model" required placeholder="Contoh: HD785" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Tahun Pembuatan</label>
                        <input type="number" v-model="form.year" placeholder="2023" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Plat Nomor</label>
                        <input v-model="form.plate_number" placeholder="Contoh: B 1234 XYZ" class="w-full px-3 py-2 font-mono text-[12px] uppercase bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30 placeholder:font-sans placeholder:normal-case" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Tipe Kendaraan</label>
                        <select v-model="form.vehicle_type_id" required class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]">
                            <option value="" disabled>Pilih tipe kendaraan</option>
                            <option v-for="type in vehicleTypes" :key="type.id" :value="String(type.id)">{{ type.name }}</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Status Kepemilikan</label>
                        <select v-model="form.ownership_type" required class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]">
                            <option value="" disabled>Pilih kepemilikan</option>
                            <option v-for="type in ownershipOptions" :key="type" :value="type">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div v-show="activeTab === 'operational'" class="bg-white border border-black/10 rounded-[16px] p-6 shadow-sm">
                <div class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-5 pb-2 border-b border-black/10">
                    status operasional
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Status Operasional</label>
                        <select v-model="form.status" required class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]">
                            <option value="" disabled>Pilih status</option>
                            <option v-for="status in statusOptions" :key="status" :value="status">{{ status.charAt(0).toUpperCase() + status.slice(1) }}</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Jam Operasional (Hours)</label>
                        <input type="number" step="0.1" v-model="form.operating_hours" placeholder="0.0" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30" />
                    </div>
                </div>
            </div>

            <div v-show="activeTab === 'gps'" class="bg-white border border-black/10 rounded-[16px] p-6 shadow-sm">
                <div class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-5 pb-2 border-b border-black/10">
                    konfigurasi gps
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">ID Perangkat GPS</label>
                        <input v-model="form.gps_device_id" placeholder="Masukkan IMEI atau ID device" class="w-full px-3 py-2 font-mono text-[12px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916] placeholder:text-black/30 placeholder:font-sans" />
                        <span class="text-[11px] text-[#9e9d96] mt-0.5">Sistem akan otomatis me-link data ping berdasarkan ID ini.</span>
                    </div>
                </div>
            </div>

            <div v-show="activeTab === 'compliance'" class="bg-white border border-black/10 rounded-[16px] p-6 shadow-sm">
                <div class="text-[10px] font-bold tracking-[0.1em] uppercase text-[#9e9d96] mb-5 pb-2 border-b border-black/10">
                    dokumen & legalitas
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Masa Berlaku STNK</label>
                        <input type="date" v-model="form.stnk_expiry" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Masa Berlaku KIR</label>
                        <input type="date" v-model="form.kir_expiry" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Masa Berlaku Asuransi</label>
                        <input type="date" v-model="form.insurance_expiry" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Tanggal Servis Terakhir</label>
                        <input type="date" v-model="form.last_service_date" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <label class="text-[12px] font-medium text-[#6b6a64]">Jadwal Servis Berikutnya</label>
                        <input type="date" v-model="form.next_service_date" class="w-full px-3 py-2 font-sans text-[13px] bg-white border border-black/20 rounded-md text-[#1a1916] outline-none focus:border-[#1a1916]" />
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 mt-6">
                <button type="button" @click="router.push('/vehicles')" class="inline-flex items-center justify-center px-4 py-2 text-[13px] font-medium rounded-md border border-black/20 bg-white text-[#1a1916] hover:bg-[#f0efe9] transition-colors">
                    Batal
                </button>
                <button type="submit" :disabled="loading" class="inline-flex items-center justify-center px-4 py-2 text-[13px] font-medium rounded-md bg-[#1a1916] text-white hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ loading ? 'Menyimpan...' : 'Simpan Data Kendaraan' }}
                </button>
            </div>
        </form>
        
    </div>
</template>