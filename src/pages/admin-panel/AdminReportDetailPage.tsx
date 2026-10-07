import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { getAdminReport, updateAdminReport } from '../../api/adminPanel'
import Avatar from '../../components/Avatar'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import HistoryList from '../../components/admin-panel/HistoryList'
import StatusPill from '../../components/admin-panel/StatusPill'
import type { AdminReport, ReportStatus } from '../../types/adminPanel'
import { adminErrorMessage, formatDateTime } from '../../utils/adminFormat'

type EditableStatus = Exclude<ReportStatus, 'open'>
const EDITABLE: EditableStatus[] = ['reviewing', 'resolved', 'rejected']
const card = 'rounded-2xl bg-white p-5 shadow-sm'

// Form alag component taake report aate hi us ki values se shuru ho
function ReportUpdateForm({ report }: { report: AdminReport }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<EditableStatus>(
    report.status === 'open' ? 'reviewing' : report.status,
  )
  const [adminNote, setAdminNote] = useState(report.adminNote ?? '')
  const [hidePerson, setHidePerson] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const canHide = report.person?.visibility === 'visible'

  const save = useMutation({
    mutationFn: () =>
      updateAdminReport(report._id, {
        status,
        adminNote: adminNote.trim(),
        hidePerson: canHide && hidePerson,
      }),
    onSuccess: (updated) => {
      toast.success(t('reports.updated'))
      setConfirming(false)
      setHidePerson(false)
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      if (updated.person) {
        queryClient.invalidateQueries({ queryKey: ['person', updated.person.slug] })
        queryClient.invalidateQueries({ queryKey: ['people'] })
      }
    },
    onError: (error) => {
      toast.error(adminErrorMessage(error))
      setConfirming(false)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setConfirming(true)
  }

  return (
    <form onSubmit={handleSubmit} className={`${card} space-y-4`}>
      <h2 className="font-semibold">{t('reports.update')}</h2>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('reports.newStatus')}</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as EditableStatus)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          {EDITABLE.map((s) => (
            <option key={s} value={s}>
              {t(`reportStatus.${s}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('reports.adminNote')}</span>
        <textarea
          rows={3}
          maxLength={1000}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder={t('reports.adminNotePlaceholder')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </label>
      {canHide && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={hidePerson}
            onChange={(e) => setHidePerson(e.target.checked)}
            className="mt-0.5 h-4 w-4"
          />
          {t('reports.hidePerson')}
        </label>
      )}
      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        {t('common.save')}
      </button>

      <ConfirmDialog
        open={confirming}
        title={t('reports.confirmTitle')}
        tone={hidePerson ? 'danger' : 'default'}
        isBusy={save.isPending}
        onConfirm={() => save.mutate()}
        onCancel={() => setConfirming(false)}
      >
        <p>{t('reports.confirmBody', { status: t(`reportStatus.${status}`) })}</p>
        {hidePerson && <p className="mt-2 font-medium text-red-700">{t('reports.confirmHide')}</p>}
      </ConfirmDialog>
    </form>
  )
}

function AdminReportDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'report', id],
    queryFn: () => getAdminReport(id),
    staleTime: 0,
  })
  const report = data?.report

  return (
    <>
      <Link to="/admin/reports" className="mb-4 inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('common.back')}
      </Link>
      <DataState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!report}
        emptyText={t('common.notFound')}
        onRetry={() => refetch()}
      >
        {report && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">
                {t('reports.detailTitle', { name: report.person?.name ?? '—' })}
              </h1>
              <StatusPill status={report.status} label={t(`reportStatus.${report.status}`)} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className={card}>
                <h2 className="text-sm font-medium text-gray-500">{t('reports.colPerson')}</h2>
                {report.person && (
                  <>
                    <div className="mt-3 flex items-center gap-3">
                      <Avatar name={report.person.name} photoUrl={report.person.photoUrl} />
                      <p className="font-semibold">
                        {report.person.name}
                        {report.person.visibility === 'hidden' && (
                          <span className="ms-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                            {t('common.hidden')}
                          </span>
                        )}
                      </p>
                    </div>
                    {report.person.visibility === 'visible' && (
                      <Link
                        to={`/people/${report.person.slug}`}
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
                <h2 className="text-sm font-medium text-gray-500">{t('reports.reporter')}</h2>
                <p className="mt-3 font-semibold">
                  {report.reporter?.name ?? report.reporterName ?? t('common.guest')}
                </p>
                <p className="break-all text-sm text-gray-600">
                  {report.reporter?.email ?? report.reporterEmail}
                </p>
                <p className="mt-1 text-xs text-gray-500">{formatDateTime(report.createdAt)}</p>
              </section>
            </div>

            <section className={card}>
              <h2 className="text-sm font-medium text-gray-500">
                {t(`reportReason.${report.reason}`)}
              </h2>
              <p className="mt-2 whitespace-pre-line">{report.details}</p>
              {report.handledBy && report.handledAt && (
                <p className="mt-4 text-xs text-gray-500">
                  {t('reports.handled', {
                    name: report.handledBy.name,
                    date: formatDateTime(report.handledAt),
                  })}
                </p>
              )}
            </section>

            <ReportUpdateForm
              key={`${report._id}-${report.status}-${report.adminNote ?? ''}`}
              report={report}
            />
            <HistoryList history={data.history} />
          </div>
        )}
      </DataState>
    </>
  )
}

export default AdminReportDetailPage
