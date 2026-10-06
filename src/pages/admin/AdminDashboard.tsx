import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminListPeople, updatePerson } from '../../api/admin'
import AdminPersonCard from '../../components/admin/AdminPersonCard'
import DashboardHeader from '../../components/DashboardHeader'
import Pagination from '../../components/Pagination'
import type { PersonInput } from '../../types/admin'
import { getApiError } from '../../utils/apiError'

const PAGE_SIZE = 20

function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const queryClient = useQueryClient()
  const page = Number(searchParams.get('page')) || 1

  const params = new URLSearchParams(searchParams)
  params.set('limit', String(PAGE_SIZE))

  // Admin data hamesha taaza chahiye, is liye staleTime 0
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'people', params.toString()],
    queryFn: () => adminListPeople(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })

  // Verify / Hide jaise chhote kaam ek click mein
  const quickUpdate = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PersonInput }) => updatePerson(id, input),
    onSuccess: (person) => {
      toast.success(`${person.name} updated`)
      // Purana cache bekaar karo taake har jagah naya data aaye
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['person', person.slug] })
    },
    onError: (error) => toast.error(getApiError(error).message),
  })

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(name, value)
    else next.delete(name)
    if (name !== 'page') next.delete('page')
    setSearchParams(next)
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    setParam('q', search.trim())
  }

  const total = data?.meta.total ?? 0

  return (
    <div className="space-y-6">
      <DashboardHeader>
        <Link
          to="/dashboard/people/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + New profile
        </Link>
      </DashboardHeader>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">People profiles</h2>
            <p className="text-sm text-gray-500">{data ? `${total} profiles` : ' '}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or slug"
              aria-label="Search profiles"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">
              Search
            </button>
          </form>
          <select
            aria-label="Visibility"
            value={searchParams.get('visibility') ?? ''}
            onChange={(e) => setParam('visibility', e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All profiles</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {isLoading && <p className="text-gray-500">Loading...</p>}

        {data && data.people.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            No profiles found.
          </p>
        )}

        <div className={`grid gap-4 lg:grid-cols-2 ${isFetching ? 'opacity-70' : ''}`}>
          {data?.people.map((person) => (
            <AdminPersonCard
              key={person._id}
              person={person}
              isBusy={quickUpdate.isPending}
              onToggleVerified={() =>
                quickUpdate.mutate({ id: person._id, input: { verified: !person.verified } })
              }
              onToggleHidden={() =>
                quickUpdate.mutate({
                  id: person._id,
                  input: { visibility: person.visibility === 'hidden' ? 'visible' : 'hidden' },
                })
              }
            />
          ))}
        </div>

        <Pagination
          page={page}
          totalPages={Math.ceil(total / PAGE_SIZE)}
          onChange={(p) => setParam('page', String(p))}
        />
      </section>
    </div>
  )
}

export default AdminDashboard
