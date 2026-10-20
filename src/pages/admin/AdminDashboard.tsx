import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminListPeople, deletePerson, updatePerson } from '../../api/admin'
import { adminListClaims } from '../../api/claims'
import ClaimRequests from '../../components/admin/ClaimRequests'
import AdminPersonCard from '../../components/admin/AdminPersonCard'
import DashboardHeader from '../../components/DashboardHeader'
import Pagination from '../../components/Pagination'
import type { PersonInput } from '../../types/admin'
import { getApiError } from '../../utils/apiError'

const PAGE_SIZE = 20

function AdminDashboard() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const queryClient = useQueryClient()
  const page = Number(searchParams.get('page')) || 1

  const params = new URLSearchParams(searchParams)
  params.set('limit', String(PAGE_SIZE))

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'people', params.toString()],
    queryFn: () => adminListPeople(params),
    placeholderData: keepPreviousData,
  })

  // Verify / Hide jaise chhote kaam ek click mein
  const quickUpdate = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PersonInput }) => updatePerson(id, input),
    onSuccess: (person) => {
      toast.success(t('oldAdmin.updated', { name: person.name }))
      // Purana cache bekaar karo taake har jagah naya data aaye
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['person', person.slug] })
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  const remove = useMutation({
    mutationFn: (person: { _id: string; slug: string; name: string }) => deletePerson(person._id),
    onSuccess: (_data, person) => {
      toast.success(t('oldAdmin.deleted', { name: person.name }))
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.removeQueries({ queryKey: ['person', person.slug] })
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  // Functional update: hamesha taaza URL params se shuru karo, purane snapshot se nahi
  function setParam(name: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(name, value)
      else next.delete(name)
      if (name !== 'page') next.delete('page')
      return next
    })
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setParam('q', search.trim())
  }

  // Tab bar pe un claims ki ginti jin pe admin ko kuch karna hai
  const { data: pendingClaims } = useQuery({
    queryKey: ['admin', 'claims', 'needs_action', 1],
    queryFn: () => adminListClaims('needs_action', 1),
  })
  const pendingCount = pendingClaims?.meta.total ?? 0

  const tab = searchParams.get('tab') === 'claims' ? 'claims' : 'people'
  const total = data?.meta.total ?? 0
  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-4 py-2 text-sm font-medium transition sm:flex-none ${
      active ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
    }`

  return (
    <div className="space-y-6">
      <DashboardHeader>
        <Link
          to="/dashboard/people/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <FontAwesomeIcon icon={faPlus} className="me-1.5" />
          {t('oldAdmin.newProfile')}
        </Link>
      </DashboardHeader>

      <div role="tablist" className="flex gap-1 rounded-xl bg-gray-100 p-1 sm:inline-flex">
        <button
          role="tab"
          aria-selected={tab === 'people'}
          className={tabClass(tab === 'people')}
          onClick={() => setSearchParams({})}
        >
          {t('oldAdmin.people')}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'claims'}
          className={tabClass(tab === 'claims')}
          onClick={() => setSearchParams({ tab: 'claims' })}
        >
          {t('oldAdmin.claimRequests')}
          {pendingCount > 0 && (
            <span className="ms-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {tab === 'claims' ? (
        <ClaimRequests />
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{t('oldAdmin.peopleProfiles')}</h2>
              <p className="text-sm text-gray-500">
                {data ? t('oldAdmin.profilesCount', { count: total }) : ' '}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <form onSubmit={handleSearch} className="flex min-w-0 flex-1 gap-2">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('oldAdmin.searchPlaceholder')}
                aria-label={t('oldAdmin.searchProfiles')}
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">
                {t('common.search')}
              </button>
            </form>
            <select
              aria-label={t('oldAdmin.visibility')}
              value={searchParams.get('visibility') ?? ''}
              onChange={(e) => setParam('visibility', e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">{t('oldAdmin.allProfiles')}</option>
              <option value="visible">{t('oldAdmin.visible')}</option>
              <option value="hidden">{t('oldAdmin.hidden')}</option>
            </select>
          </div>

          {isLoading && <p className="text-gray-500">{t('common.loading')}</p>}

          {data && data.people.length === 0 && (
            <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              {t('oldAdmin.noProfiles')}
            </p>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {data?.people.map((person) => (
              <AdminPersonCard
                key={person._id}
                person={person}
                isBusy={quickUpdate.isPending || remove.isPending}
                onToggleHidden={() =>
                  quickUpdate.mutate({
                    id: person._id,
                    input: { visibility: person.visibility === 'hidden' ? 'visible' : 'hidden' },
                  })
                }
                onDelete={() => remove.mutate(person)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            onChange={(p) => setParam('page', String(p))}
          />
        </section>
      )}
    </div>
  )
}

export default AdminDashboard
