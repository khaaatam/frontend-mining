<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    status: string,
    isDropdown?: boolean // Flag baru biar tau kapan harus nampilin panah
}>()

const badgeTheme = computed(() => {
    switch (props.status) {
        case 'active': return 'bg-green-100 text-green-800 border-green-200'
        case 'idle': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'breakdown': return 'bg-red-100 text-red-800 border-red-200'
        case 'decommissioned': return 'bg-gray-100 text-gray-800 border-gray-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
})

const formattedStatus = computed(() => {
    if (!props.status) return '-'
    return props.status.charAt(0).toUpperCase() + props.status.slice(1)
})
</script>

<template>
    <span
        :class="['inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors cursor-pointer', badgeTheme]">
        {{ formattedStatus }}
        <i v-if="isDropdown" class="pi pi-chevron-down text-[10px] opacity-70"></i>
    </span>
</template>