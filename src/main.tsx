import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthProvider.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import { queryClient } from './context/reactQueryContext'
import './index.css'
import './i18n'
import App from './App.tsx'
import LanguageRoot from './components/LanguageRoot'
import AppToaster from './components/AppToaster'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LanguageRoot>
              <App />
            </LanguageRoot>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      <AppToaster />
      {/* Sirf development mein dikhta hai: cache ke andar kya hai */}
      
    </QueryClientProvider>
  </StrictMode>,
)
