<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '@/stores/map'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import { Input } from '@/components/ui/input'
import VehicleStatusBadge from '@/components/VehicleStatusBadge.vue'

const mapStore = useMapStore()
const router = useRouter()

const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null

onMounted(async () => {
    mapStore.startPolling()
    mapStore.fetchVehicleTypes()
    await nextTick()
    setTimeout(() => { initMap() }, 100)
})

onUnmounted(() => {
    mapStore.stopPolling()
    if (map) map.remove()
})

watch(() => mapStore.filteredVehiclesGeoJSON, (newData) => {
    if (map && map.getSource('vehicles')) {
        const safeData = newData || { type: 'FeatureCollection', features: [] };
        const rawData = JSON.parse(JSON.stringify(safeData));
        (map.getSource('vehicles') as maplibregl.GeoJSONSource).setData(rawData);
    }
}, { deep: true })

function openVehiclePopup(feature: any) {
    if (!map) return;

    const coordinates = feature.geometry.coordinates.slice();
    const props = feature.properties;

    let statusStyle = 'background: #eaf3de; color: #3b6d11;';
    if (props.status === 'maintenance') statusStyle = 'background: #fcebeb; color: #a11616;';
    else if (props.status === 'idle') statusStyle = 'background: #faeeda; color: #854f0b;';

    const makeText = props.make || 'Unknown';
    const modelText = props.model || '';

    const popupDiv = document.createElement('div')
    popupDiv.innerHTML = `
        <div class="p-4 w-[280px] bg-white rounded-xl shadow-2xl font-sans text-[#1a1916]">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-bold text-[18px] leading-tight mb-0.5">${props.asset_number}</h3>
                    <p class="text-[12px] font-medium text-[#6b6a64] capitalize">${makeText} ${modelText}</p>
                </div>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider" style="${statusStyle}">
                    ${props.status}
                </span>
            </div>

            <div class="grid grid-cols-2 gap-2 mb-4">
                <div class="bg-[#f5f4f1] p-2.5 rounded-lg border border-black/5">
                    <p class="text-[#9e9d96] text-[10px] font-bold uppercase mb-0.5">Speed</p>
                    <p class="text-[#1a1916] text-[15px] font-bold">${props.speed ?? 0} <span class="text-[10px] font-medium text-[#6b6a64]">km/h</span></p>
                </div>
                <div class="bg-[#f5f4f1] p-2.5 rounded-lg border border-black/5">
                    <p class="text-[#9e9d96] text-[10px] font-bold uppercase mb-0.5">Heading</p>
                    <p class="text-[#1a1916] text-[15px] font-bold">${props.heading ?? 0}°</p>
                </div>
            </div>

            <div class="flex items-center gap-1.5 text-[11px] text-[#6b6a64] font-medium mb-5">
                <i class="pi pi-clock text-[12px]"></i>
                <span>Last seen: ${props.last_seen_at ? new Date(props.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
            </div>

            <div class="flex gap-2">
                <button id="btn-history" class="flex-1 px-3 py-2.5 bg-white border border-black/20 text-[#1a1916] text-[12px] font-bold rounded-lg hover:bg-slate-50 transition-colors">History</button>
                <button id="btn-detail" class="flex-1 px-3 py-2.5 bg-[#1a1916] text-white text-[12px] font-bold rounded-lg hover:bg-black/90 transition-colors">Detail</button>
            </div>
        </div>
    `

    popupDiv.querySelector('#btn-history')?.addEventListener('click', () => {
        router.push(`/map/history?vehicle_id=${props.id}`)
    })
    popupDiv.querySelector('#btn-detail')?.addEventListener('click', () => {
        router.push(`/vehicles/${props.id}`)
    })

    const existingPopups = document.getElementsByClassName('maplibregl-popup');
    while (existingPopups[0]) {
        existingPopups[0].remove();
    }

    new maplibregl.Popup({ closeButton: false, className: 'mining-popup', maxWidth: 'none' })
        .setLngLat(coordinates)
        .setDOMContent(popupDiv)
        .addTo(map!)
}

