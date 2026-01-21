import axios from 'axios'
import { API_URL } from '../utils/env'
import { clearToken, getToken } from './token'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken()
    }
    return Promise.reject(err)
  },
)
