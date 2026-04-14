<script setup lang="ts">
import { onMounted, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const mapContainer = ref<HTMLElement | null>(null)

onMounted(() => {
    if (!mapContainer.value) return

    new maplibregl.Map({
        container: mapContainer.value,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [117.0, -2.0],
        zoom: 4,
    })
})
</script>

<template>
    <div class="w-full h-[500px] rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <div ref="mapContainer" class="w-full h-full"></div>
    </div>
</template>
