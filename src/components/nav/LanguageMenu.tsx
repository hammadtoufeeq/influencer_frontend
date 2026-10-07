import { useCallback, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faGlobe } from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { useDismiss } from '../../hooks/useDismiss'

// Document: English, Urdu (RTL) aur Arabic (RTL). Abhi sirf English chalti hai
const LANGUAGES = [
  { code: 'en', label: 'English', ready: true },
  { code: 'ur', label: 'اردو', ready: false },
  { code: 'ar', label: 'العربية', ready: false },
]

function LanguageMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  function choose(language: (typeof LANGUAGES)[number]) {
    setOpen(false)
    if (!language.ready) toast(`${language.label}: coming soon`)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
      >
        <FontAwesomeIcon icon={faGlobe} />
        <span>EN</span>
      </button>
      {open && (
        <ul className="absolute right-0 z-30 mt-2 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {LANGUAGES.map((language) => (
            <li key={language.code}>
              <button
                onClick={() => choose(language)}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span>{language.label}</span>
                {language.ready ? (
                  <FontAwesomeIcon icon={faCheck} className="text-xs text-gray-900" />
                ) : (
                  <span className="text-xs text-gray-400">soon</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LanguageMenu
