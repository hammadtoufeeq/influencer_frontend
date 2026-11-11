import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullhorn, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { withdrawApplication } from '../../api/campaigns'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import { myApplicationsQuery } from '../../api/queries'
import { ApplicationStatusBadge, CampaignBusiness } from '../../components/campaigns/campaignUi'
import { useCampaignFormat } from '../../components/campaigns/campaignFormat'
import type { MyApplication } from '../../types/campaign'
import { getApiError } from '../../utils/apiError'

function ApplicationRow({ application }: { application: MyApplication }) {
  const { t } = useTranslation()
  const format = useCampaignFormat()
  const campaign = application.campaign
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const withdraw = useMutation({
    mutationFn: () => withdrawApplication(application._id),
    onSuccess: () => {
      toast.success(t('campaigns.withdrawn'))
      setConfirmWithdraw(false)
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  return (
    <li className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {campaign ? (
            <Link
              to={`/campaigns/${campaign._id}`}
              className="font-semibold text-gray-900 hover:underline"
            >
              {campaign.title}
            </Link>
          ) : (
            <p className="font-semibold text-gray-500">{t('campaigns.removedCampaign')}</p>
          )}
          <p className="mt-0.5 text-xs text-gray-500">
            {t('campaigns.appliedOn', { date: format.date(application.createdAt) })}
          </p>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>
      {campaign && (
        <div className="mt-3">
          <CampaignBusiness campaign={campaign} />
        </div>
      )}
      <p className="mt-3 line-clamp-3 text-sm text-gray-600">{application.pitch}</p>
      <p className="mt-3 text-sm text-gray-600">
        {t(`campaigns.applicationHint.${application.status}`)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {application.status === 'accepted' && (
          <Link
            to="/dashboard/hire-requests"
            className="rounded-xl bg-brand px-3 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
          >
            {t('campaigns.openHire')}
          </Link>
        )}
        {application.status === 'pending' && (
          <button
            type="button"
            disabled={withdraw.isPending}
            onClick={() => setConfirmWithdraw(true)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {t('campaigns.withdraw')}
          </button>
        )}
      </div>
      <ConfirmDialog
        open={confirmWithdraw}
        title={t('campaigns.withdrawTitle')}
        tone="danger"
        confirmLabel={t('campaigns.withdraw')}
        isBusy={withdraw.isPending}
        onConfirm={() => withdraw.mutate()}
        onCancel={() => setConfirmWithdraw(false)}
      >
        <p>{t('campaigns.withdrawConfirm')}</p>
      </ConfirmDialog>
    </li>
  )
}

// /dashboard/applications -> talent ki campaigns pe bheji hui applications
function MyApplicationsPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery(myApplicationsQuery)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('campaigns.applicationsTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('campaigns.applicationsSubtitle')}</p>
        </div>
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand hover:bg-brand-hover"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
          {t('campaigns.browse')}
        </Link>
      </div>
      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-gray-200/70" />
      ) : !data?.length ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FontAwesomeIcon icon={faBullhorn} />
          </span>
          <p className="mt-4 font-semibold">{t('campaigns.noApplicationsTitle')}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            {t('campaigns.noApplicationsText')}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.map((application) => (
            <ApplicationRow key={application._id} application={application} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyApplicationsPage
