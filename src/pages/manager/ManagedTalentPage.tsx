import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowUpRightFromSquare,
  faBriefcase,
  faHandshake,
  faIdCard,
  faLock,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { updatePerson } from '../../api/admin'
import { managerEnd } from '../../api/manager'
import { myTalentQuery, myTalentsQuery } from '../../api/queries'
import Avatar from '../../components/Avatar'
import VerifiedBadge from '../../components/VerifiedBadge'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import PersonForm from '../../components/admin/PersonForm'
import IncomingHireRequests from '../../components/business/IncomingHireRequests'
import PermissionChips from '../../components/manager/PermissionChips'
import ServicesPage from '../dashboards/ServicesPage'
import type { PersonInput } from '../../types/admin'
import type { RepresentationPermissions } from '../../types/manager'
import { getApiError } from '../../utils/apiError'

type Tab = 'profile' | 'services' | 'hires'
const TABS: { key: Tab; icon: IconDefinition; needs: keyof RepresentationPermissions }[] = [
  { key: 'hires', icon: faHandshake, needs: 'handleHires' },
  { key: 'services', icon: faBriefcase, needs: 'manageProfile' },
  { key: 'profile', icon: faIdCard, needs: 'manageProfile' },
]

// Jis kaam ki ijazat nahi, us ki jagah ye
function NoPermission({ permission }: { permission: keyof RepresentationPermissions }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <FontAwesomeIcon icon={faLock} />
      </span>
      <p className="mt-3 font-medium">{t('manager.noPermissionTitle')}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
        {t('manager.noPermissionText', { permission: t(`manager.permissions.${permission}`) })}
      </p>
    </div>
  )
}

// /talents/:personId -> manager ek talent ki taraf se kaam karta hai (talent ki ijazat ke mutabiq)
function ManagedTalentPage() {
  const { t } = useTranslation()
  const { personId = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const { data, isLoading, error } = useQuery({ ...myTalentQuery(personId), retry: false })
  const { data: roster } = useQuery(myTalentsQuery)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [ending, setEnding] = useState(false)

  const save = useMutation({
    mutationFn: (input: PersonInput) => updatePerson(personId, input),
    onMutate: () => setErrors({}),
    onSuccess: (saved) => {
      toast.success(t('editProfile.updated'))
      queryClient.invalidateQueries({ queryKey: ['manager'] })
      queryClient.invalidateQueries({ queryKey: ['person', saved.slug] })
    },
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setErrors(fields)
      toast.error(message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  })

  const end = useMutation({
    mutationFn: () => managerEnd(data!.representationId),
    onSuccess: () => {
      toast.success(t('manager.ended'))
      queryClient.invalidateQueries({ queryKey: ['manager'] })
      navigate('/talents', { replace: true })
    },
    onError: (err) => {
      toast.error(getApiError(err).message)
      setEnding(false)
    },
  })

  if (isLoading) return <div className="mx-auto h-96 max-w-5xl animate-pulse rounded-2xl bg-white shadow-sm" />
  // Ab is talent ka manager nahi (rishta khatam / ghalat link)
  if (axios.isAxiosError(error) && error.response?.status === 403) return <Navigate to="/talents" replace />
  if (!data) return <p className="text-center text-sm text-red-600">{t('common.error')}</p>

  const { person, permissions } = data
  const tab: Tab = (TABS.find((x) => x.key === params.get('tab'))?.key ?? 'hires') as Tab
  const current = TABS.find((x) => x.key === tab)!

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Link to="/talents" className="inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('manager.backToTalents')}
      </Link>

      <header className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
        <Avatar name={person.name} photoUrl={person.photoUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('manager.workingFor')}</p>
          <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">
            {person.name}
            {person.verified && <VerifiedBadge />}
          </h1>
          <div className="mt-1.5">
            <PermissionChips permissions={permissions} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Doosre talent pe seedha */}
          {roster && roster.length > 1 && (
            <select
              aria-label={t('manager.switchTalent')}
              value={personId}
              onChange={(e) => navigate(`/talents/${e.target.value}?tab=${tab}`)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              {roster.map((talent) => (
                <option key={talent.person._id} value={talent.person._id}>
                  {talent.person.name}
                </option>
              ))}
            </select>
          )}
          <Link
            to={`/people/${person.slug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
          >
            {t('services.viewPublic')}
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
          </Link>
          <button
            type="button"
            onClick={() => setEnding(true)}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            {t('manager.stopRepresenting')}
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm" aria-label={t('manager.workingFor')}>
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setParams({ tab: item.key }, { replace: true })}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
              tab === item.key ? 'bg-brand text-on-brand' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={permissions[item.needs] ? item.icon : faLock} className="w-4" />
            {t(`manager.tabs.${item.key}`)}
          </button>
        ))}
      </nav>

      {!permissions[current.needs] ? (
        <NoPermission permission={current.needs} />
      ) : tab === 'hires' ? (
        <IncomingHireRequests personId={personId} manager />
      ) : tab === 'services' ? (
        <ServicesPage personId={personId} />
      ) : (
        <PersonForm
          key={person._id}
          person={person}
          mode="owner"
          isSaving={save.isPending}
          errors={errors}
          onSubmit={(input) => save.mutate(input)}
        />
      )}

      <ConfirmDialog
        open={ending}
        title={t('manager.stopTitle')}
        tone="danger"
        confirmLabel={t('manager.stopRepresenting')}
        isBusy={end.isPending}
        onConfirm={() => end.mutate()}
        onCancel={() => setEnding(false)}
      >
        <p>{t('manager.stopBody', { name: person.name })}</p>
      </ConfirmDialog>
    </div>
  )
}

export default ManagedTalentPage
