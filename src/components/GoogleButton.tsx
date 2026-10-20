import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getGoogleConfig } from '../api/auth'

// Google Identity Services (accounts.google.com/gsi/client) ka utna hissa jo hum use karte hain
interface GoogleId {
  initialize: (options: {
    client_id: string
    callback: (response: { credential?: string }) => void
    ux_mode?: 'popup'
    context?: 'signin' | 'signup'
  }) => void
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } }
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptPromise: Promise<void> | null = null

// Script sirf ek dafa load ho
function loadScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Google script failed to load'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

// Pichli dafa ka client ID: reload pe server ke jawab ka intezaar kiye baghair button foran
const CACHE_KEY = 'googleClientId'
function cachedClientId() {
  try {
    return localStorage.getItem(CACHE_KEY)
  } catch {
    return null
  }
}

function GoogleButton({
  mode,
  onCredential,
  divider,
  hint,
  busy = false,
}: {
  mode: 'signin' | 'signup'
  onCredential: (credential: string) => void
  divider?: string
  hint?: string
  busy?: boolean
}) {
  const { t, i18n } = useTranslation()
  const wrap = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const latest = useRef(onCredential)
  const [failed, setFailed] = useState(false)
  const { data, isPending } = useQuery({
    queryKey: ['auth', 'google-config'],
    queryFn: getGoogleConfig,
    staleTime: Infinity,
    retry: 1,
  })
  const envClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()
  // Server ka jawab aa gaya ho to wahi; warna Vercel env ya pichli dafa ka yaad rakha hua
  const clientId =
    (data?.enabled ? data.clientId : null) ||
    envClientId ||
    // Server ne jawab na diya (ya abhi soch raha hai): pichli dafa wala
    (!data ? cachedClientId() : null) ||
    null

  // Server ka jawab yaad rakho (band ho jaye to bhool jao)
  useEffect(() => {
    if (!data) return
    try {
      if (data.enabled && data.clientId) localStorage.setItem(CACHE_KEY, data.clientId)
      else localStorage.removeItem(CACHE_KEY)
    } catch {
      // Private window: koi baat nahi
    }
  }, [data])

  // Google ki script foran load karna shuru: client ID ka intezaar nahi
  useEffect(() => {
    loadScript().catch(() => setFailed(true))
  }, [])

  useEffect(() => {
    latest.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!clientId) return
    let cancelled = false
    loadScript()
      .then(() => {
        const google = window.google?.accounts.id
        if (cancelled || !google || !box.current || !wrap.current) return
        google.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          context: mode,
          callback: (response) => response.credential && latest.current(response.credential),
        })
        const { offsetWidth: width, offsetHeight: height } = wrap.current
        const googleWidth = Math.min(400, Math.max(200, width))
        box.current.innerHTML = ''
        google.renderButton(box.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          locale: i18n.language,
          width: googleWidth,
        })
        box.current.style.width = `${googleWidth}px`
        box.current.style.transform = `scale(${width / googleWidth}, ${height / 40})`
        setReady(true)
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [clientId, mode, i18n.language])

  // Server abhi soch raha hai (aur kuch yaad nahi): button ki jagah pehle se dikhao, dabega nahi
  if (failed || (!clientId && !isPending)) return null
  return (
    <div className="space-y-4">
      {divider && (
        <div
          className="flex items-center gap-3 text-xs font-medium tracking-wide text-gray-400 uppercase"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200 rtl:bg-gradient-to-l" />
          {divider}
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200 rtl:bg-gradient-to-r" />
        </div>
      )}
      <div ref={wrap} className={`group relative h-12 w-full ${busy ? 'pointer-events-none' : ''}`}>
        {/*
          ✅ INVERSE button:
          - Light mode: dark bg + white text
          - Dark mode: white bg + dark text
          Tailwind v4 auto-invert se yeh khud ho jata hai:
          - Light: bg-gray-900 (dark) + text-white (light)
          - Dark: bg-gray-900 invert → light + text-white invert → dark
        */}
        <div
          aria-hidden="true"
          className={`flex h-full w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-gray-900 text-[15px] font-semibold text-white shadow-sm transition duration-200 group-hover:-translate-y-px group-hover:bg-gray-800 group-hover:shadow-[0_10px_24px_rgb(23_23_23_/_20%)] group-focus-within:ring-2 group-focus-within:ring-gray-900/15 ${
            ready && !busy ? '' : 'opacity-60'
          }`}
        >
          {busy ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <GoogleLogo />
          )}
          {mode === 'signup' ? t('register.googleButton') : t('login.googleButton')}
        </div>
        <div
          ref={box}
          className="absolute start-0 top-0 origin-top-left overflow-hidden opacity-[0.01] rtl:origin-top-right"
        />
      </div>
      {hint && <p className="text-center text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

// Google ka rangeen "G" (Google ke branding qawaid ke mutabiq)
function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

export default GoogleButton