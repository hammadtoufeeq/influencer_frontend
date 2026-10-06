import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminListPeople, updatePerson } from '../../api/admin'
import Pagination from '../../components/Pagination'
import { STATUS_LABELS } from '../../constants/people'
import type { PersonInput } from '../../types/admin'
import { getApiError } from '../../utils/apiError'
import { formatCount } from '../../utils/format'

const PAGE_SIZE = 20

function AdminPeople() {
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
  const smallButton = 'rounded-lg border border-gray-300 px-2.5 py-1 text-xs hover:bg-gray-100 disabled:opacity-50'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin · People</h1>
          <p className="text-sm text-gray-500">{data ? `${total} profiles` : ' '}</p>
        </div>
        <Link to="/admin/people/new" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          + New profile
        </Link>
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
          <button type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Search</button>
        </form>
        <select
          aria-label="Visibility"
          value={searchParams.get('visibility') ?? ''}
          onChange={(e) => setParam('visibility', e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}

      <ul className={`divide-y divide-gray-100 rounded-2xl bg-white shadow-sm ${isFetching ? 'opacity-70' : ''}`}>
        {data?.people.map((person) => (
          <li key={person._id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{person.name}</span>
                {person.verified && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">Verified</span>}
                {person.visibility === 'hidden' && <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">Hidden</span>}
                {person.isDemo && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">Demo</span>}
                {person.claimedBy && <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">Claimed</span>}
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                /{person.slug} · {STATUS_LABELS[person.status]} · {formatCount(person.totalFollowers)} followers
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={smallButton}
                disabled={quickUpdate.isPending}
                onClick={() => quickUpdate.mutate({ id: person._id, input: { verified: !person.verified } })}
              >
                {person.verified ? 'Unverify' : 'Verify'}
              </button>
              <button
                className={smallButton}
                disabled={quickUpdate.isPending}
                onClick={() =>
                  quickUpdate.mutate({
                    id: person._id,
                    input: { visibility: person.visibility === 'hidden' ? 'visible' : 'hidden' },
                  })
                }
              >
                {person.visibility === 'hidden' ? 'Show' : 'Hide'}
              </button>
              <Link to={`/admin/people/${person._id}/edit`} className={smallButton}>Edit</Link>
              {person.visibility === 'visible' && (
                <Link to={`/people/${person.slug}`} className={smallButton}>View</Link>
              )}
            </div>
          </li>
        ))}
        {data && data.people.length === 0 && <li className="p-6 text-center text-gray-500">No profiles found.</li>}
      </ul>

      <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onChange={(p) => setParam('page', String(p))} />
    </div>
  )
}

export default AdminPeople
