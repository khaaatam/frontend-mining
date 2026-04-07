<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    status: string
}>()

const badgeTheme = computed(() => {
    switch (props.status) {
        case 'active':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'idle':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'maintenance':
            return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'breakdown':
            return 'bg-red-100 text-red-800 border-red-200'
        case 'decommissioned':
            return 'bg-gray-100 text-gray-800 border-gray-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
})

const formattedStatus = computed(() => {
    if (!props.status) return '-'
    return props.status.charAt(0).toUpperCase() + props.status.slice(1)
})
</script>

<template>
    <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', badgeTheme]">
        {{ formattedStatus }}
    </span>
</template>