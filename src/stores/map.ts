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
    vehicleTypes: any[];
}

export const useMapStore = defineStore('map', {
    state: (): MapState => ({
        vehicles: { type: 'FeatureCollection', features: [] },
        vehicleTypes: [] as any[],
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
        statusCounts(state) {
            if (!state.vehicles || !state.vehicles.features) return { active: 0, idle: 0, maintenance: 0 };
            const features = state.vehicles.features;
            return {
                active: features.filter((f: any) => f.properties.status === 'active').length,
                idle: features.filter((f: any) => f.properties.status === 'idle').length,
                maintenance: features.filter((f: any) => f.properties.status === 'maintenance').length,
            };
        },

        filteredFeatures(state): any[] {
            // Pastikan data benar-benar ada dan bentuknya array
            if (!state.vehicles || !Array.isArray(state.vehicles.features)) return [];

            return state.vehicles.features.filter((feature: any) => {
                const props = feature.properties;
                if (!props) return false;

                const searchQ = String(state.filters?.searchQuery || '').toLowerCase();
                const assetNo = String(props.asset_number || '').toLowerCase();
                const matchesSearch = searchQ === '' || assetNo.includes(searchQ);

                const filterStatus = String(state.filters?.status || 'all').toLowerCase();
                const propsStatus = String(props.status || '').toLowerCase();
                const matchesStatus = filterStatus === 'all' || propsStatus === filterStatus;

                // 3. FILTER TYPE (Aman dari null)
                let matchesType = true;
                const filterType = String(state.filters?.typeKey || 'all').toLowerCase();

                if (filterType !== 'all') {
                    const propTypeKey = String(props.type_key || '').toLowerCase();
                    const propTypeName = String(props.type_name || '').toLowerCase();

                    const propVehicleTypeId = String(props.vehicle_type_id || '');

                    matchesType = (propTypeKey === filterType) ||
                        (propTypeName === filterType) ||
                        (propVehicleTypeId === filterType);
                }

                return matchesSearch && matchesStatus && matchesType;
            });
        },

        filteredVehiclesGeoJSON(): any {
            return {
                type: 'FeatureCollection',
                features: this.filteredFeatures
            }
        }
    },

    actions: {
        async fetchVehicleTypes() {
            try {
                const response = await axios.get('http://localhost:8000/api/vehicle-types', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                })

                if (response.data.data) {
                    this.vehicleTypes = response.data.data
                } else {
                    this.vehicleTypes = response.data
                }
            } catch (error) {
                console.error('Gagal narik tipe kendaraan:', error)
            }
        },

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