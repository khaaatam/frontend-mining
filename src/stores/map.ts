import { defineStore } from 'pinia'
import axios from 'axios'

interface MapState {
    vehicles: any // GeoJSON FeatureCollection
    selectedVehicleId: number | null
    filters: {
        searchQuery: string
        status: string
        typeKey: string
    }
    isPolling: boolean
    remainingTime: number
    pollingInterval: any
    countdownInterval: any
}

export const useMapStore = defineStore('map', {
    state: (): MapState => ({
        vehicles: { type: 'FeatureCollection', features: [] },
        selectedVehicleId: null,
        filters: {
            searchQuery: '',
            status: 'all',
            typeKey: 'all'
        },
        isPolling: false,
        remainingTime: 30,
        pollingInterval: null,
        countdownInterval: null
    }),

    getters: {
        filteredFeatures(state) {
            if (!state.vehicles?.features) return []
            const q = (state.filters.searchQuery || '').toLowerCase()
            return state.vehicles.features.filter((f: any) => {
                const name = (f.properties?.asset_number || '').toLowerCase()
                const matchSearch = q === '' || name.includes(q)
                const matchStatus = state.filters.status === 'all' || f.properties?.status === state.filters.status
                return matchSearch && matchStatus
            })
        },

        filteredVehiclesGeoJSON(): any {
            return {
                type: 'FeatureCollection',
                features: this.filteredFeatures
            }
        }
    },

    actions: {
        async fetchLive() {
            try {
                const token = localStorage.getItem('token');

                const { data } = await axios.get('http://127.0.0.1:8000/api/map/live', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                this.vehicles = data;
                this.remainingTime = 30;

            } catch (error) {
                console.error('Failed to fetch live map data:', error);
            }
        },

        startPolling() {
            if (this.isPolling) return

            this.isPolling = true
            this.fetchLive()

            this.countdownInterval = setInterval(() => {
                if (this.remainingTime > 0) {
                    this.remainingTime--
                }
            }, 1000)

            this.pollingInterval = setInterval(() => {
                this.fetchLive()
            }, 30000)
        },

        stopPolling() {
            clearInterval(this.pollingInterval)
            clearInterval(this.countdownInterval)
            this.isPolling = false
            this.pollingInterval = null
            this.countdownInterval = null
        },

        selectVehicle(id: number | null) {
            this.selectedVehicleId = id
        }
    }
})