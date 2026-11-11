import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileContract } from '@fortawesome/free-solid-svg-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { respondHire } from '../../api/business'
import { incomingHiresQuery } from '../../api/queries'
import ConfirmDialog from '../admin-panel/ConfirmDialog'
import HireRequestCard from './HireRequestCard'
import type { HireRequest } from '../../types/business'
import { getApiError } from '../../utils/apiError'

type Answer = { hire: HireRequest; action: 'accept' | 'decline' }

// Talent dashboard: verified businesses ki aayi hui hire requests. Accept ya decline.
// Manager: apne saare talents ki (manager=true), ya ek talent ki (personId)
function IncomingHireRequests({ personId, manager = false }: { personId?: string; manager?: boolean } = {}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: all, isLoading } = useQuery(incomingHiresQuery)
  const hires = personId ? all?.filter((hire) => hire.person?._id === personId) : all
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [note, setNote] = useState('')

  // Stable rakho: ConfirmDialog har nayi onCancel pe focus Cancel button pe le jata hai
  const close = useCallback(() => {
    setAnswer(null)
    setNote('')
  }, [])

  const respond = useMutation({
    mutationFn: ({ hire, action }: Answer) => respondHire(hire._id, action, note.trim() || undefined),
    onSuccess: (_hire, { action }) => {
      toast.success(action === 'accept' ? t('hire.acceptedToast') : t('hire.declinedToast'))
      close()
      queryClient.invalidateQueries({ queryKey: incomingHiresQuery.queryKey })
    },
    onError: (error) => {
      toast.error(getApiError(error).message)
      close()
    },
  })


  const pending = hires?.filter((hire) => hire.status === 'pending').length ?? 0

  return (
    <section id="hire-requests">
      <h2 className="text-lg font-semibold">
        {t('hire.incomingTitle')}
        {pending > 0 && (
          <span className="ms-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            {pending}
          </span>
        )}
      </h2>
      <p className="text-sm text-gray-500">
        {manager ? t('manager.hiresSubtitle') : t('hire.incomingSubtitle')}
      </p>

      {isLoading && <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white shadow-sm" />}
      {!isLoading && !hires?.length && (
        <p className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center text-sm text-gray-500">
          {manager ? t('manager.hiresEmpty') : t('hire.incomingEmpty')}
        </p>
      )}
      {/* Pehle woh jin ka jawab dena hai, phir purani (accepted / declined / cancelled) */}
      {[
        { key: 'waiting', items: hires?.filter((hire) => hire.status === 'pending') ?? [] },
        { key: 'history', items: hires?.filter((hire) => hire.status !== 'pending') ?? [] },
      ].map(
        (group) =>
          group.items.length > 0 && (
            <div key={group.key} className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">
                {group.key === 'waiting' ? t('hire.needsReply') : t('hire.earlier')}
              </h3>
              <ul className="mt-2 space-y-3">
                {group.items.map((hire) => (
                  <HireRequestCard key={hire._id} hire={hire} who="business" showTalent={manager && !personId}>
                    {hire.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setAnswer({ hire, action: 'decline' })}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {t('hire.decline')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnswer({ hire, action: 'accept' })}
                          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
                        >
                          {t('hire.accept')}
                        </button>
                      </>
                    )}
                    {/* Accept ke baad business muahida bhejta hai */}
                    {hire.status === 'accepted' &&
                      (hire.agreement ? (
                        <Link
                          to={`/agreements/${hire.agreement}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
                        >
                          <FontAwesomeIcon icon={faFileContract} />
                          {t('agreements.view')}
                        </Link>
                      ) : (
                        <p className="text-sm text-gray-500">{t('agreements.waitingForDraft')}</p>
                      ))}
                  </HireRequestCard>
                ))}
              </ul>
            </div>
          ),
      )}

      <ConfirmDialog
        open={!!answer}
        title={answer?.action === 'accept' ? t('hire.acceptTitle') : t('hire.declineTitle')}
        tone={answer?.action === 'accept' ? 'success' : 'danger'}
        confirmLabel={answer?.action === 'accept' ? t('hire.accept') : t('hire.decline')}
        isBusy={respond.isPending}
        onConfirm={() => answer && respond.mutate(answer)}
        onCancel={close}
      >
        <p>
          {t(answer?.action === 'accept' ? 'hire.acceptBody' : 'hire.declineBody', {
            business: answer?.hire.businessProfile?.companyName ?? '',
          })}
        </p>
        {answer?.action === 'accept' && <p className="mt-2">{t('hire.acceptShares')}</p>}
        <label className="mt-3 block">
          <span className="mb-1 block text-sm font-medium text-gray-900">{t('hire.noteLabel')}</span>
          <textarea
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('hire.notePlaceholder')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </label>
      </ConfirmDialog>
    </section>
  )
}

export default IncomingHireRequests
