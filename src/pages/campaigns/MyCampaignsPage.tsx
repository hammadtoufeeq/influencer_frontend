import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBullhorn, faCircleInfo, faPlus } from '@fortawesome/free-solid-svg-icons'
import { myCampaignsQuery } from '../../api/queries'
import { CampaignFacts, CampaignStatusBadge } from '../../components/campaigns/campaignUi'
import { useCampaignFormat } from '../../components/campaigns/campaignFormat'

// /dashboard/campaigns -> business ki apni campaigns (draft bhi)
function MyCampaignsPage() {
  const { t } = useTranslation()
  const format = useCampaignFormat()
  const { data, isLoading, isError, refetch } = useQuery(myCampaignsQuery)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('campaigns.mineTitle')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('campaigns.mineSubtitle')}</p>
        </div>
        <Link
          to="/dashboard/campaigns/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          {t('campaigns.new')}
        </Link>
      </div>

      {data && !data.canPublish && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5" />
          <span>
            {t('campaigns.verifyToPublish')}{' '}
            <Link to="/dashboard/business" className="font-medium underline">
              {t('campaigns.verifyNow')}
            </Link>
          </span>
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200/70" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-gray-200/70">
          <p className="font-semibold">{t('common.error')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : !data?.campaigns.length ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <FontAwesomeIcon icon={faBullhorn} />
          </span>
          <p className="mt-4 font-semibold">{t('campaigns.mineEmptyTitle')}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            {t('campaigns.mineEmptyText')}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {data.campaigns.map((campaign) => (
            <li key={campaign._id}>
              <Link
                to={`/dashboard/campaigns/${campaign._id}`}
                className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-gray-900">{campaign.title}</h2>
                      <CampaignStatusBadge status={campaign.status} />
                      {/* Open hai magar "Apply by" guzar gayi: public Campaigns page pe nahi dikhti */}
                      {campaign.status === 'open' && !campaign.acceptingApplications && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                          {t('campaigns.deadlinePassed')}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {t(`services.category.${campaign.category}`)} ·{' '}
                      {t('campaigns.created', { date: format.date(campaign.createdAt) })}
                    </p>
                  </div>
                  <div className="flex gap-2 text-center">
                    <span className="rounded-xl bg-gray-50 px-3 py-1.5">
                      <span className="block text-lg leading-tight font-bold">
                        {campaign.counts.pending}
                      </span>
                      <span className="text-xs text-gray-500">{t('campaigns.newApplicants')}</span>
                    </span>
                    <span className="rounded-xl bg-gray-50 px-3 py-1.5">
                      <span className="block text-lg leading-tight font-bold">
                        {campaign.counts.accepted}/{campaign.slots}
                      </span>
                      <span className="text-xs text-gray-500">{t('campaigns.selected')}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <CampaignFacts campaign={campaign} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyCampaignsPage
