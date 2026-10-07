import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { createReport } from '../api/adminPanel'
import { personQuery } from '../api/queries'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { REPORT_REASONS, type ReportReason } from '../types/adminPanel'
import { getApiError } from '../utils/apiError'

// /people/:slug/report -> "Report an error / request removal" (har profile pe)
function ReportProfile() {
  const { slug = '' } = useParams()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { data: person, isLoading } = useQuery({ ...personQuery(slug), retry: false })

  const [reason, setReason] = useState<ReportReason>('incorrect_info')
  const [details, setDetails] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const send = useMutation({
    mutationFn: createReport,
    onMutate: () => setErrors({}),
    onError: (error) => {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    },
  })

  if (isLoading) return <p className="text-center text-gray-500">{t('common.loading')}</p>
  if (!person) return <p className="text-center">{t('common.notFound')}</p>

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    send.mutate({
      personId: person!._id,
      reason,
      details,
      reporterName: reporterName.trim() || undefined,
      reporterEmail: reporterEmail.trim() || undefined,
    })
  }

  return (
    <div dir={i18n.dir()} className="mx-auto max-w-xl space-y-6">
      <Link
        to={`/people/${person.slug}`}
        className="inline-flex items-center gap-2 text-sm underline"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('reportForm.backToProfile')}
      </Link>

      {send.isSuccess ? (
        <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <FontAwesomeIcon icon={faCircleCheck} className="text-3xl text-green-600" />
          <p className="mt-3 font-medium">{t('reportForm.sent')}</p>
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div>
            <h1 className="text-xl font-bold">{t('reportForm.title', { name: person.name })}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('reportForm.subtitle')}</p>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t('reportForm.reason')}</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(`reportReason.${r}`)}
                </option>
              ))}
            </select>
          </label>
          <div>
            <label htmlFor="details" className="mb-1 block text-sm font-medium">
              {t('reportForm.details')}
            </label>
            <textarea
              id="details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('reportForm.detailsPlaceholder')}
              className={`w-full rounded-lg border px-3 py-2 ${errors.details ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.details && <p className="mt-1 text-sm text-red-600">{errors.details}</p>}
          </div>
          {!user && (
            <>
              <FormField
                id="reporterName"
                label={t('reportForm.name')}
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
              />
              <div>
                <FormField
                  id="reporterEmail"
                  type="email"
                  label={t('reportForm.email')}
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  error={errors.reporterEmail}
                />
                <p className="mt-1 text-xs text-gray-500">{t('reportForm.emailHelp')}</p>
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={send.isPending}
            className="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {send.isPending ? t('reportForm.sending') : t('reportForm.submit')}
          </button>
        </form>
      )}
    </div>
  )
}

export default ReportProfile
