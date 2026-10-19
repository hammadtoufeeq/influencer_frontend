import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faUserPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import Pagination from '../Pagination'
import { BusinessCard, ManagerCard } from './DirectoryCards'
import { directoryQuery } from '../../api/queries'
import { useAuth } from '../../hooks/useAuth'
import type { DirectoryBusiness, DirectoryManager } from '../../types/directory'

const PAGE_SIZE = 12

type Kind = 'businesses' | 'managers'

// Upar wale card ki tasveerein (Unsplash): businesses ke liye shishe ki office buildings,
// managers ke liye deal / handshake
const HEADER_IMAGES: Record<Kind, string> = {
  businesses:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  managers:
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
}

// Kis account type se sign up (register page pe pehle se chuna hua)
const SIGNUP_TYPE: Record<Kind, string> = { businesses: 'business', managers: 'representative' }

// /businesses aur /managers: jo bhi us qism ka account banaye, yahan aa jata hai
function DirectoryPage({ kind, icon }: { kind: Kind; icon: IconDefinition }) {
  const { t } = useTranslation()
  const { user, isLoading: checkingLogin } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const page = Number(searchParams.get('page')) || 1
  const [draft, setDraft] = useState(q)

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
  if (q) params.set('q', q)
  const { data, isLoading, isError, refetch } = useQuery({
    ...directoryQuery(kind, params),
    placeholderData: keepPreviousData,
  })
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  // Mehman ko "is qism ka account banao" ka button (login ho to nahi)
  const showJoin = !user && !checkingLogin

  function search(e: FormEvent) {
    e.preventDefault()
    setSearchParams(draft.trim() ? { q: draft.trim() } : {})
  }
  function setPage(next: number) {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev)
      nextParams.set('page', String(next))
      return nextParams
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const joinButton = (
    <Link
      to={`/register?type=${SIGNUP_TYPE[kind]}`}
      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
    >
      <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
      {t(`directory.${kind}.join`)}
    </Link>
  )

  let results: ReactNode
  if (isLoading) {
    results = (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-3xl bg-gray-200/70" />
        ))}
      </div>
    )
  } else if (isError) {
    results = (
      <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200/70">
        <p className="font-semibold">{t('common.error')}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          {t('common.retry')}
        </button>
      </div>
    )
  } else if (!data || data.items.length === 0) {
    results = (
      <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center sm:px-6 sm:py-14">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <FontAwesomeIcon icon={q ? faMagnifyingGlass : icon} />
        </span>
        <p className="mt-4 font-semibold">
          {q ? t('directory.noMatch', { term: q }) : t(`directory.${kind}.emptyTitle`)}
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
          {q ? t('directory.noMatchHint') : t(`directory.${kind}.emptyText`)}
        </p>
        {!q && showJoin && <div className="mt-5">{joinButton}</div>}
      </div>
    )
  } else {
    results = (
      <>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {kind === 'businesses'
            ? (data.items as DirectoryBusiness[]).map((b) => (
                <BusinessCard key={b._id} business={b} />
              ))
            : (data.items as DirectoryManager[]).map((m) => (
                <ManagerCard key={m._id} manager={m} />
              ))}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header: mobile pe kam padding, chhota text */}
      <section className="keep-dark relative isolate overflow-hidden rounded-2xl bg-gray-900 px-4 py-8 text-white sm:rounded-3xl sm:px-8 sm:py-10 md:py-14">
        <img
          src={HEADER_IMAGES[kind]}
          alt=""
          decoding="async"
          onError={(e) => (e.currentTarget.style.display = 'none')}
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-950/95 via-gray-950/75 to-gray-950/25 rtl:bg-gradient-to-l" />

        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-[10px] font-medium tracking-wider text-white/60 uppercase sm:text-xs">
            <FontAwesomeIcon icon={icon} />
            {t(`directory.${kind}.eyebrow`)}
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            {t(`directory.${kind}.title`)}
          </h1>
          <p className="mt-1 text-xs text-white/70 sm:text-sm">{t(`directory.${kind}.subtitle`)}</p>

          {/* Search: mobile pe column, sm+ pe row */}
          <form
            onSubmit={search}
            className="mt-4 flex max-w-lg flex-col gap-2 sm:mt-5 sm:flex-row"
            role="search"
          >
            <label className="relative flex-1">
              <span className="sr-only">{t(`directory.${kind}.searchLabel`)}</span>
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t(`directory.${kind}.searchPlaceholder`)}
                className="w-full rounded-xl bg-white py-2.5 ps-11 pe-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/60 sm:py-3 sm:text-base"
              />
              {draft && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft('')
                    setSearchParams({})
                  }}
                  aria-label={t('browse.clearFilter')}
                  className="absolute end-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-xs" />
                </button>
              )}
            </label>
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 sm:py-3"
            >
              {t('common.search')}
            </button>
          </form>
        </div>
      </section>

      {/* Count + join: mobile pe stack, sm+ pe row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {data ? (
            <>
              <span className="font-semibold text-gray-900">{total}</span>{' '}
              {t(`directory.${kind}.count`, { count: total })}
            </>
          ) : (
            ' '
          )}
        </p>
        {showJoin && data && data.items.length > 0 && (
          <div className="self-start sm:self-auto">{joinButton}</div>
        )}
      </div>

      {results}
    </div>
  )
}

export default DirectoryPage
