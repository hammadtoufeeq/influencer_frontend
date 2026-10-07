import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthProvider.tsx'
import './index.css'
import './i18n'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minute tak data "fresh" hai: dobara API call nahi hogi, cache se foran dikhega
      staleTime: 5 * 60 * 1000,
      // Kisi page pe use na ho to bhi 30 minute tak cache mein rakho
      gcTime: 30 * 60 * 1000,
      // Tab badal kar wapas aane pe har dafa dobara fetch mat karo
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="bottom-right" />
      {/* Sirf development mein dikhta hai: cache ke andar kya hai */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