function initMap() {
    if (!mapContainer.value) return

    map = new maplibregl.Map({
        container: mapContainer.value,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [117.5, 1.0],
        zoom: 8,
        trackResize: true
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.FullscreenControl(), 'top-right')

    map.on('load', () => {
        map!.resize()
        const safeInitialData = mapStore.filteredVehiclesGeoJSON || { type: 'FeatureCollection', features: [] };

        map!.addSource('vehicles', {
            type: 'geojson',
            data: JSON.parse(JSON.stringify(safeInitialData)),
            cluster: true,
            clusterMaxZoom: 12,
            clusterRadius: 50
        })

        map!.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'vehicles',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': '#1E40AF',
                'circle-radius': ['step', ['get', 'point_count'], 15, 5, 20, 20, 25]
            }
        })

        map!.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'vehicles',
            filter: ['has', 'point_count'],
            layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 },
            paint: { 'text-color': '#ffffff' }
        })

        map!.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'vehicles',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': [
                    'match',
                    ['get', 'status'],
                    'active', '#1D9E75',
                    'idle', '#BA7517',
                    'maintenance', '#E24B4A',
                    '#1D9E75'
                ],
                'circle-radius': 9,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
            }
        })

        map!.on('click', 'unclustered-point', (e) => {
            const feature = e.features?.[0];
            if (feature) openVehiclePopup(feature);
        })

        map!.on('mouseenter', 'unclustered-point', () => { map!.getCanvas().style.cursor = 'pointer' })
        map!.on('mouseleave', 'unclustered-point', () => { map!.getCanvas().style.cursor = '' })
    })
}

function flyToVehicle(feature: any) {
    if (!map) return

    map.flyTo({
        center: feature.geometry.coordinates,
        zoom: 16,
        speed: 1.2,
        essential: true
    })

    mapStore.selectVehicle(feature.properties.id)

    openVehiclePopup(feature);
}

const getTypeName = (type: any) => {
    if (!type) return 'Unknown';
    if (typeof type === 'string') return type;
    if (type.name) return type.name;
    return type.key || 'Unknown';
}

const getTypeKey = (type: any) => {
    if (!type) return 'all';
    if (typeof type === 'string') return type;
    return type.name || type.key || type.id || 'all';
}
</script>

