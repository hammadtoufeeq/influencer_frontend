import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

interface AdminPagerProps {
  page: number
  limit: number
  total: number
  onChange: (page: number) => void
}

// Pagination (translated, RTL mein teer ulte ho jate hain)
function AdminPager({ page, limit, total, onChange }: AdminPagerProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) return null

  const button =
    'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Pagination">
      <button className={button} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <FontAwesomeIcon icon={faChevronLeft} className="text-xs rtl:rotate-180" />
        {t('common.previous')}
      </button>
      <span className="text-sm text-gray-600">
        {t('common.pageOf', { page, total: totalPages })}
      </span>
      <button className={button} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        {t('common.next')}
        <FontAwesomeIcon icon={faChevronRight} className="text-xs rtl:rotate-180" />
      </button>
    </nav>
  )
}

export default AdminPager
