import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'

// Page ka kitna hissa neeche aa kar button dikhe
const SHOW_FROM = 0.02
const RADIUS = 24
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Home aur About page: neeche right kone mein "upar jao" button. Kinare ka gol daira batata hai
// ke page kitna scroll ho chuka (0 se 100%)
function ScrollProgressButton() {
  const { t } = useTranslation()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    // Har scroll pe nahi, har frame mein ek dafa
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const visible = progress >= SHOW_FROM
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Portal: page ki entry animation (transform) fixed button ko page ke andar na baandhe
  return createPortal(
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
      aria-label={t('footer.backToTop')}
      title={t('footer.backToTop')}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`group fixed end-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-900 shadow-[0_10px_30px_rgb(23_23_23_/_18%)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgb(23_23_23_/_24%)] focus-visible:ring-4 focus-visible:ring-gray-900/20 focus-visible:outline-none sm:end-8 sm:bottom-8 ${
        visible ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-75 opacity-0'
      }`}
    >
      {/* Progress ka daira: halka track + gehri bharti hui line (upar se ghadi ki suiyon ki taraf) */}
      <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r={RADIUS} fill="none" strokeWidth="3" className="stroke-gray-200" />
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          className="stroke-gray-900 transition-[stroke-dashoffset] duration-150 ease-out"
        />
      </svg>
      <FontAwesomeIcon
        icon={faArrowUp}
        className="relative text-base transition duration-300 group-hover:-translate-y-0.5"
      />
    </button>,
    document.body,
  )
}

export default ScrollProgressButton
