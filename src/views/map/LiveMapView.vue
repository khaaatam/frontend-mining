<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, toRaw } from 'vue' // <-- toRaw udah di-import biar aman
import { useRouter } from 'vue-router'
import { useMapStore } from '@/stores/map'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css' // Wajib import CSS MapLibre

// Komponen UI
import { Input } from '@/components/ui/input'
import VehicleStatusBadge from '@/components/VehicleStatusBadge.vue'

const mapStore = useMapStore()
const router = useRouter()

// Refs untuk DOM dan Map Instance
const mapContainer = ref<HTMLElement | null>(null)
let map: maplibregl.Map | null = null

// Saat komponen dimount, mulai polling dan inisialisasi peta
onMounted(() => {
    mapStore.startPolling()
    initMap()
})

// Cleanup saat pindah halaman biar memory nggak bocor
onUnmounted(() => {
    mapStore.stopPolling()
    if (map) map.remove()
})

// === KUNCI LIVE UPDATE ===
watch(() => mapStore.filteredVehiclesGeoJSON, (newData) => {
    if (map && map.getSource('vehicles')) {
        // JURUS ULTIMATE: Buang Proxy Vue pakai JSON.parse
        const rawData = JSON.parse(JSON.stringify(newData));
        (map.getSource('vehicles') as maplibregl.GeoJSONSource).setData(rawData);
    }
}, { deep: true })

// Fungsi utama bikin peta
function initMap() {
    if (!mapContainer.value) return

    // Inisialisasi MapLibre
    map = new maplibregl.Map({
        container: mapContainer.value,
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [117.5, 1.0],
        zoom: 8
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.FullscreenControl(), 'top-right')

    // Tunggu map beres loading style
    map.on('load', () => {
        // 1. Tambah Data Source (Format GeoJSON)
        map!.addSource('vehicles', {
            type: 'geojson',
            // JURUS ULTIMATE: Eksekusi pas peta pertama dimuat
            data: JSON.parse(JSON.stringify(mapStore.filteredVehiclesGeoJSON)),
            cluster: true,
            clusterMaxZoom: 12,
            clusterRadius: 50
        })

        // 2. Layer Cluster (Bunderan Biru)
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

        // 3. Layer Angka di Dalam Cluster
        map!.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'vehicles',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12
            },
            paint: {
                'text-color': '#ffffff'
            }
        })

        // 4. Layer Kendaraan Tunggal (Titik Hijau)
        map!.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'vehicles',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#1D9E75',
                'circle-radius': 8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff',
                'circle-opacity': ['case', ['get', 'is_stale'], 0.4, 1.0],
                'circle-stroke-opacity': ['case', ['get', 'is_stale'], 0.4, 1.0]
            }
        })

        // 5. Logic Popup saat Mobil Diklik
        map!.on('click', 'unclustered-point', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const coordinates = (feature.geometry as any).coordinates.slice();
            const props = feature.properties || {};

            const popupDiv = document.createElement('div')
            popupDiv.innerHTML = `
                <div class="p-2 w-48">
                <h3 class="font-bold text-lg mb-1">${props.asset_number}</h3>
                <p class="text-sm">Type: ${props.type_key}</p>
                <p class="text-sm">Status: <strong>${props.status}</strong></p>
                <p class="text-sm">Speed: ${props.speed} km/h</p>
                <p class="text-xs text-gray-500 mt-2">Last seen: ${new Date(props.last_seen_at).toLocaleTimeString()}</p>
                <div class="flex gap-2 mt-3">
                    <button id="btn-history" class="px-2 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300 w-full">History</button>
                    <button id="btn-detail" class="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 w-full">Detail</button>
                </div>
                </div>
            `

            popupDiv.querySelector('#btn-history')?.addEventListener('click', () => {
                router.push(`/map/history?vehicle_id=${props.id}`)
            })
            popupDiv.querySelector('#btn-detail')?.addEventListener('click', () => {
                router.push(`/vehicles/${props.id}`)
            })

            new maplibregl.Popup({ closeButton: false })
                .setLngLat(coordinates)
                .setDOMContent(popupDiv)
                .addTo(map!)
        })

        map!.on('mouseenter', 'clusters', () => { map!.getCanvas().style.cursor = 'pointer' })
        map!.on('mouseleave', 'clusters', () => { map!.getCanvas().style.cursor = '' })
        map!.on('mouseenter', 'unclustered-point', () => { map!.getCanvas().style.cursor = 'pointer' })
        map!.on('mouseleave', 'unclustered-point', () => { map!.getCanvas().style.cursor = '' })
    })
}

