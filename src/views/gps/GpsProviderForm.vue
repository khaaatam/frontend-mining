<template>
    <div class="p-6 md:p-8 font-sans">

        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'edit' : 'add' }} GPS provider</h1>
            <p class="text-gray-500 text-sm mt-1">Configure your GPS data source settings</p>
        </div>

        <form @submit.prevent="submitForm" class="max-w-3xl space-y-6">

            <div class="bg-white p-7 rounded-xl border border-gray-200">
                <h2
                    class="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-5 border-b border-gray-100 pb-3">
                    Basic Info</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    <div>
                        <label class="block text-[13px] font-medium text-gray-500 mb-1.5">provider name</label>
                        <input v-model="form.name" type="text" required
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow"
                            placeholder="e.g. Teltonika FMXXX">
                    </div>
                    <div>
                        <label class="block text-[13px] font-medium text-gray-500 mb-1.5">base url</label>
                        <input v-model="form.base_url" type="url" required
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow"
                            placeholder="https://api.provider.com">
                    </div>
                </div>

                <div class="w-full md:w-1/2 md:pr-3">
                    <label class="block text-[13px] font-medium text-gray-500 mb-1.5">poll interval (seconds)</label>
                    <input v-model="form.poll_interval" type="number" required
                        class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow"
                        placeholder="30">
                    <p class="text-[11px] text-gray-400 mt-1.5">recommended: 30-60 seconds</p>
                </div>
                <div class="flex flex-col justify-center pt-2">
                    <label class="block text-[13px] font-medium text-gray-500 mb-2">provider status</label>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="form.is_active" class="sr-only peer">
                        <div
                            class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5b8c2a]">
                        </div>
                        <span class="ml-3 text-[13px] font-bold uppercase tracking-wider"
                            :class="form.is_active ? 'text-[#5b8c2a]' : 'text-gray-400'">
                            {{ form.is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </label>
                </div>
            </div>

            <div class="bg-white p-7 rounded-xl border border-gray-200">
                <h2
                    class="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-5 border-b border-gray-100 pb-3">
                    Authentication</h2>

                <div class="w-full md:w-1/2 md:pr-3 mb-6">
                    <label class="block text-[13px] font-medium text-gray-500 mb-1.5">auth type</label>
                    <select v-model="form.auth_type"
                        class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] focus:ring-1 focus:ring-black focus:border-black outline-none bg-white transition-shadow">
                        <option value="api_key">API key</option>
                        <option value="bearer">Bearer token</option>
                        <option value="oauth2">OAuth2</option>
                        <option value="basic">Basic auth</option>
                    </select>
                </div>

                <div class="bg-[#f8f7f5] p-5 rounded-xl border border-gray-100">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-[13px] font-medium text-gray-500 mb-1.5">{{ authLabelHeader
                            }}</label>
                            <input v-model="authField1" type="text"
                                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow">
                        </div>
                        <div>
                            <label class="block text-[13px] font-medium text-gray-500 mb-1.5">{{ authLabelValue
                            }}</label>
                            <input v-model="authField2" type="password"
                                class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow"
                                placeholder="••••••••••••••••">
                        </div>
                    </div>
                    <p class="text-[11px] text-gray-400 mt-2.5">credentials are stored encrypted in the database</p>
                </div>
            </div>

            <div class="bg-white p-7 rounded-xl border border-gray-200">
                <h2
                    class="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-5 border-b border-gray-100 pb-3">
                    Endpoint Config</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label class="block text-[13px] font-medium text-gray-500 mb-1.5">latest location
                            endpoint</label>
                        <input v-model="form.location_endpoint" type="text"
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] text-gray-600 focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow"
                            placeholder="/api/v1/devices/{id}/location">
                    </div>
                    <div>
                        <label class="block text-[13px] font-medium text-gray-500 mb-1.5">history endpoint
                            (optional)</label>
                        <input type="text"
                            class="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] text-gray-600 focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow"
                            placeholder="/api/v1/devices/{id}/history">
                    </div>
                </div>

                <div>
                    <label class="block text-[13px] font-medium text-gray-500 mb-1.5">response field mapping
                        (JSON)</label>
                    <textarea rows="4"
                        class="w-full border border-gray-300 rounded-xl px-4 py-3 text-[13px] font-mono text-gray-700 focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow resize-y"
                        placeholder='{"lat":"data.latitude", "lng":"data.longitude", "speed":"data.spd", "heading":"data.dir"}'></textarea>
                    <p class="text-[11px] text-gray-400 mt-2">map provider response fields to normalized internal field
                        names</p>
                </div>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <button type="submit" :disabled="isSubmitting"
                    class="bg-[#1a1a1a] text-white px-7 py-2.5 rounded-xl text-[13px] font-bold hover:bg-black transition disabled:opacity-50">
                    {{ isSubmitting ? 'saving...' : 'save provider' }}
                </button>
                <button type="button"
                    class="bg-white text-gray-800 border border-gray-300 px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition">
                    test connection
                </button>

                <div class="flex-grow"></div>

                <button v-if="isEdit" type="button" @click="deleteProvider"
                    class="bg-white text-red-600 border border-red-200 px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-50 transition">
                    delete provider
                </button>
                <button type="button" @click="goBack"
                    class="bg-white text-gray-800 border border-gray-300 px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition">
                    cancel
                </button>
            </div>

        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const route = useRoute();
const isSubmitting = ref(false);

const isEdit = computed(() => !!route.params.id);

const form = ref({
    name: '',
    driver: 'hexagon',
    base_url: '',
    auth_type: 'api_key',
    auth_config: {} as Record<string, any>,
    location_endpoint: '/Traveling',
    poll_interval: 30,
    is_active: true
});

const authField1 = ref('');
const authField2 = ref('');

const authLabelHeader = computed(() => {
    if (form.value.auth_type === 'basic') return 'username';
    if (form.value.auth_type === 'oauth2') return 'client id';
    if (form.value.auth_type === 'bearer') return 'header name';
    return 'API key header';
});

const authLabelValue = computed(() => {
    if (form.value.auth_type === 'basic') return 'password';
    if (form.value.auth_type === 'oauth2') return 'client secret';
    if (form.value.auth_type === 'bearer') return 'token value';
    return 'API key value';
});

const getHeaders = () => ({
    'Accept': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const fetchProviderData = async () => {
    if (!isEdit.value) return;

    try {
        const { data } = await axios.get(`http://localhost:8000/api/gps-providers/${route.params.id}`, {
            headers: getHeaders()
        });

        form.value = data;

        const config = data.auth_config || {};
        if (data.auth_type === 'basic') {
            authField1.value = config.username || '';
            authField2.value = config.password || '';
        } else if (data.auth_type === 'oauth2') {
            authField1.value = config.client_id || '';
            authField2.value = config.client_secret || '';
        } else {
            authField1.value = config.header || '';
            authField2.value = config.key || '';
        }
    } catch (error) {
        console.error("Gagal ambil data provider:", error);
    }
};

const submitForm = async () => {
    isSubmitting.value = true;

    if (form.value.auth_type === 'basic') {
        form.value.auth_config = { username: authField1.value, password: authField2.value };
    } else if (form.value.auth_type === 'oauth2') {
        form.value.auth_config = { client_id: authField1.value, client_secret: authField2.value };
    } else {
        form.value.auth_config = { header: authField1.value, key: authField2.value };
    }

    try {
        const url = `http://localhost:8000/api/gps-providers${isEdit.value ? '/' + route.params.id : ''}`;
        const method = isEdit.value ? 'put' : 'post';

        await axios[method](url, form.value, { headers: getHeaders() });
        router.push('/gps-providers');
    } catch (error) {
        console.error("Gagal simpan data:", error);
    } finally {
        isSubmitting.value = false;
    }
};

// nambahin logic delete di sini
const deleteProvider = async () => {
    if (!confirm(`Yakin mau hapus provider "${form.value.name}"? Pastikan nggak ada kendaraan yang masih nempel ya.`)) {
        return;
    }

    try {
        await axios.delete(`http://localhost:8000/api/gps-providers/${route.params.id}`, {
            headers: getHeaders()
        });
        router.push('/gps-providers');
    } catch (error: any) {
        console.error("Gagal hapus provider:", error);
        const errorMessage = error.response?.data?.message || 'Gagal menghapus provider. Coba lagi.';
        alert(errorMessage);
    }
};

const goBack = () => router.push('/gps-providers');

onMounted(fetchProviderData);
</script>