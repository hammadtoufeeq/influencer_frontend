import { useCallback, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faStar } from '@fortawesome/free-solid-svg-icons'
import { createShortlist } from '../../api/shortlists'
import { shortlistsQuery } from '../../api/queries'
import Avatar from '../../components/Avatar'
import DataState from '../../components/admin-panel/DataState'
import { getApiError } from '../../utils/apiError'
import { formatDate } from '../../utils/adminFormat'

// /shortlists -> campaign ke hisaab se lists. Nayi list yahin, log profile / search se daalte hain
function ShortlistsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, isError, error, refetch } = useQuery(shortlistsQuery)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [nameError, setNameError] = useState('')
  const closeForm = useCallback(() => {
    setCreating(false)
    setName('')
    setDescription('')
    setNameError('')
  }, [])

  const create = useMutation({
    mutationFn: () => createShortlist(name.trim(), description.trim() || undefined),
    onMutate: () => setNameError(''),
    onSuccess: (list) => {
      toast.success(t('shortlists.created', { name: list.name }))
      queryClient.invalidateQueries({ queryKey: ['shortlists'] })
      navigate(`/shortlists/${list._id}`)
    },
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setNameError(fields.name ?? message)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (name.trim()) create.mutate()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('shortlists.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('shortlists.subtitle')}</p>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            {t('shortlists.newList')}
          </button>
        )}
      </div>

      {creating && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t('shortlists.name')}</span>
            <input
              autoFocus
              value={name}
              maxLength={80}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('shortlists.namePlaceholder')}
              className={`w-full rounded-lg border px-3 py-2 ${nameError ? 'border-red-500' : 'border-gray-300'}`}
            />
            {nameError && <span className="mt-1 block text-sm text-red-600">{nameError}</span>}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">{t('shortlists.description')}</span>
            <input
              value={description}
              maxLength={300}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('shortlists.descriptionPlaceholder')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || create.isPending}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
            >
              {create.isPending ? t('common.saving') : t('shortlists.create')}
            </button>
          </div>
        </form>
      )}

      <DataState
        isLoading={isLoading}
        isError={isError && !data}
        error={error}
        isEmpty={!!data && data.length === 0}
        emptyIcon={faStar}
        emptyTitle={t('shortlists.emptyTitle')}
        emptyText={t('shortlists.emptyText')}
        onRetry={() => refetch()}
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((list) => (
            <li key={list._id}>
              <Link
                to={`/shortlists/${list._id}`}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <h2 className="font-semibold">{list.name}</h2>
                {list.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{list.description}</p>
                )}
                <div className="mt-4 flex -space-x-2 rtl:space-x-reverse">
                  {list.preview.map((person) => (
                    <span key={person._id} className="rounded-full ring-2 ring-white">
                      <Avatar name={person.name} photoUrl={person.photoUrl} size="sm" />
                    </span>
                  ))}
                </div>
                <p className="mt-auto pt-4 text-xs text-gray-500">
                  {t('shortlists.peopleCount', { count: list.count })} ·{' '}
                  {t('agreements.updatedOn', { date: formatDate(list.updatedAt) })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </DataState>
    </div>
  )
}

export default ShortlistsPage
