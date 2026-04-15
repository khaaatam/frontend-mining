<template>
    <div class="p-6 md:p-8 font-sans">

        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-gray-900">GPS providers</h1>
                <p class="text-gray-500 text-sm mt-1">Manage external GPS integrations</p>
            </div>
            <router-link to="/gps-providers/create"
                class="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-black transition whitespace-nowrap">
                + add provider
            </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-stone-100 p-6 rounded-xl border border-stone-200">
                <p class="text-[11px] font-bold text-gray-500 tracking-widest mb-2 uppercase">Total Providers</p>
                <p class="text-4xl font-bold text-gray-900">{{ providers.length }}</p>
            </div>
            <div class="bg-stone-100 p-6 rounded-xl border border-stone-200">
                <p class="text-[11px] font-bold text-gray-500 tracking-widest mb-2 uppercase">Active</p>
                <p class="text-4xl font-bold text-green-700">{{ activeCount }}</p>
            </div>
            <div class="bg-stone-100 p-6 rounded-xl border border-stone-200">
                <p class="text-[11px] font-bold text-gray-500 tracking-widest mb-2 uppercase">Linked Vehicles</p>
                <p class="text-4xl font-bold text-gray-900">{{ linkedVehiclesCount }}</p>
            </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse min-w-full">
                    <thead class="bg-stone-100 border-b border-gray-200">
                        <tr>
                            <th
                                class="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                Provider Name</th>
                            <th
                                class="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                Base URL</th>
                            <th
                                class="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                Auth Type</th>
                            <th
                                class="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                Vehicles</th>
                            <th
                                class="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                Status</th>
                            <th class="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="item in providers" :key="item.id" class="hover:bg-stone-50 transition-colors">
                            <td class="px-6 py-5">
                                <p class="text-[15px] font-medium text-gray-900">{{ item.name }}</p>
                                <p class="text-[13px] text-gray-500 mt-1">{{ item.driver }}-based auth</p>
                            </td>
                            <td class="px-6 py-5 text-[13px] text-gray-500 font-mono tracking-tight">{{ item.base_url }}
                            </td>
                            <td class="px-6 py-5">
                                <span class="px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider"
                                    :class="item.auth_type === 'bearer' ? 'bg-blue-50 text-blue-700' : 'bg-blue-50 text-blue-700'">
                                    {{ item.auth_type || 'API KEY' }}
                                </span>
                            </td>
                            <td class="px-6 py-5 text-[14px] font-medium text-gray-700">
                                {{ item.vehicles_count || 0 }}
                            </td>
                            <td class="px-6 py-5">
                                <span
                                    :class="item.is_active ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'"
                                    class="px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                    {{ item.is_active ? 'ACTIVE' : 'INACTIVE' }}
                                </span>
                            </td>
                            <td class="px-6 py-5 text-right">
                                <router-link :to="`/gps-providers/${item.id}/edit`"
                                    class="inline-block border border-gray-300 bg-white text-gray-600 px-4 py-1.5 rounded-full text-xs font-medium hover:bg-stone-100 transition">
                                    edit
                                </router-link>
                            </td>
                        </tr>
                        <tr v-if="providers.length === 0">
                            <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                                No GPS providers configured.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const providers = ref<any[]>([]);

const activeCount = computed(() => {
    return providers.value.filter(p => p.is_active).length;
});

const linkedVehiclesCount = computed(() => {
    return providers.value.reduce((total, p) => total + (p.vehicles_count || 0), 0);
});

const getHeaders = () => {
    const token = localStorage.getItem('token') || '';
    return {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const fetchProviders = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/gps-providers', {
            headers: getHeaders()
        });
        providers.value = response.data;
    } catch (error) {
        console.error("Failed to fetch providers:", error);
    }
};

onMounted(() => {
    fetchProviders();
});
</script>