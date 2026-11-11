import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { CURRENCIES } from '../../constants/services'
import type { HireInput } from '../../types/business'
import type { Person } from '../../types/person'
import type { Currency } from '../../types/services'
import { formatPrice } from '../../utils/price'

interface HireDialogProps {
  person: Person
  isSaving: boolean
  errors: Record<string, string>
  onSend: (input: HireInput) => void
  onClose: () => void
}

const input =
  'w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand'
const border = (error?: string) => (error ? 'border-red-500' : 'border-gray-300')

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null
}

// Verified business ka hire request form (modal)
function HireDialog({ person, isSaving, errors, onSend, onClose }: HireDialogProps) {
  const { t } = useTranslation()
  const services = (person.services ?? []).filter((s) => s.isActive)
  const [serviceId, setServiceId] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('PKR')
  const [startDate, setStartDate] = useState('')
  const [local, setLocal] = useState<Record<string, string>>({})
  // Aaj se pehle ki tareekh nahi chuni ja sakti
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const shown = { ...errors, ...local }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !isSaving && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, isSaving])

  function chooseService(id: string) {
    setServiceId(id)
    const service = services.find((s) => s._id === id)
    // Service chuni aur title khali hai to service ka naam hi title
    if (service && !title.trim()) setTitle(service.title)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const found: Record<string, string> = {}
    if (title.trim().length < 3) found.title = t('hire.errors.title')
    if (message.trim().length < 20) found.message = t('hire.errors.message')
    if (amount && !(Number(amount) > 0)) found['budget.amount'] = t('hire.errors.amount')
    setLocal(found)
    if (Object.keys(found).length) return

    onSend({
      personId: person._id,
      serviceId: serviceId || undefined,
      title: title.trim(),
      message: message.trim(),
      budget: amount ? { amount: Number(amount), currency } : undefined,
      startDate: startDate || undefined,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={() => !isSaving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hire-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 id="hire-dialog-title" className="text-lg font-semibold text-gray-900">
            {t('hire.dialogTitle', { name: person.name })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('settings.close')}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-6 py-5">
            {services.length > 0 && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium">{t('hire.service')}</span>
                <select
                  value={serviceId}
                  onChange={(e) => chooseService(e.target.value)}
                  className={`${input} ${border(shown.serviceId)}`}
                >
                  <option value="">{t('hire.noService')}</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.title} · {formatPrice(service.pricing)}
                    </option>
                  ))}
                </select>
                <FieldError message={shown.serviceId} />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('hire.title')}</span>
              <input
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('hire.titlePlaceholder')}
                className={`${input} ${border(shown.title)}`}
              />
              <FieldError message={shown.title} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('hire.message')}</span>
              <textarea
                rows={5}
                maxLength={2000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('hire.messagePlaceholder')}
                className={`${input} ${border(shown.message)}`}
              />
              <FieldError message={shown.message} />
            </label>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">{t('hire.budget')}</span>
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder={t('hire.budgetPlaceholder')}
                  className={`${input} ${border(shown['budget.amount'])}`}
                />
                <FieldError message={shown['budget.amount']} />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">{t('hire.currency')}</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className={`${input} border-gray-300`}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('hire.startDate')}</span>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                className={`${input} ${border(shown.startDate)}`}
              />
              <FieldError message={shown.startDate} />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
            >
              {isSaving ? t('common.saving') : t('hire.send')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default HireDialog
