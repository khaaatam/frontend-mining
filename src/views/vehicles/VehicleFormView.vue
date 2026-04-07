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
    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-semibold text-gray-800">
                {{ isEdit ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru' }}
            </h1>
            <Button variant="outline" @click="router.push('/vehicles')">Batal</Button>
        </div>

        <form @submit.prevent="submitForm">
            <Tabs defaultValue="identity" class="w-full">
                <TabsList class="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="identity">Identity</TabsTrigger>
                    <TabsTrigger value="operational">Operational</TabsTrigger>
                    <TabsTrigger value="gps">GPS Tracking</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="identity" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label for="asset_number">Asset Number</Label>
                            <Input id="asset_number" v-model="form.asset_number" required
                                placeholder="Contoh: TRK-001" />
                        </div>
                        <div class="space-y-2">
                            <Label for="vin">VIN / Nomor Rangka</Label>
                            <Input id="vin" v-model="form.vin" placeholder="Nomor identifikasi kendaraan" />
                        </div>
                        <div class="space-y-2">
                            <Label for="make">Merek (Make)</Label>
                            <Input id="make" v-model="form.make" required placeholder="Contoh: Komatsu, Volvo" />
                        </div>
                        <div class="space-y-2">
                            <Label for="model">Model</Label>
                            <Input id="model" v-model="form.model" required placeholder="Contoh: HD785" />
                        </div>
                        <div class="space-y-2">
                            <Label for="year">Tahun Pembuatan</Label>
                            <Input id="year" type="number" v-model="form.year" placeholder="2023" />
                        </div>
                        <div class="space-y-2">
                            <Label for="plate_number">Plat Nomor</Label>
                            <Input id="plate_number" v-model="form.plate_number" placeholder="Contoh: B 1234 XYZ" />
                        </div>
                        <div class="space-y-2">
                            <Label>Tipe Kendaraan</Label>
                            <Select v-model="form.vehicle_type_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe kendaraan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="type in vehicleTypes" :key="type.id" :value="String(type.id)">
                                        {{ type.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="space-y-2">
                            <Label>Status Kepemilikan</Label>
                            <Select v-model="form.ownership_type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kepemilikan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="type in ownershipOptions" :key="type" :value="type">
                                        {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="operational" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label>Status Operasional</Label>
                            <Select v-model="form.status" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="status in statusOptions" :key="status" :value="status">
                                        {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div class="space-y-2">
                            <Label for="operating_hours">Jam Operasional (Hours)</Label>
                            <Input id="operating_hours" type="number" step="0.1" v-model="form.operating_hours" />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="gps" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label for="gps_device_id">ID Perangkat GPS</Label>
                            <Input id="gps_device_id" v-model="form.gps_device_id"
                                placeholder="Masukkan IMEI atau ID device" />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="compliance" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label for="stnk_expiry">Masa Berlaku STNK</Label>
                            <Input id="stnk_expiry" type="date" v-model="form.stnk_expiry" />
                        </div>
                        <div class="space-y-2">
                            <Label for="kir_expiry">Masa Berlaku KIR</Label>
                            <Input id="kir_expiry" type="date" v-model="form.kir_expiry" />
                        </div>
                        <div class="space-y-2">
                            <Label for="insurance_expiry">Masa Berlaku Asuransi</Label>
                            <Input id="insurance_expiry" type="date" v-model="form.insurance_expiry" />
                        </div>
                        <div class="space-y-2">
                            <Label for="last_service_date">Tanggal Servis Terakhir</Label>
                            <Input id="last_service_date" type="date" v-model="form.last_service_date" />
                        </div>
                        <div class="space-y-2">
                            <Label for="next_service_date">Jadwal Servis Berikutnya</Label>
                            <Input id="next_service_date" type="date" v-model="form.next_service_date" />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div class="mt-8 flex justify-end">
                <Button type="submit" :disabled="loading">
                    {{ loading ? 'Menyimpan...' : 'Simpan Data Kendaraan' }}
                </Button>
            </div>
        </form>
    </div>
</template>