<template>
    <div class="flex w-full h-full overflow-hidden bg-[#f5f4f1] font-sans">
        <aside class="w-[360px] h-full bg-white border-r border-black/10 flex flex-col z-10 shrink-0 shadow-xl">
            <div class="p-5 border-b border-black/10 bg-white space-y-4 shrink-0">
                <h2 class="text-[14px] font-bold text-[#1a1916] tracking-tight">
                    Total Vehicles ({{ mapStore.filteredFeatures?.length || 0 }})
                </h2>

                <div class="grid grid-cols-2 gap-2">
                    <select v-model="mapStore.filters.status"
                        class="text-[12px] font-bold border border-black/10 rounded-lg px-2 h-10 bg-white outline-none cursor-pointer focus:border-[#1a1916]">
                        <option value="all">Status: All</option>
                        <option value="active">Active</option>
                        <option value="idle">Idle</option>
                        <option value="maintenance">Maintenance</option>
                    </select>

                    <select v-model="mapStore.filters.typeKey"
                        class="text-[12px] font-bold border border-black/10 rounded-lg px-2 h-10 bg-white outline-none cursor-pointer focus:border-[#1a1916]">
                        <option value="all">Type: All</option>
                        <option v-for="(type, index) in mapStore.vehicleTypes" :key="index" :value="getTypeKey(type)">
                            {{ getTypeName(type) }}
                        </option>
                    </select>
                </div>

                <div class="grid grid-cols-3 gap-2">
                    <div class="bg-[#f2fcf5] border border-[#dcf5e4] p-3 rounded-xl text-center">
                        <p class="text-[#1D9E75] text-[18px] font-bold leading-none">{{ mapStore.statusCounts?.active ||
                            0 }}</p>
                        <p class="text-[#1D9E75] text-[10px] font-bold uppercase mt-1">Active</p>
                    </div>
                    <div class="bg-[#fff9f0] border border-[#ffecd1] p-3 rounded-xl text-center">
                        <p class="text-[#BA7517] text-[18px] font-bold leading-none">{{ mapStore.statusCounts?.idle || 0
                        }}</p>
                        <p class="text-[#BA7517] text-[10px] font-bold uppercase mt-1">Idle</p>
                    </div>
                    <div class="bg-[#fff5f5] border border-[#ffe3e3] p-3 rounded-xl text-center">
                        <p class="text-[#E24B4A] text-[18px] font-bold leading-none">{{
                            mapStore.statusCounts?.maintenance || 0 }}</p>
                        <p class="text-[#E24B4A] text-[10px] font-bold uppercase mt-1">Maint</p>
                    </div>
                </div>

                <Input v-model="mapStore.filters.searchQuery" placeholder="Search asset number..."
                    class="bg-[#f5f4f1] border-transparent focus:border-[#1a1916] text-[13px] h-10 shadow-none" />
            </div>

            <div class="flex-1 overflow-y-auto bg-[#f5f4f1]/30 font-sans">
                <div v-for="vehicle in mapStore.filteredFeatures" :key="vehicle.properties.id"
                    @click="flyToVehicle(vehicle)"
                    class="p-4 border-b border-black/5 hover:bg-white cursor-pointer flex gap-4 items-center transition-all"
                    :class="{ 'bg-white shadow-[inset_4px_0_0_0_#1a1916]': mapStore.selectedVehicleId === vehicle.properties.id }">

                    <div
                        class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-black/5 text-slate-400">
                        <i class="pi pi-car text-lg"></i>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <p class="font-bold text-[14px] text-[#1a1916] truncate">{{ vehicle.properties.asset_number
                            }}</p>
                            <VehicleStatusBadge :status="vehicle.properties.status" />
                        </div>

                        <div class="flex justify-between items-center mt-1">
                            <p class="text-[11px] font-medium text-[#6b6a64] truncate capitalize">
                                {{ vehicle.properties.make || 'Unknown' }} {{ vehicle.properties.model || '' }}
                            </p>
                            <p class="text-[11px] font-bold text-[#1a1916]">
                                {{ vehicle.properties.speed ?? 0 }} <span class="text-[9px] text-[#9e9d96]">km/h</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>

        <main class="flex-1 h-full relative">
            <div ref="mapContainer" class="w-full h-full z-0 outline-none"></div>

            <div
                class="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-black/5 flex items-center gap-2 z-10 text-[#6b6a64] text-[11px] font-bold tracking-wide">
                <div class="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse"></div>
                Live · refreshes in {{ mapStore.remainingTime }}s
            </div>

            <div
                class="absolute bottom-6 left-4 bg-white/95 backdrop-blur px-4 py-2.5 rounded-xl shadow-lg flex flex-wrap gap-4 text-[11px] font-bold border border-black/5 z-10 text-[#1a1916]">
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-[#1D9E75]"></div> Active
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-[#BA7517]"></div> Idle
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-[#E24B4A]"></div> Maint
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full bg-[#1E40AF]"></div> Cluster
                </div>
            </div>

            <div class="absolute bottom-0 left-0 w-full h-[4px] bg-black/5 z-10">
                <div class="h-full bg-[#1a1916] transition-all duration-1000 ease-linear"
                    :style="{ width: `${(30 - mapStore.remainingTime) / 30 * 100}%` }"></div>
            </div>
        </main>
    </div>
</template>

<style>
.mining-popup .maplibregl-popup-content {
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.mining-popup .maplibregl-popup-tip {
    display: none;
}
</style>