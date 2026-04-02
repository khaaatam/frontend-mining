import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.role === 'Admin',
  },
  actions: {
    async login(credentials: { email: string; password: string }) {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/login', credentials)

        // Ambil data dari response format standard lu
        const { user, token, role } = response.data.data

        this.token = token
        this.role = role
        this.user = user

        localStorage.setItem('token', token)
        localStorage.setItem('role', role)
        localStorage.setItem('user', JSON.stringify(user))

        return response.data
      } catch (error: any) {
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
