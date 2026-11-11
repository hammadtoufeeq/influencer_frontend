import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight, faQuoteLeft } from '@fortawesome/free-solid-svg-icons'
import Avatar from '../Avatar'
import { TESTIMONIALS, type Testimonial } from '../../constants/testimonials'

const SLIDE_MS = 7000

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Home page: logon ki asal baatein, ek waqt mein ek. Khud chalta hai (mouse / focus pe rukta hai),
// tir ke buttons aur nuqte bhi. List khali ho to kuch nahi dikhata
function TestimonialsSlider({ items = TESTIMONIALS }: { items?: Testimonial[] }) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [autoPlay] = useState(() => !prefersReducedMotion())
  const count = items.length

  useEffect(() => {
    if (!autoPlay || paused || count < 2) return
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') setIndex((i) => (i + 1) % count)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [autoPlay, paused, count])

  if (!count) return null
  const current = items[index % count]
  const go = (step: number) => setIndex((i) => (i + step + count) % count)
  const button =
    'flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-gray-900'

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t('home.testimonialsTitle')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="text-center">
        <h2 className="text-xl font-semibold md:text-2xl">{t('home.testimonialsTitle')}</h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-gray-500">{t('home.testimonialsSubtitle')}</p>
      </div>

      <figure
        key={index}
        aria-live={paused ? 'polite' : 'off'}
        className="relative mx-auto mt-8 max-w-3xl rounded-3xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-gray-100 motion-safe:animate-page-in md:px-14"
      >
        <FontAwesomeIcon icon={faQuoteLeft} className="text-3xl text-gray-200 rtl:-scale-x-100" />
        {/* Quote apni zaban ki simt mein (Arabic page pe English quote ulta na ho) */}
        <blockquote dir="auto" className="mt-4 text-lg leading-relaxed text-gray-800 md:text-xl">
          <bdi>“{current.quote}”</bdi>
        </blockquote>
        <figcaption className="mt-6 flex items-center justify-center gap-3 text-start">
          <Avatar name={current.name} photoUrl={current.photoUrl} size="md" />
          <span>
            <span className="block font-semibold">{current.name}</span>
            {(current.role || current.company) && (
              <span className="block text-sm text-gray-500">
                {[current.role, current.company].filter(Boolean).join(', ')}
              </span>
            )}
          </span>
        </figcaption>
      </figure>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" aria-label={t('home.previous')} onClick={() => go(-1)} className={button}>
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs rtl:rotate-180" />
          </button>
          <div className="flex gap-2">
            {items.map((item, i) => (
              <button
                key={item.name + i}
                type="button"
                aria-label={t('home.testimonialOf', { number: i + 1, total: count })}
                aria-current={i === index % count}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index % count ? 'w-6 bg-brand' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <button type="button" aria-label={t('home.next')} onClick={() => go(1)} className={button}>
            <FontAwesomeIcon icon={faChevronRight} className="text-xs rtl:rotate-180" />
          </button>
        </div>
      )}
    </section>
  )
}

export default TestimonialsSlider
