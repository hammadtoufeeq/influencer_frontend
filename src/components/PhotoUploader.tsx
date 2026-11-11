import { useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons'
import Avatar from './Avatar'
import { getApiError } from '../utils/apiError'

const MAX_BYTES = 2 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Photo / logo: dikhao, nayi chuno (upload foran), ya hatao.
// Asal upload / remove parent batata hai (account photo ya talent profile photo)
function PhotoUploader({
  name,
  photoUrl,
  onUpload,
  onRemove,
  label,
  hint,
  shape = 'round',
  savedMessage,
}: {
  name: string
  photoUrl?: string | null
  onUpload: (file: File) => Promise<unknown>
  onRemove: () => Promise<unknown>
  label: string
  hint?: string
  // Business logo chaukor, insaan ki photo gol
  shape?: 'round' | 'square'
  // Chunne ke baad ka toast (jaise photo abhi sirf chuni, baad mein upload hogi)
  savedMessage?: string
}) {
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const upload = useMutation({
    mutationFn: onUpload,
    onSuccess: () => toast.success(savedMessage ?? t('photo.uploaded')),
    onError: (err) => setError(getApiError(err).fields.photo ?? getApiError(err).message),
  })
  const remove = useMutation({
    mutationFn: onRemove,
    onSuccess: () => toast.success(t('photo.removed')),
    onError: (err) => toast.error(getApiError(err).message),
  })
  const busy = upload.isPending || remove.isPending

  // Server se pehle yahin jaanch: qism aur size
  function choose(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    if (!TYPES.includes(file.type)) return setError(t('photo.errors.type'))
    if (file.size > MAX_BYTES) return setError(t('photo.errors.size'))
    upload.mutate(file)
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative">
        {shape === 'square' ? (
          photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="h-24 w-24 rounded-2xl bg-gray-100 object-cover ring-1 ring-gray-200"
            />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand text-3xl font-semibold text-on-brand">
              {name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join('')}
            </span>
          )
        ) : (
          <Avatar name={name} photoUrl={photoUrl ?? undefined} size="lg" />
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
            <FontAwesomeIcon icon={faSpinner} spin />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{hint ?? t('photo.hint')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faCamera} className="text-xs" />
            {photoUrl ? t('photo.change') : t('photo.upload')}
          </button>
          {photoUrl && (
            <button
              type="button"
              disabled={busy}
              onClick={() => remove.mutate()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faTrash} className="text-xs" />
              {t('photo.remove')}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={choose}
          className="hidden"
          aria-label={label}
        />
      </div>
    </div>
  )
}

export default PhotoUploader
