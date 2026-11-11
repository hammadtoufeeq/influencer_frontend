import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import Switch from '../Switch'
import { CURRENCIES, PRICE_UNITS, SERVICE_CATEGORIES } from '../../constants/services'
import type { PricingType, Service, ServiceInput } from '../../types/services'

interface ServiceDialogProps {
  // Edit ke liye maujooda service; naye ke liye shuruati values (template)
  service?: Service
  initial?: Partial<ServiceInput>
  isSaving: boolean
  errors: Record<string, string>
  onSave: (input: ServiceInput) => void
  onClose: () => void
}

const PRICING_TYPES: PricingType[] = ['fixed', 'range', 'quote']
const input =
  'w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand'
const border = (error?: string) => (error ? 'border-red-500' : 'border-gray-300')
const digits = (value: string) => value.replace(/[^\d]/g, '')

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null
}

// Service banane / badalne ka form (modal)
function ServiceDialog({
  service,
  initial,
  isSaving,
  errors,
  onSave,
  onClose,
}: ServiceDialogProps) {
  const { t } = useTranslation()
  const start = service ?? initial
  const [title, setTitle] = useState(start?.title ?? '')
  const [category, setCategory] = useState(start?.category ?? 'keynote')
  const [description, setDescription] = useState(start?.description ?? '')
  const [pricingType, setPricingType] = useState<PricingType>(start?.pricing?.type ?? 'fixed')
  const [currency, setCurrency] = useState(start?.pricing?.currency ?? 'PKR')
  const [unit, setUnit] = useState(start?.pricing?.unit ?? 'project')
  const [amount, setAmount] = useState(String(start?.pricing?.amount ?? ''))
  const [min, setMin] = useState(String(start?.pricing?.min ?? ''))
  const [max, setMax] = useState(String(start?.pricing?.max ?? ''))
  const [deliveryDays, setDeliveryDays] = useState(String(start?.deliveryDays ?? ''))
  const [isActive, setIsActive] = useState(start?.isActive ?? true)
  const [local, setLocal] = useState<Record<string, string>>({})
  // Jin fields ko submit ke baad badla gaya, un ka purana error chhupa do
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const shown = Object.fromEntries(
    Object.entries({ ...errors, ...local }).filter(([key]) => !touched.has(key)),
  )
  const edit = (key: string, setter: (value: string) => void) => (value: string) => {
    setTouched((set) => new Set(set).add(key))
    setter(value)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !isSaving && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, isSaving])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Pehle yahin jaanch, taake ghalti foran dikhe
    const found: Record<string, string> = {}
    if (title.trim().length < 3) found.title = t('services.errors.title')
    if (pricingType === 'fixed' && !(Number(amount) > 0)) {
      found['pricing.amount'] = t('services.errors.amount')
    }
    if (pricingType === 'range') {
      if (!(Number(min) > 0)) found['pricing.min'] = t('services.errors.amount')
      if (!(Number(max) > Number(min))) found['pricing.max'] = t('services.errors.max')
    }
    setLocal(found)
    setTouched(new Set())
    if (Object.keys(found).length) return

    onSave({
      title: title.trim(),
      category,
      description: description.trim() || undefined,
      pricing:
        pricingType === 'fixed'
          ? { type: 'fixed', currency, unit, amount: Number(amount) }
          : pricingType === 'range'
            ? { type: 'range', currency, unit, min: Number(min), max: Number(max) }
            : { type: 'quote', currency, unit },
      deliveryDays: deliveryDays ? Number(deliveryDays) : null,
      isActive,
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
        aria-labelledby="service-dialog-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 id="service-dialog-title" className="text-lg font-semibold text-gray-900">
            {service ? t('services.editService') : t('services.addService')}
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

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto px-6 py-5">
            <div>
              <label htmlFor="svc-title" className="mb-1 block text-sm font-medium">
                {t('services.fields.title')}
              </label>
              <input
                id="svc-title"
                value={title}
                maxLength={80}
                onChange={(e) => edit('title', setTitle)(e.target.value)}
                placeholder={t('services.fields.titlePlaceholder')}
                className={`${input} ${border(shown.title)}`}
                autoFocus
              />
              <FieldError message={shown.title} />
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium">
                {t('services.fields.category')}
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SERVICE_CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    aria-pressed={category === c.value}
                    className={`rounded-xl border px-3 py-2 text-start text-xs font-medium transition ${
                      category === c.value
                        ? 'border-brand bg-brand text-on-brand'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {t(`services.category.${c.value}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="svc-desc" className="mb-1 block text-sm font-medium">
                {t('services.fields.description')}
              </label>
              <textarea
                id="svc-desc"
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('services.fields.descriptionPlaceholder')}
                className={`${input} ${border(shown.description)} resize-y`}
              />
              <p className="mt-1 text-end text-xs text-gray-400">{description.length}/500</p>
            </div>

            {/* Keemat */}
            <fieldset className="rounded-xl border border-gray-200 p-4">
              <legend className="px-1 text-sm font-medium">{t('services.fields.pricing')}</legend>
              <div className="inline-flex rounded-xl bg-gray-100 p-1" role="radiogroup">
                {PRICING_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={pricingType === type}
                    onClick={() => setPricingType(type)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      pricingType === type
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {t(`services.pricingType.${type}`)}
                  </button>
                ))}
              </div>

              {pricingType === 'quote' ? (
                <p className="mt-3 text-sm text-gray-500">{t('services.quoteHint')}</p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-[110px_1fr]">
                  <select
                    aria-label={t('services.fields.currency')}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as typeof currency)}
                    className={`${input} border-gray-300`}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  {pricingType === 'fixed' ? (
                    <div>
                      <input
                        inputMode="numeric"
                        aria-label={t('services.fields.amount')}
                        placeholder={t('services.fields.amount')}
                        value={amount}
                        onChange={(e) => edit('pricing.amount', setAmount)(digits(e.target.value))}
                        className={`${input} ${border(shown['pricing.amount'])}`}
                      />
                      <FieldError message={shown['pricing.amount']} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          inputMode="numeric"
                          aria-label={t('services.fields.min')}
                          placeholder={t('services.fields.min')}
                          value={min}
                          onChange={(e) => edit('pricing.min', setMin)(digits(e.target.value))}
                          className={`${input} ${border(shown['pricing.min'])}`}
                        />
                        <FieldError message={shown['pricing.min']} />
                      </div>
                      <div>
                        <input
                          inputMode="numeric"
                          aria-label={t('services.fields.max')}
                          placeholder={t('services.fields.max')}
                          value={max}
                          onChange={(e) => edit('pricing.max', setMax)(digits(e.target.value))}
                          className={`${input} ${border(shown['pricing.max'])}`}
                        />
                        <FieldError message={shown['pricing.max']} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">
                    {t('services.fields.unit')}
                  </span>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as typeof unit)}
                    className={`${input} border-gray-300`}
                  >
                    {PRICE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {t(`services.unit.${u}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">
                    {t('services.fields.delivery')}
                  </span>
                  <input
                    inputMode="numeric"
                    value={deliveryDays}
                    placeholder={t('services.fields.deliveryPlaceholder')}
                    onChange={(e) => setDeliveryDays(digits(e.target.value).slice(0, 3))}
                    className={`${input} ${border(shown.deliveryDays)}`}
                  />
                </label>
              </div>
            </fieldset>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{t('services.fields.active')}</p>
                <p className="text-xs text-gray-500">{t('services.fields.activeHint')}</p>
              </div>
              <Switch
                checked={isActive}
                onChange={setIsActive}
                label={t('services.fields.active')}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
            >
              {isSaving
                ? t('settings.saving')
                : service
                  ? t('services.saveChanges')
                  : t('services.addService')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

export default ServiceDialog
