import { useCallback, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faMagnifyingGlass,
  faPen,
  faScaleBalanced,
  faStar,
  faTrash,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import {
  deleteShortlist,
  removeFromShortlist,
  updateShortlist,
  updateShortlistNote,
} from '../../api/shortlists'
import { shortlistQuery } from '../../api/queries'
import Avatar from '../../components/Avatar'
import Stars from '../../components/agreements/Stars'
import ConfirmDialog from '../../components/admin-panel/ConfirmDialog'
import DataState from '../../components/admin-panel/DataState'
import VerifiedBadge from '../../components/VerifiedBadge'
import CompareDialog from '../../components/shortlists/CompareDialog'
import HiringStatus from '../../components/shortlists/HiringStatus'
import { MAX_COMPARE, type Shortlist, type ShortlistItem } from '../../types/shortlist'
import { getApiError } from '../../utils/apiError'
import { countryName, formatCount } from '../../utils/format'
import { formatPrice } from '../../utils/price'

// Private note: badlo to "Save" aata hai (har shakhs ka apna)
function NoteEditor({ listId, item }: { listId: string; item: ShortlistItem }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [note, setNote] = useState(item.note)
  const changed = note.trim() !== item.note

  const save = useMutation({
    mutationFn: () => updateShortlistNote(listId, item.personId, note.trim()),
    onSuccess: (list) => {
      queryClient.setQueryData(shortlistQuery(listId).queryKey, list)
      toast.success(t('shortlists.noteSaved'))
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  return (
    <div className="mt-3">
      <textarea
        rows={2}
        maxLength={1000}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('shortlists.notePlaceholder')}
        aria-label={t('shortlists.note')}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white"
      />
      {changed && (
        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setNote(item.note)}
            className="rounded-lg px-3 py-1 text-xs hover:bg-gray-100"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="rounded-lg bg-brand px-3 py-1 text-xs font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
          >
            {save.isPending ? t('common.saving') : t('shortlists.saveNote')}
          </button>
        </div>
      )}
    </div>
  )
}

// Naam / tafseel badalne ka chhota form
function RenameForm({ list, onDone }: { list: Shortlist; onDone: () => void }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [name, setName] = useState(list.name)
  const [description, setDescription] = useState(list.description ?? '')
  const [error, setError] = useState('')

  const save = useMutation({
    mutationFn: () => updateShortlist(list._id, { name: name.trim(), description: description.trim() }),
    onMutate: () => setError(''),
    onSuccess: (updated) => {
      queryClient.setQueryData(shortlistQuery(list._id).queryKey, updated)
      queryClient.invalidateQueries({ queryKey: ['shortlists'] })
      onDone()
    },
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setError(fields.name ?? message)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (name.trim()) save.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <input
        autoFocus
        value={name}
        maxLength={80}
        onChange={(e) => setName(e.target.value)}
        aria-label={t('shortlists.name')}
        className={`w-full rounded-lg border px-3 py-2 text-lg font-semibold ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        value={description}
        maxLength={300}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('shortlists.descriptionPlaceholder')}
        aria-label={t('shortlists.description')}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100">
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={!name.trim() || save.isPending}
          className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
        >
          {save.isPending ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  )
}

// /shortlists/:id -> list ke log: note, rating, keemat, hire ki halat; 2-4 chun kar compare
function ShortlistDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = shortlistQuery(id)
  const { data: list, isLoading, isError, error, refetch } = useQuery(query)
  const [selected, setSelected] = useState<string[]>([])
  const [comparing, setComparing] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toRemove, setToRemove] = useState<ShortlistItem | null>(null)
  // Stable rakho: ConfirmDialog har nayi onCancel pe focus Cancel button pe le jata hai
  const closeDialogs = useCallback(() => {
    setConfirmDelete(false)
    setToRemove(null)
  }, [])
  const closeCompare = useCallback(() => setComparing(false), [])

  const remove = useMutation({
    mutationFn: (item: ShortlistItem) => removeFromShortlist(id, item.personId),
    onSuccess: (updated, item) => {
      queryClient.setQueryData(query.queryKey, updated)
      queryClient.invalidateQueries({ queryKey: ['shortlists'] })
      setSelected((ids) => ids.filter((x) => x !== item.personId))
      setToRemove(null)
      toast.success(t('shortlists.removed', { name: item.person?.name ?? '', list: updated.name }))
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  const destroy = useMutation({
    mutationFn: () => deleteShortlist(id),
    onSuccess: () => {
      toast.success(t('shortlists.deleted'))
      queryClient.invalidateQueries({ queryKey: ['shortlists'] })
      navigate('/shortlists')
    },
    onError: (err) => toast.error(getApiError(err).message),
  })

  function toggleSelected(personId: string) {
    setSelected((ids) => {
      if (ids.includes(personId)) return ids.filter((x) => x !== personId)
      if (ids.length >= MAX_COMPARE) {
        toast(t('shortlists.compareLimit', { count: MAX_COMPARE }))
        return ids
      }
      return [...ids, personId]
    })
  }

  const compareItems = list?.items.filter((item) => selected.includes(item.personId)) ?? []

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/shortlists" className="mb-4 inline-flex items-center gap-2 text-sm underline">
        <FontAwesomeIcon icon={faArrowLeft} className="rtl:rotate-180" />
        {t('shortlists.allLists')}
      </Link>
      <DataState
        isLoading={isLoading}
        isError={isError && !list}
        error={error}
        isEmpty={!list}
        backTo="/shortlists"
        onRetry={() => refetch()}
      >
        {list && (
          <div className="space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              {renaming ? (
                <RenameForm list={list} onDone={() => setRenaming(false)} />
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold">{list.name}</h1>
                    {list.description && <p className="mt-1 text-sm text-gray-600">{list.description}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      {t('shortlists.peopleCount', { count: list.items.length })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRenaming(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <FontAwesomeIcon icon={faPen} className="text-xs" />
                      {t('shortlists.rename')}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-xs" />
                      {t('shortlists.deleteList')}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {list.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <FontAwesomeIcon icon={faStar} />
                </span>
                <p className="mt-4 font-semibold">{t('shortlists.listEmptyTitle')}</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">{t('shortlists.listEmptyText')}</p>
                <Link
                  to="/search"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  {t('shortlists.findPeople')}
                </Link>
              </div>
            ) : (
              <>
                {/* Compare: 2-4 log chuno */}
                <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand px-4 py-3 text-sm text-on-brand shadow-lg">
                  <span>
                    {selected.length === 0
                      ? t('shortlists.compareHint', { count: MAX_COMPARE })
                      : t('shortlists.selected', { count: selected.length })}
                  </span>
                  <div className="flex gap-2">
                    {selected.length > 0 && (
                      <button onClick={() => setSelected([])} className="rounded-lg px-3 py-1.5 hover:bg-white/10">
                        <FontAwesomeIcon icon={faXmark} className="me-1.5" />
                        {t('shortlists.clear')}
                      </button>
                    )}
                    <button
                      onClick={() => setComparing(true)}
                      disabled={selected.length < 2}
                      className="rounded-lg bg-white px-3 py-1.5 font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-40"
                    >
                      <FontAwesomeIcon icon={faScaleBalanced} className="me-1.5" />
                      {t('shortlists.compare.button')}
                    </button>
                  </div>
                </div>

                <ul className="space-y-3">
                  {list.items.map((item) => {
                    const person = item.person
                    const location = [person?.city, countryName(person?.country)].filter(Boolean).join(', ')
                    const firstService = person?.services?.[0]
                    return (
                      <li
                        key={item.personId}
                        className={`rounded-2xl border bg-white p-4 shadow-sm md:p-5 ${
                          selected.includes(item.personId) ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200'
                        } ${item.available ? '' : 'opacity-70'}`}
                      >
                        <div className="flex flex-wrap items-start gap-4">
                          {item.available && (
                            <input
                              type="checkbox"
                              checked={selected.includes(item.personId)}
                              onChange={() => toggleSelected(item.personId)}
                              aria-label={t('shortlists.selectForCompare', { name: person?.name })}
                              className="mt-4 h-4 w-4"
                            />
                          )}
                          <Avatar name={person?.name ?? '?'} photoUrl={person?.photoUrl} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {item.available && person?.slug ? (
                                <Link to={`/people/${person.slug}`} className="font-semibold hover:underline">
                                  {person.name}
                                </Link>
                              ) : (
                                <span className="font-semibold">{person?.name ?? t('claims.deletedProfile')}</span>
                              )}
                              {person?.verified && <VerifiedBadge />}
                              {person?.availability?.isOpen && (
                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                  {t('services.availableShort')}
                                </span>
                              )}
                            </div>
                            {person?.headline && <p className="mt-0.5 text-sm text-gray-600">{person.headline}</p>}
                            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                              {location && <span>{location}</span>}
                              {!!person?.totalFollowers && (
                                <span>
                                  <FontAwesomeIcon icon={faUsers} className="me-1" />
                                  {t('site.followers', { value: formatCount(person.totalFollowers) })}
                                </span>
                              )}
                              {firstService && (
                                <span>
                                  {firstService.title}: {formatPrice(firstService.pricing)}
                                  {(person?.services?.length ?? 0) > 1 &&
                                    ` ${t('shortlists.moreServices', { count: (person?.services?.length ?? 1) - 1 })}`}
                                </span>
                              )}
                              {item.rating && (
                                <span className="inline-flex items-center gap-1">
                                  <Stars value={item.rating.average} size="text-xs" />
                                  {t('agreements.ratingSummary', item.rating)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <HiringStatus item={item} />
                            <button
                              onClick={() => setToRemove(item)}
                              className="text-xs text-gray-500 underline hover:text-red-600"
                            >
                              {t('shortlists.removeFromList')}
                            </button>
                          </div>
                        </div>
                        <NoteEditor key={`${item.personId}-${item.note}`} listId={list._id} item={item} />
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </DataState>

      {comparing && compareItems.length >= 2 && <CompareDialog items={compareItems} onClose={closeCompare} />}
      <ConfirmDialog
        open={confirmDelete}
        title={t('shortlists.deleteTitle')}
        tone="danger"
        confirmLabel={t('shortlists.deleteList')}
        isBusy={destroy.isPending}
        onConfirm={() => destroy.mutate()}
        onCancel={closeDialogs}
      >
        <p>{t('shortlists.deleteBody', { name: list?.name ?? '' })}</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={!!toRemove}
        title={t('shortlists.removeTitle')}
        tone="danger"
        confirmLabel={t('shortlists.removeFromList')}
        isBusy={remove.isPending}
        onConfirm={() => toRemove && remove.mutate(toRemove)}
        onCancel={closeDialogs}
      >
        <p>{t('shortlists.removeBody', { name: toRemove?.person?.name ?? '', list: list?.name ?? '' })}</p>
      </ConfirmDialog>
    </div>
  )
}

export default ShortlistDetailPage
