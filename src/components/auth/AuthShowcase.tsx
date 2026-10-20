import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faFileSignature, faUsers } from '@fortawesome/free-solid-svg-icons'
import { peopleQuery } from '../../api/queries'
import { PLATFORM_NAME } from '../../constants/config'
import { formatCount } from '../../utils/format'
import { Photo } from '../home/HomeSections'

const BG_IMAGE =
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=70'

// Teen tirchhe, tairte hue cards ki jagah aur jhukao
const CARD_POSITIONS = [
  'start-0 top-10 w-[42%] -rotate-6',
  'start-[29%] top-0 z-10 w-[44%] rotate-2',
  'end-0 top-14 w-[40%] rotate-6',
]

// Login / signup ka left panel: Home ke hero jaisa andhera, asal logon ki tairti photos
function AuthShowcase({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children?: ReactNode
}) {
  const { t } = useTranslation()
  const { data } = useQuery(peopleQuery(new URLSearchParams({ limit: '12', sort: 'followers' })))
  const people = data?.people ?? []
  // Photo walon ko pehle
  const withPhotos = [...people].sort((a, b) => Number(!!b.photoUrl) - Number(!!a.photoUrl))
  const stage = withPhotos.slice(0, 3)
  const faces = withPhotos.slice(3, 8)
  const reach = people.reduce((sum, p) => sum + p.totalFollowers, 0)
  const total = data?.meta.total ?? 0

  return (
    <aside className="keep-dark relative isolate flex flex-col overflow-clip bg-brand-plum px-6 py-7 text-white sm:px-10 sm:py-10 lg:min-h-[660px]">
      {/* Peeche: halki tasveer, roshni ke dhabbe, neeche andhera */}
      <img
        src={BG_IMAGE}
        alt=""
        onError={(e) => (e.currentTarget.style.display = 'none')}
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
      />
      <div className="absolute -start-24 -top-24 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl motion-safe:animate-drift" />
      <div
        className="absolute -bottom-28 -end-16 -z-10 h-96 w-96 rounded-full bg-gray-400/20 blur-3xl motion-safe:animate-drift"
        style={{ animationDelay: '-7s' }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-plum via-brand-plum/70 to-brand-plum/30" />

      {/* Lamba form ho to bhi panel ka content scroll ke saath nazar mein rahe */}
      <div className="flex flex-1 flex-col lg:sticky lg:top-24 lg:max-h-[620px] lg:min-h-[580px]">
        <Link to="/" className="flex w-fit items-center gap-2.5">
          <img src="/logo.svg?v=1" alt="" className="h-9 w-9 rounded-full ring-1 ring-white/20" />
          <span className="font-display text-base font-bold tracking-tight">{PLATFORM_NAME}</span>
        </Link>

        {/* Tairti photos (sirf bari screen) */}
        <div
          className="relative mx-auto mt-10 hidden h-64 w-full max-w-sm lg:block"
          aria-hidden="true"
        >
          {stage.map((person, i) => (
            <div
              key={person._id}
              className={`absolute ${CARD_POSITIONS[i]} overflow-hidden rounded-3xl shadow-2xl shadow-black/50 ring-1 ring-white/20 motion-safe:animate-float`}
              style={{ animationDelay: `${i * -2.3}s` }}
            >
              <Photo
                person={person}
                className="aspect-[3/4] w-full"
                fallbackClass="items-start pt-[30%] text-2xl text-white/80"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2.5 pt-8">
                <p className="flex items-center gap-1 truncate text-xs font-semibold">
                  <span className="truncate">{person.name}</span>
                  {person.verified && (
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="shrink-0 text-[10px] text-sky-300"
                    />
                  )}
                </p>
              </div>
            </div>
          ))}
          {/* Shishe jaise chips */}
          <span className="absolute -start-3 top-[34%] z-20 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur-md motion-safe:animate-float-slow">
            <FontAwesomeIcon icon={faCircleCheck} className="text-sky-300" />
            {t('site.verified')}
          </span>
          {reach > 0 && (
            <span className="absolute end-0 -top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-gray-900 shadow-lg motion-safe:animate-float">
              <FontAwesomeIcon icon={faUsers} className="text-gray-500" />
              {formatCount(reach)}
            </span>
          )}
          <span
            className="absolute -end-3 top-[52%] z-20 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-semibold ring-1 ring-white/25 backdrop-blur-md motion-safe:animate-float"
            style={{ animationDelay: '-3s' }}
          >
            <FontAwesomeIcon icon={faFileSignature} className="text-green-300" />
            {t('home.mockSigned')}
          </span>
        </div>

        <div className="mt-6 lg:mt-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-[15px]">
            {subtitle}
          </p>
          {children}

          {faces.length > 0 && (
            <div className="mt-6 hidden items-center gap-3 sm:flex">
              <div className="flex -space-x-2.5 rtl:space-x-reverse">
                {faces.map((person) => (
                  <Photo
                    key={person._id}
                    person={person}
                    className="h-9 w-9 rounded-full text-[10px] ring-2 ring-brand-plum"
                  />
                ))}
              </div>
              {total > 0 && (
                <p className="text-xs text-white/70">{t('auth.joinCount', { count: total })}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default AuthShowcase
