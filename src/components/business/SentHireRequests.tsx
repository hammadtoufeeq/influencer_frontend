import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileContract } from '@fortawesome/free-solid-svg-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cancelHire } from '../../api/business'
import { myHiresQuery } from '../../api/queries'
import ConfirmDialog from '../admin-panel/ConfirmDialog'
import HireRequestCard from './HireRequestCard'
import type { HireRequest } from '../../types/business'
import { getApiError } from '../../utils/apiError'

// Business dashboard: bheji hui hire requests aur un ki halat
function SentHireRequests() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: hires, isLoading } = useQuery(myHiresQuery)
  const [toCancel, setToCancel] = useState<HireRequest | null>(null)

  const cancel = useMutation({
    mutationFn: (id: string) => cancelHire(id),
    onSuccess: () => {
      toast.success(t('hire.cancelled'))
      setToCancel(null)
      queryClient.invalidateQueries({ queryKey: myHiresQuery.queryKey })
    },
    onError: (error) => {
      toast.error(getApiError(error).message)
      setToCancel(null)
    },
  })

  return (
    <section>
      <h2 className="text-lg font-semibold">{t('hire.sentTitle')}</h2>
      <p className="text-sm text-gray-500">{t('hire.sentSubtitle')}</p>

      {isLoading && <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white shadow-sm" />}
      {!isLoading && !hires?.length && (
        <p className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center text-sm text-gray-500">
          {t('hire.sentEmpty')}
        </p>
      )}
      {!!hires?.length && (
        <ul className="mt-4 space-y-3">
          {hires.map((hire) => (
            <HireRequestCard key={hire._id} hire={hire} who="talent">
              {hire.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => setToCancel(hire)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
                >
                  {t('hire.cancel')}
                </button>
              )}
              {/* Accept ke baad: muahida banao ya kholo */}
              {hire.status === 'accepted' && (
                <Link
                  to={hire.agreement ? `/agreements/${hire.agreement}` : `/agreements/new?hire=${hire._id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
                >
                  <FontAwesomeIcon icon={faFileContract} />
                  {hire.agreement ? t('agreements.view') : t('agreements.draft')}
                </Link>
              )}
            </HireRequestCard>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!toCancel}
        title={t('hire.cancelTitle')}
        tone="danger"
        isBusy={cancel.isPending}
        onConfirm={() => toCancel && cancel.mutate(toCancel._id)}
        onCancel={() => setToCancel(null)}
      >
        <p>{t('hire.cancelBody', { name: toCancel?.person?.name ?? '' })}</p>
      </ConfirmDialog>
    </section>
  )
}

export default SentHireRequests
