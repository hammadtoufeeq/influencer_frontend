import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faStar, faXmark } from '@fortawesome/free-solid-svg-icons'
import { addToShortlist, createShortlist, removeFromShortlist } from '../../api/shortlists'
import { savedMembershipQuery } from '../../api/queries'
import { SHORTLIST_ROLES } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { getApiError } from '../../utils/apiError'

interface SaveToShortlistProps {
  personId: string
  personName: string
  // "icon" = card pe chhota gol button, "button" = profile page pe poora button
  variant?: 'icon' | 'button'
}

// Kis list mein daalna hai: saari lists ke checkbox + yahin nayi list
function ShortlistPicker({
  personId,
  personName,
  onClose,
}: {
  personId: string
  personName: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(savedMembershipQuery)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const inLists = new Set(data?.saved[personId] ?? [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['shortlists'] })

  const toggle = useMutation({
    mutationFn: ({ listId, add }: { listId: string; add: boolean }) =>
      add ? addToShortlist(listId, personId) : removeFromShortlist(listId, personId),
    // Tick foran dikhe (server ke jawab ka intezar nahi); fail ho to wapas
    onMutate: ({ listId, add }) => {
      queryClient.setQueryData(savedMembershipQuery.queryKey, (old) => {
        if (!old) return old
        const current = old.saved[personId] ?? []
        const next = add ? [...new Set([...current, listId])] : current.filter((id) => id !== listId)
        return { ...old, saved: { ...old.saved, [personId]: next } }
      })
    },
    onSuccess: (list, { add }) => {
      toast.success(
        add
          ? t('shortlists.added', { name: personName, list: list.name })
          : t('shortlists.removed', { name: personName, list: list.name }),
      )
      refresh()
    },
    onError: (err) => {
      toast.error(getApiError(err).message)
      refresh()
    },
  })

  const create = useMutation({
    mutationFn: async () => {
      const list = await createShortlist(newName.trim())
      return addToShortlist(list._id, personId)
    },
    onMutate: () => setError(''),
    onSuccess: (list) => {
      toast.success(t('shortlists.added', { name: personName, list: list.name }))
      setNewName('')
      refresh()
    },
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setError(fields.name ?? message)
    },
  })

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (newName.trim()) create.mutate()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortlist-picker-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="shortlist-picker-title" className="font-semibold text-gray-900">
            {t('shortlists.saveTitle', { name: personName })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('settings.close')}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {isLoading ? (
          <div className="mt-4 h-20 animate-pulse rounded-xl bg-gray-100" />
        ) : data?.lists.length ? (
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {data.lists.map((list) => (
              <li key={list._id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={inLists.has(list._id)}
                    disabled={toggle.isPending}
                    onChange={(e) => toggle.mutate({ listId: list._id, add: e.target.checked })}
                    className="h-4 w-4"
                  />
                  {list.name}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-gray-500">{t('shortlists.noListsYet')}</p>
        )}

        <form onSubmit={handleCreate} className="mt-4 border-t border-gray-100 pt-4">
          <label htmlFor="new-shortlist" className="text-sm font-medium text-gray-900">
            {t('shortlists.newList')}
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="new-shortlist"
              value={newName}
              maxLength={80}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t('shortlists.namePlaceholder')}
              className={`min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            <button
              type="submit"
              disabled={!newName.trim() || create.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              {t('shortlists.createAndAdd')}
            </button>
          </div>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>,
    document.body,
  )
}

// Profile ko shortlist mein daalne ka sitara. Sirf business / organization ko dikhta hai
function SaveToShortlist({ personId, personName, variant = 'icon' }: SaveToShortlistProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canSave = !!user && SHORTLIST_ROLES.includes(user.role)
  const { data } = useQuery({ ...savedMembershipQuery, enabled: canSave })
  const [open, setOpen] = useState(false)
  if (!canSave) return null

  const saved = (data?.saved[personId]?.length ?? 0) > 0
  const label = saved ? t('shortlists.saved') : t('shortlists.save')

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label}
          title={label}
          aria-pressed={saved}
          className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition hover:scale-105 ${
            saved ? 'border-amber-300 text-amber-400' : 'border-gray-200 text-gray-300 hover:text-gray-500'
          }`}
        >
          <FontAwesomeIcon icon={faStar} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`rounded-lg border px-4 py-2 text-center text-sm hover:bg-gray-100 ${
            saved ? 'border-amber-300 text-amber-700' : 'border-gray-300'
          }`}
        >
          <FontAwesomeIcon
            icon={faStar}
            className={`me-1.5 ${saved ? 'text-amber-400' : 'text-gray-300'}`}
          />
          {label}
        </button>
      )}
      {open && (
        <ShortlistPicker personId={personId} personName={personName} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

export default SaveToShortlist
