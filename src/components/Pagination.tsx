import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

function pageNumbers(page: number, totalPages: number): (number | '…')[] {
  const out: (number | '…')[] = []
  const push = (v: number | '…') => out.push(v)
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i)
    return out
  }
  push(1)
  if (page > 3) push('…')
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) push(i)
  if (page < totalPages - 2) push('…')
  push(totalPages)
  return out
}

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null

  const btn =
    'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-gray-200 disabled:hover:shadow-sm'
  const numBtn = (active: boolean) =>
    `flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition duration-300 ${
      active
        ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
        : 'border border-gray-200 bg-white text-gray-700 hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-md'
    }`

  const nums = pageNumbers(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs rtl:rotate-180" />
        <span className="hidden sm:inline">{t('common.previous')}</span>
      </button>

      <div className="flex items-center gap-1.5">
        {nums.map((n, i) =>
          n === '…' ? (
            <span key={`dot-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onChange(n)}
              aria-current={n === page ? 'page' : undefined}
              className={numBtn(n === page)}
            >
              {n}
            </button>
          ),
        )}
      </div>

      <button
        className={btn}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <span className="hidden sm:inline">{t('common.next')}</span>
        <FontAwesomeIcon icon={faChevronRight} className="text-xs rtl:rotate-180" />
      </button>
    </nav>
  )
}

export default Pagination