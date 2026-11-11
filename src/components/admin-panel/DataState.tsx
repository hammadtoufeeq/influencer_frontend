import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import axios from 'axios'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowsRotate,
  faCloudArrowDown,
  faInbox,
  faLock,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'

interface DataStateProps {
  isLoading: boolean
  // Sirf tab jab dikhane ko kuch nahi (pehli dafa load fail). Pages "isError && !data" dete hain:
  // peeche ka refresh fail ho to purana data dikhta rahe, error box se jhapakta nahi
  isError: boolean
  isEmpty: boolean
  // Error kis qism ka hai (404, 403, network) ye dekhne ke liye
  error?: unknown
  emptyTitle?: string
  emptyText?: string
  emptyIcon?: IconDefinition
  // Detail page: "wapas list pe" ka link
  backTo?: string
  onRetry?: () => void
  children: ReactNode
}

type ErrorKind = 'notFound' | 'forbidden' | 'offline' | 'server'

function errorKind(error: unknown): ErrorKind {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status === 404) return 'notFound'
    if (status === 401 || status === 403) return 'forbidden'
    if (!error.response) return 'offline'
  }
  return 'server'
}

const ERROR_ICONS: Record<ErrorKind, IconDefinition> = {
  notFound: faMagnifyingGlass,
  forbidden: faLock,
  offline: faCloudArrowDown,
  server: faCloudArrowDown,
}

// Saaf, pur-sukoon paigham: icon, heading, ek line aur zaroorat ho to button
function StateCard({
  icon,
  title,
  text,
  children,
  dashed,
}: {
  icon: IconDefinition
  title: string
  text?: string
  children?: ReactNode
  dashed?: boolean
}) {
  return (
    <div
      className={`rounded-2xl bg-white px-6 py-14 text-center ${
        dashed ? 'border border-dashed border-gray-300' : 'shadow-sm ring-1 ring-gray-200/70'
      }`}
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <FontAwesomeIcon icon={icon} />
      </span>
      <p className="mt-4 font-semibold text-gray-900">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{text}</p>}
      {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}

// Loading, error aur khali halat ek jagah
function DataState({
  isLoading,
  isError,
  isEmpty,
  error,
  emptyTitle,
  emptyText,
  emptyIcon = faInbox,
  backTo,
  onRetry,
  children,
}: DataStateProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label={t('common.loading')}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-gray-200/70" />
        ))}
      </div>
    )
  }

  const back = backTo && (
    <Link
      to={backTo}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
    >
      <FontAwesomeIcon icon={faArrowLeft} className="text-xs rtl:rotate-180" />
      {t('dataState.backToList')}
    </Link>
  )

  if (isError) {
    const kind = errorKind(error)
    return (
      <div role="status">
        <StateCard
          icon={ERROR_ICONS[kind]}
          title={t(`dataState.${kind}Title`)}
          text={t(`dataState.${kind}Text`)}
        >
          {onRetry && kind !== 'notFound' && kind !== 'forbidden' && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
            >
              <FontAwesomeIcon icon={faArrowsRotate} className="text-xs" />
              {t('common.retry')}
            </button>
          )}
          {back}
        </StateCard>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <StateCard
        icon={emptyIcon}
        title={emptyTitle ?? t('dataState.emptyTitle')}
        text={emptyText ?? t('dataState.emptyText')}
        dashed
      >
        {back}
      </StateCard>
    )
  }
  return <>{children}</>
}

export default DataState
