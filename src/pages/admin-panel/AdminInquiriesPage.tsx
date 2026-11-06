import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { listAdminInquiries } from '../../api/adminPanel'
import AdminPager from '../../components/admin-panel/AdminPager'
import DataState from '../../components/admin-panel/DataState'
import PageHeader from '../../components/admin-panel/PageHeader'
import StatusPill from '../../components/admin-panel/StatusPill'
import { INQUIRY_STATUSES } from '../../types/adminPanel'
import { formatDateTime } from '../../utils/adminFormat'

const PAGE_SIZE = 20

// /admin/inquiries -> talents ke baare mein aaye sawal (guest bhi bhejte hain)
function AdminInquiriesPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page')) || 1
  const apiParams = new URLSearchParams(params)
  apiParams.set('limit', String(PAGE_SIZE))

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'inquiries', apiParams.toString()],
    queryFn: () => listAdminInquiries(apiParams),
    placeholderData: keepPreviousData,
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

  const filtered = [...params.keys()].some((key) => key !== 'page')

  return (
    <>
      <PageHeader title={t('inquiries.title')} subtitle={t('inquiries.subtitle')}>
        <select
          aria-label={t('inquiries.colStatus')}
          value={params.get('status') ?? ''}
          onChange={(e) => setParam('status', e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">{t('inquiries.allStatuses')}</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`inquiryStatus.${s}`)}
            </option>
          ))}
        </select>
      </PageHeader>

      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!!data && data.inquiries.length === 0}
        emptyIcon={faCircleQuestion}
        emptyTitle={filtered ? t('dataState.filteredTitle') : t('inquiries.emptyTitle')}
        emptyText={filtered ? t('dataState.filteredText') : t('inquiries.emptyText')}
        onRetry={() => refetch()}
      >
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t('inquiries.colPerson')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('inquiries.colFrom')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('inquiries.colMessage')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('inquiries.colStatus')}</th>
                <th className="px-4 py-3 text-start font-medium">{t('inquiries.colDate')}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.inquiries.map((inquiry) => (
                <tr key={inquiry._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{inquiry.person?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <p>{inquiry.name}</p>
                    <p className="text-xs text-gray-500">{inquiry.email}</p>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    <p className="line-clamp-2">{inquiry.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={inquiry.status}
                      label={t(`inquiryStatus.${inquiry.status}`)}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(inquiry.createdAt)}</td>
                  <td className="px-4 py-3 text-end">
                    <Link
                      to={`/admin/inquiries/${inquiry._id}`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                    >
                      {t('common.view')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && (
          <AdminPager
            page={page}
            limit={PAGE_SIZE}
            total={data.meta.total}
            onChange={(p) => setParam('page', String(p))}
          />
        )}
      </DataState>
    </>
  )
}

export default AdminInquiriesPage
