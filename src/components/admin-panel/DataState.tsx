import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface DataStateProps {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  emptyText?: string
  onRetry?: () => void
  children: ReactNode
}

// Loading, error aur khali halat ek jagah
function DataState({ isLoading, isError, isEmpty, emptyText, onRetry, children }: DataStateProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
        {t('common.loading')}
      </div>
    )
  }
  if (isError) {
    return (
      <div role="alert" className="rounded-2xl bg-red-50 p-8 text-center text-red-700">
        <p>{t('common.error')}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-3 text-sm font-medium underline">
            {t('common.retry')}
          </button>
        )}
      </div>
    )
  }
  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
        {emptyText ?? t('common.empty')}
      </div>
    )
  }
  return <>{children}</>
}

export default DataState
