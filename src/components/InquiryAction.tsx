import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleQuestion, faPaperPlane, faXmark } from '@fortawesome/free-solid-svg-icons'
import { sendInquiry } from '../api/inquiries'
import { useAuth } from '../hooks/useAuth'
import type { Person } from '../types/person'
import { getApiError } from '../utils/apiError'

const outline =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm hover:bg-gray-100'
const input =
  'w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand'
const border = (error?: string) => (error ? 'border-red-500' : 'border-gray-300')
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null
}

// Sawal ka form (modal). Login ho to naam / email pehle se bhare
function InquiryDialog({ person, onClose }: { person: Person; onClose: () => void }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  // Bots ke liye chhupa khana
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Khana badla to us ka purana error hatao
  const edit = (field: string, set: (value: string) => void) => (value: string) => {
    set(value)
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const send = useMutation({
    mutationFn: () =>
      sendInquiry({
        personId: person._id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
        website: website || undefined,
      }),
    onSuccess: () => {
      toast.success(t('inquiry.sent'))
      onClose()
    },
    onError: (error) => {
      const { message: text, fields } = getApiError(error)
      setErrors(fields)
      toast.error(text)
    },
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !send.isPending && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, send.isPending])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const found: Record<string, string> = {}
    if (name.trim().length < 2) found.name = t('inquiry.errors.name')
    if (!EMAIL.test(email.trim())) found.email = t('inquiry.errors.email')
    if (message.trim().length < 10) found.message = t('inquiry.errors.message')
    setErrors(found)
    if (Object.keys(found).length === 0) send.mutate()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={() => !send.isPending && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 id="inquiry-dialog-title" className="text-lg font-semibold text-gray-900">
              {t('inquiry.title', { name: person.name })}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{t('inquiry.intro')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('settings.close')}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">{t('inquiry.name')}</span>
                <input
                  value={name}
                  maxLength={100}
                  autoComplete="name"
                  onChange={(e) => edit('name', setName)(e.target.value)}
                  className={`${input} ${border(errors.name)}`}
                />
                <FieldError message={errors.name} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">{t('inquiry.email')}</span>
                <input
                  type="email"
                  value={email}
                  maxLength={200}
                  autoComplete="email"
                  onChange={(e) => edit('email', setEmail)(e.target.value)}
                  className={`${input} ${border(errors.email)}`}
                />
                <FieldError message={errors.email} />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('inquiry.phone')}</span>
              <input
                type="tel"
                value={phone}
                maxLength={30}
                autoComplete="tel"
                onChange={(e) => edit('phone', setPhone)(e.target.value)}
                placeholder="+92 300 1234567"
                className={`${input} ${border(errors.phone)}`}
              />
              <FieldError message={errors.phone} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('inquiry.message')}</span>
              <textarea
                rows={5}
                maxLength={2000}
                value={message}
                onChange={(e) => edit('message', setMessage)(e.target.value)}
                placeholder={t('inquiry.messagePlaceholder', { name: person.name })}
                className={`${input} ${border(errors.message)}`}
              />
              <FieldError message={errors.message} />
            </label>
            {/* Insaan ko nazar nahi aata; bot bhar de to backend kuch save nahi karta */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={send.isPending}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={send.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
              {send.isPending ? t('inquiry.sending') : t('inquiry.send')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

// Profile page pe "Send a query": koi bhi (login ke baghair bhi). Apni hi profile pe nahi
function InquiryAction({ person }: { person: Person }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (user && person.claimedBy === user._id) return null

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={outline}>
        <FontAwesomeIcon icon={faCircleQuestion} />
        {t('inquiry.button')}
      </button>
      {open && <InquiryDialog person={person} onClose={() => setOpen(false)} />}
    </>
  )
}

export default InquiryAction
