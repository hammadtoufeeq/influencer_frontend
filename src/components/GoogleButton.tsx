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

// "Sign in with Google" / "Sign up with Google" ka asal Google button.
// Server pe GOOGLE_CLIENT_ID na ho to kuch nahi dikhta
function GoogleButton({
  mode,
  onCredential,
  divider,
  dividerAt = 'before',
}: {
  mode: 'signin' | 'signup'
  onCredential: (credential: string) => void
  // "or" wali line: sirf jab button dikhe
  divider?: string
  dividerAt?: 'before' | 'after'
}) {
  const { i18n } = useTranslation()
  const box = useRef<HTMLDivElement>(null)
  const latest = useRef(onCredential)
  const [failed, setFailed] = useState(false)
  const { data } = useQuery({
    queryKey: ['auth', 'google-config'],
    queryFn: getGoogleConfig,
    staleTime: Infinity,
    retry: 1,
  })
  // Pehle server ka client ID; na ho to frontend ke Vercel env (VITE_GOOGLE_CLIENT_ID) wala
  const clientId =
    (data?.enabled ? data.clientId : null) ||
    (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ||
    null

  useEffect(() => {
    latest.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!clientId) return
    let cancelled = false
    loadScript()
      .then(() => {
        const google = window.google?.accounts.id
        if (cancelled || !google || !box.current) return
        google.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          context: mode,
          callback: (response) => response.credential && latest.current(response.credential),
        })
        box.current.innerHTML = ''
        google.renderButton(box.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          logo_alignment: 'center',
          locale: i18n.language,
          width: Math.min(400, Math.max(200, box.current.offsetWidth)),
        })
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [clientId, mode, i18n.language])

  if (!clientId || failed) return null
  const line = divider && (
    <div className="flex items-center gap-3 text-xs text-gray-500" aria-hidden="true">
      <span className="h-px flex-1 bg-gray-200" />
      {divider}
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  )
  return (
    <div className="space-y-5">
      {dividerAt === 'before' && line}
      <div ref={box} className="flex min-h-11 w-full justify-center" />
      {dividerAt === 'after' && line}
    </div>
  )
}

export default GoogleButton
