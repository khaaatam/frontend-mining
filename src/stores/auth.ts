import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && state.token !== 'undefined',
    isAdmin: (state) => state.role === 'admin' || state.role === 'Admin',
  },
  actions: {
    async login(credentials: { email: string; password: string }) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/login', credentials, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        // ambil dari response.data langsung
        const token = response.data.access_token
        const user = response.data.user

        // ekstrak role pertama dari array roles bawaan spatie
        const role = user.roles && user.roles.length > 0 ? user.roles[0].name : null

        this.token = token
        this.role = role
        this.user = user

        localStorage.setItem('token', token)
        localStorage.setItem('role', role || '')
        localStorage.setItem('user', JSON.stringify(user))

        return response.data
      } catch (error: any) {
        console.error('error login frontend:', error) // gw tambahin log ini biar gampang nyari tau kalo ada yg crash lagi
        throw error.response?.data || { message: 'Terjadi kesalahan sistem' }
      }
    },
    logout() {
      this.token = null
      this.role = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
    },
  },
})