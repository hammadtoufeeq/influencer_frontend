import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faEnvelopeOpenText, faTrash } from '@fortawesome/free-solid-svg-icons'
import { deleteSubscriber, downloadSubscribersCsv, listSubscribers, type NewsletterSubscriber } from '../../api/newsletter'
import AdminPager from '../../components/admin-panel/AdminPager'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import StatusPill from '../../components/admin-panel/StatusPill'
import { adminErrorMessage, formatDateTime } from '../../utils/adminFormat'

const PAGE_SIZE = 25

// /admin/newsletter -> footer ke form se aaye emails: dekho, CSV nikalo, hatao
function AdminNewsletterPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [toDelete, setToDelete] = useState<NewsletterSubscriber | null>(null)
  const page = Number(params.get('page')) || 1
  const apiParams = new URLSearchParams(params)
  apiParams.set('limit', String(PAGE_SIZE))

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'newsletter', apiParams.toString()],
    queryFn: () => listSubscribers(apiParams),
    placeholderData: keepPreviousData,
  })

  const exportCsv = useMutation({
    mutationFn: downloadSubscribersCsv,
    onError: (err) => toast.error(adminErrorMessage(err)),
  })
  const remove = useMutation({
    mutationFn: (id: string) => deleteSubscriber(id),
    onSuccess: () => {
      toast.success(t('adminNewsletter.deleted'))
      setToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'newsletter'] })
    },
    onError: (err) => {
      toast.error(adminErrorMessage(err))
      setToDelete(null)
    },
  })

  function setParam(name: string, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setParam('q', q.trim())
  }

  const filtered = [...params.keys()].some((key) => key !== 'page')

  return (
    <>
      <PageHeader
        title={t('adminNewsletter.title')}
        subtitle={t('adminNewsletter.subtitle', { count: data?.subscribed ?? 0 })}
      >
        <div className="flex flex-wrap gap-2">
          <form onSubmit={handleSearch}>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('adminNewsletter.searchPlaceholder')}
              aria-label={t('common.search')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </form>
          <select
            aria-label={t('businesses.colStatus')}
            value={params.get('status') ?? ''}
            onChange={(e) => setParam('status', e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">{t('businesses.allStatuses')}</option>
            <option value="subscribed">{t('adminNewsletter.status.subscribed')}</option>
            <option value="unsubscribed">{t('adminNewsletter.status.unsubscribed')}</option>
          </select>
          <button
            type="button"
            onClick={() => exportCsv.mutate()}
            disabled={exportCsv.isPending || !data?.subscribed}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faDownload} className="text-xs" />
            {t('adminNewsletter.export')}
          </button>
        </div>
      </PageHeader>

      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!!data && data.subscribers.length === 0}
        emptyIcon={faEnvelopeOpenText}
        emptyTitle={filtered ? t('dataState.filteredTitle') : t('adminNewsletter.emptyTitle')}
        emptyText={filtered ? t('dataState.filteredText') : t('adminNewsletter.emptyText')}
        onRetry={() => refetch()}
      >
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('adminNewsletter.colEmail')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('businesses.colStatus')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('adminNewsletter.colLanguage')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('adminNewsletter.colSince')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.subscribers.map((subscriber) => (
                <tr key={subscriber._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium" dir="ltr">
                    {subscriber.email}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={subscriber.status === 'subscribed' ? 'active' : 'cancelled'}
                      label={t(`adminNewsletter.status.${subscriber.status}`)}
                    />
                  </td>
                  <td className="px-4 py-3 uppercase text-gray-600">{subscriber.language ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(subscriber.subscribedAt)}</td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      onClick={() => setToDelete(subscriber)}
                      aria-label={t('adminNewsletter.delete')}
                      title={t('adminNewsletter.delete')}
                      className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600 hover:border-red-300 hover:text-red-600"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && (
          <AdminPager page={page} limit={PAGE_SIZE} total={data.meta.total} onChange={(p) => setParam('page', String(p))} />
        )}
      </DataState>

      <ConfirmDialog
        open={!!toDelete}
        title={t('adminNewsletter.deleteTitle')}
        tone="danger"
        confirmLabel={t('adminNewsletter.delete')}
        isBusy={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete._id)}
        onCancel={() => setToDelete(null)}
      >
        <p>{t('adminNewsletter.deleteBody', { email: toDelete?.email ?? '' })}</p>
      </ConfirmDialog>
    </>
  )
}

export default AdminNewsletterPage
