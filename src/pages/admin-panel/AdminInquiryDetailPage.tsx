import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faEnvelope,
  faPhone,
} from '@fortawesome/free-solid-svg-icons'
import { getAdminInquiry, updateAdminInquiry } from '../../api/adminPanel'
import Avatar from '../../components/Avatar'
import DataState from '../../components/admin-panel/DataState'
import HistoryList from '../../components/admin-panel/HistoryList'
import StatusPill from '../../components/admin-panel/StatusPill'
import type { AdminInquiry, InquiryStatus } from '../../types/adminPanel'
import { adminErrorMessage, formatDateTime } from '../../utils/adminFormat'

type EditableStatus = Exclude<InquiryStatus, 'new'>
const EDITABLE: EditableStatus[] = ['in_progress', 'answered', 'closed']
const card = 'rounded-2xl bg-white p-5 shadow-sm'

// Form alag component taake sawal aate hi us ki values se shuru ho
function InquiryUpdateForm({ inquiry }: { inquiry: AdminInquiry }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<EditableStatus>(
    inquiry.status === 'new' ? 'in_progress' : inquiry.status,
  )
  const [adminNote, setAdminNote] = useState(inquiry.adminNote ?? '')

  const save = useMutation({
    mutationFn: () => updateAdminInquiry(inquiry._id, { status, adminNote: adminNote.trim() }),
    onSuccess: () => {
      toast.success(t('inquiries.updated'))
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    },
    onError: (error) => toast.error(adminErrorMessage(error)),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    save.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className={`${card} space-y-4`}>
      <h2 className="font-semibold">{t('inquiries.update')}</h2>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('inquiries.newStatus')}</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as EditableStatus)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {EDITABLE.map((s) => (
            <option key={s} value={s}>
              {t(`inquiryStatus.${s}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('inquiries.adminNote')}</span>
        <textarea
          rows={3}
          maxLength={1000}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder={t('inquiries.adminNotePlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={save.isPending}
        className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
      >
        {t('common.save')}
      </button>
    </form>
  )
}

// /admin/inquiries/:id -> ek sawal: kis talent ke baare mein, kis ne bheja, jawab ka link
function AdminInquiryDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'inquiry', id],
    queryFn: () => getAdminInquiry(id),
  })
  const inquiry = data?.inquiry
  const replySubject = inquiry
    ? encodeURIComponent(t('inquiries.replySubject', { name: inquiry.person?.name ?? '' }))
    : ''

  return (
    <>
      <Link to="/admin/inquiries" className="mb-4 inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('common.back')}
      </Link>
      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!inquiry}
        backTo="/admin/inquiries"
        onRetry={() => refetch()}
      >
        {inquiry && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">
                {t('inquiries.detailTitle', { name: inquiry.person?.name ?? '—' })}
              </h1>
              <StatusPill status={inquiry.status} label={t(`inquiryStatus.${inquiry.status}`)} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className={card}>
                <h2 className="text-sm font-medium text-gray-500">{t('inquiries.colPerson')}</h2>
                {inquiry.person && (
                  <>
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar name={inquiry.person.name} photoUrl={inquiry.person.photoUrl} />
                      <p className="font-semibold">{inquiry.person.name}</p>
                    </div>
                    {inquiry.person.visibility === 'visible' && (
                      <Link
                        to={`/people/${inquiry.person.slug}`}
                        className="mt-3 inline-flex items-center gap-2 text-sm underline"
                      >
                        {t('common.openPublicProfile')}
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
                      </Link>
                    )}
                  </>
                )}
              </section>
              <section className={card}>
                <h2 className="text-sm font-medium text-gray-500">{t('inquiries.colFrom')}</h2>
                <p className="mt-3 font-semibold">
                  {inquiry.name}
                  <span className="ms-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-600">
                    {inquiry.user ? t(`roles.${inquiry.user.role}`) : t('common.guest')}
                  </span>
                </p>
                <a
                  href={`mailto:${inquiry.email}?subject=${replySubject}`}
                  className="mt-1 flex items-center gap-2 break-all text-sm text-gray-700 underline"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="text-xs text-gray-400" />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <a
                    href={`tel:${inquiry.phone.replace(/[^\d+]/g, '')}`}
                    className="mt-1 flex items-center gap-2 text-sm text-gray-700 underline"
                  >
                    <FontAwesomeIcon icon={faPhone} className="text-xs text-gray-400" />
                    {inquiry.phone}
                  </a>
                )}
                <p className="mt-2 text-xs text-gray-500">{formatDateTime(inquiry.createdAt)}</p>
              </section>
            </div>

            <section className={card}>
              <h2 className="text-sm font-medium text-gray-500">{t('inquiries.colMessage')}</h2>
              <p className="mt-2 whitespace-pre-line">{inquiry.message}</p>
              <a
                href={`mailto:${inquiry.email}?subject=${replySubject}`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
              >
                <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
                {t('inquiries.replyByEmail')}
              </a>
              {inquiry.handledBy && inquiry.handledAt && (
                <p className="mt-4 text-xs text-gray-500">
                  {t('inquiries.handled', {
                    name: inquiry.handledBy.name,
                    date: formatDateTime(inquiry.handledAt),
                  })}
                </p>
              )}
            </section>

            <InquiryUpdateForm
              key={`${inquiry._id}-${inquiry.status}-${inquiry.adminNote ?? ''}`}
              inquiry={inquiry}
            />
            <HistoryList history={data.history} />
          </div>
        )}
      </DataState>
    </>
  )
}

export default AdminInquiryDetailPage