// Fungsi Sidebar Klik -> Kamera map lari ke mobil itu
function flyToVehicle(feature: any) {
    if (!map) return
    const coordinates = feature.geometry.coordinates

    map.flyTo({
        center: coordinates,
        zoom: 15,
        speed: 1.2,
        essential: true
    })

    mapStore.selectVehicle(feature.properties.id)
}
</script>

<template>
    <div class="flex h-full w-full overflow-hidden relative bg-slate-100">

        <aside class="w-[320px] bg-white border-r flex flex-col z-10 shrink-0 shadow-sm">

            <div class="p-5 border-b space-y-4 bg-slate-50/50">
                <h2 class="text-base font-bold text-slate-800 flex items-center justify-between">
                    <span class="flex items-center gap-2"><span>📍</span> Live Vehicles</span>
                    <span class="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{{
                        mapStore.filteredFeatures.length }} Units</span>
                </h2>

                <div class="space-y-3">
                    <Input v-model="mapStore.filters.searchQuery" placeholder="Search asset number..."
                        class="bg-white w-full shadow-sm" />

                    <div class="grid grid-cols-2 gap-2">
                        <select v-model="mapStore.filters.status"
                            class="text-xs border border-slate-200 rounded-md p-2 bg-white outline-none cursor-pointer shadow-sm focus:border-blue-500">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="idle">Idle</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                        <select v-model="mapStore.filters.typeKey"
                            class="text-xs border border-slate-200 rounded-md p-2 bg-white outline-none cursor-pointer shadow-sm focus:border-blue-500">
                            <option value="all">All Types</option>
                            <option value="haul_truck">Haul Truck</option>
                            <option value="excavator">Excavator</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto">
                <div v-for="vehicle in mapStore.filteredFeatures" :key="vehicle.properties.id"
                    @click="flyToVehicle(vehicle)"
                    class="p-4 border-b border-slate-100 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                    :class="{ 'bg-blue-50/50': mapStore.selectedVehicleId === vehicle.properties.id }">
                    <div>
                        <p class="font-bold text-sm text-slate-900">{{ vehicle.properties.asset_number }}</p>
                        <p class="text-[10px] text-slate-500 uppercase mt-0.5">{{
                            vehicle.properties.type_key?.replace('_', ' ') }}</p>
                    </div>
                    <VehicleStatusBadge :status="vehicle.properties.status" />
                </div>

                <div v-if="mapStore.filteredFeatures.length === 0" class="p-8 text-center text-xs text-slate-400">
                    No vehicles matched your filter.
                </div>
            </div>
        </aside>

        <main class="flex-1 relative">
            <div ref="mapContainer" class="w-full h-full absolute inset-0 z-0"></div>

            <div
                class="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-md shadow-sm text-xs font-semibold border flex items-center gap-2 z-10 text-slate-700">
                <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Live refreshes in {{ mapStore.remainingTime }}s
            </div>

            <div
                class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-6 py-2.5 rounded-full shadow-md flex gap-4 md:gap-6 text-[11px] font-semibold border border-slate-200 z-10 text-slate-600">
                <div class="flex items-center gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-[#1D9E75]"></div> Active
                </div>
                <div class="flex items-center gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-[#BA7517]"></div> Idle
                </div>
                <div class="flex items-center gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-[#E24B4A]"></div> Maintenance
                </div>
                <div class="flex items-center gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-[#1E40AF]"></div> Cluster
                </div>
            </div>

            <div class="absolute bottom-0 left-0 w-full h-[4px] bg-slate-200/50 z-10">
                <div class="h-full bg-blue-600 transition-all duration-1000 ease-linear"
                    :style="{ width: `${(30 - mapStore.remainingTime) / 30 * 100}%` }"></div>
            </div>
        </main>

    </div>
</template>