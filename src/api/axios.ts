import axios, { type InternalAxiosRequestConfig } from 'axios'

// '/api' isi website ka address hai. Local pe Vite proxy aur Vercel pe
// vercel.json ka rewrite is request ko backend tak pohanchata hai
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// In URLs pe 401 aaye to refresh try nahi karte
const SKIP_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

// Ek waqt mein sirf ek refresh request chale
let refreshPromise: Promise<unknown> | null = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const failedRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    if (status !== 401 || !failedRequest) return Promise.reject(error)
    if (SKIP_REFRESH.includes(failedRequest.url ?? '')) return Promise.reject(error)
    if (failedRequest._retry) return Promise.reject(error)

    failedRequest._retry = true

    try {
      refreshPromise ??= api.post('/auth/refresh').finally(() => {
        refreshPromise = null
      })
      await refreshPromise
      return api(failedRequest)
    } catch {
      return Promise.reject(error)
    }
  },
)

export default api
