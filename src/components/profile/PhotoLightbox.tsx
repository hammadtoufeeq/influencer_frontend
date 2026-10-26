import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faXmark } from '@fortawesome/free-solid-svg-icons'

// Talent ki photo poori screen pe, Instagram jaisa: andhera pas-e-manzar, photo zoom ho kar
// khulti hai. Esc, ✕ ya bahar click se band
function PhotoLightbox({
  src,
  name,
  caption,
  verified,
  onClose,
}: {
  src: string
  name: string
  caption?: string
  verified?: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    // Peeche wala page na hile
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
      className="keep-dark fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md motion-safe:animate-fade"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={t('common.close')}
        className="absolute end-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg text-white ring-1 ring-white/20 transition hover:rotate-90 hover:bg-white/20"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>

      <figure
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-lg flex-col items-center motion-safe:animate-zoom-in"
      >
        <img
          src={src}
          alt={name}
          className="max-h-[78vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl shadow-black/60 ring-1 ring-white/10"
        />
        <figcaption className="mt-4 text-center text-white">
          <p className="flex items-center justify-center gap-1.5 font-display text-lg font-bold">
            {name}
            {verified && <FontAwesomeIcon icon={faCircleCheck} className="text-sm text-sky-400" />}
          </p>
          {caption && <p className="mt-0.5 text-sm text-white/65">{caption}</p>}
        </figcaption>
      </figure>
    </div>,
    document.body,
  )
}

export default PhotoLightbox
