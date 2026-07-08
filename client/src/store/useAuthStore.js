import { create } from 'zustand'
import api from '../api/axios'

export const useAuthStore = create((set) => ({
  user:      null,
  token:     localStorage.getItem('rn_token') || null,
  loading:   false,
  authReady: !localStorage.getItem('rn_token'), // true immediately when there's no token

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('rn_token', data.token)
      set({ user: data.user, token: data.token, loading: false, authReady: true })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  register: async (name, email, phone, password) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/register', { name, email, phone, password })
      localStorage.setItem('rn_token', data.token)
      set({ user: data.user, token: data.token, loading: false, authReady: true })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('rn_token')
    set({ user: null, token: null, authReady: true })
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, authReady: true })
    } catch {
      localStorage.removeItem('rn_token')
      set({ user: null, token: null, authReady: true })
    }
  },
}))
