import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const buttonClass =
    'rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
      <button className={buttonClass} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <FontAwesomeIcon icon={faChevronLeft} className="mr-1.5 text-xs" />
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        className={buttonClass}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
        <FontAwesomeIcon icon={faChevronRight} className="ml-1.5 text-xs" />
      </button>
    </nav>
  )
}

export default Pagination
