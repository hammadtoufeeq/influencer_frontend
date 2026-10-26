import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpand } from '@fortawesome/free-solid-svg-icons'
import { initials } from '../../utils/format'
import PhotoLightbox from './PhotoLightbox'
import { rise } from './profileStyles'

export interface HeroStat {
  icon: IconDefinition
  value: ReactNode
  label: string
  // Click pe kahin le jaye (jaise #reviews)
  href?: string
}

// Detail pages ka upar wala hissa: dhundli photo ka cover, ghoomte ring wali photo / logo
// (click pe poori screen), naam, badges, chips, buttons aur neeche stats ki patti
function ProfileHero({
  name,
  photo,
  shape = 'round',
  fallbackIcon,
  badges,
  subtitle,
  chips,
  actions,
  coverTag,
  stats,
  caption,
  verified,
}: {
  name: string
  photo?: string
  // Insaan gol, business / campaign ka logo chaukor
  shape?: 'round' | 'square'
  // Photo na ho to initials ki jagah icon (jaise campaign)
  fallbackIcon?: IconDefinition
  badges?: ReactNode
  subtitle?: ReactNode
  chips?: ReactNode
  actions?: ReactNode
  coverTag?: ReactNode
  stats?: HeroStat[]
  caption?: string
  verified?: boolean
}) {
  const { t } = useTranslation()
  const [viewing, setViewing] = useState(false)
  const [failed, setFailed] = useState(false)
  const image = photo && !failed ? photo : undefined
  const round = shape === 'round'
  const radius = round ? 'rounded-full' : 'rounded-[28px]'

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200/70 motion-safe:animate-fade-up">
      {/* Cover: usi photo ka dhundla roop, chalti roshni */}
      <div className="keep-dark relative isolate h-36 overflow-hidden bg-brand-plum sm:h-52">
        {image && (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-60 blur-2xl motion-safe:animate-hero-zoom"
          />
        )}
        <div className="absolute -start-16 -top-20 -z-10 h-64 w-64 rounded-full bg-white/15 blur-3xl motion-safe:animate-drift" />
        <div
          className="absolute -end-10 -bottom-24 -z-10 h-72 w-72 rounded-full bg-gray-400/25 blur-3xl motion-safe:animate-drift"
          style={{ animationDelay: '-6s' }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {coverTag && <div className="absolute end-4 top-4">{coverTag}</div>}
      </div>

      <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Photo / logo, ghoomta ring; click pe poori photo */}
            <button
              type="button"
              disabled={!image}
              onClick={() => setViewing(true)}
              aria-label={image ? t('profile.viewPhoto', { name }) : name}
              className={`group relative -mt-16 w-fit shrink-0 disabled:cursor-default sm:-mt-20 ${radius}`}
            >
              <span
                aria-hidden="true"
                className={`absolute -inset-1 bg-[conic-gradient(from_0deg,#111827,#9ca3af,#f9fafb,#6b7280,#111827)] ${radius} ${
                  round ? 'motion-safe:animate-spin-slow' : ''
                }`}
              />
              <span
                className={`relative block h-32 w-32 overflow-hidden bg-gray-200 ring-4 ring-white sm:h-40 sm:w-40 ${radius}`}
              >
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    onError={() => setFailed(true)}
                    className={`h-full w-full transition duration-500 group-enabled:group-hover:scale-110 ${
                      round ? 'object-cover object-[center_20%]' : 'bg-white object-contain p-3'
                    }`}
                  />
                ) : (
                  <span className="keep-dark flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-600 to-gray-900 font-display text-4xl font-bold text-white">
                    {fallbackIcon ? <FontAwesomeIcon icon={fallbackIcon} /> : initials(name)}
                  </span>
                )}
                {image && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                    <FontAwesomeIcon icon={faExpand} className="text-xl" />
                  </span>
                )}
              </span>
            </button>

            <div className="min-w-0 motion-safe:animate-fade-up sm:pt-5" style={rise(0)}>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-extrabold tracking-tight break-words text-gray-950 md:text-4xl">
                  {name}
                </h1>
                {badges}
              </div>
              {subtitle && <div className="mt-1 text-base text-gray-600 md:text-lg">{subtitle}</div>}
              {chips && <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">{chips}</div>}
            </div>
          </div>

          {actions && (
            <div
              className="flex flex-col gap-2 motion-safe:animate-fade-up sm:flex-row sm:flex-wrap md:mt-5 md:w-52 md:shrink-0 md:flex-col"
              style={rise(1)}
            >
              {actions}
            </div>
          )}
        </div>
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 divide-gray-100 border-t border-gray-100 md:grid-cols-4 md:divide-x rtl:md:divide-x-reverse">
          {stats.map((stat) => {
            const body = (
              <div className="flex min-w-0 items-center gap-3 px-3 py-4 sm:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <FontAwesomeIcon icon={stat.icon} />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base leading-tight font-bold break-words text-gray-900 sm:text-xl">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs leading-tight text-gray-500">{stat.label}</p>
                </div>
              </div>
            )
            if (!stat.href) return <div key={stat.label}>{body}</div>
            return stat.href.startsWith('#') ? (
              <a key={stat.label} href={stat.href} className="transition hover:bg-gray-50">
                {body}
              </a>
            ) : (
              <Link key={stat.label} to={stat.href} className="transition hover:bg-gray-50">
                {body}
              </Link>
            )
          })}
        </div>
      )}

      {viewing && image && (
        <PhotoLightbox
          src={image}
          name={name}
          caption={caption}
          verified={verified}
          onClose={() => setViewing(false)}
        />
      )}
    </section>
  )
}

// Hero ke chips ki shakal
export function HeroChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1">
      {children}
    </span>
  )
}

export default ProfileHero
