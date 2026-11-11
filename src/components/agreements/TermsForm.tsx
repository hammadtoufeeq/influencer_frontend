import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { CURRENCIES } from '../../constants/services'
import {
  MAX_MILESTONES,
  agreementTotal,
  type AgreementTerms,
} from '../../types/agreement'
import type { Currency } from '../../types/services'
import { money } from '../../utils/price'

interface TermsFormProps {
  initial: AgreementTerms
  errors: Record<string, string>
  isSaving: boolean
  submitLabel: string
  onSubmit: (terms: AgreementTerms) => void
  onCancel?: () => void
}

interface MilestoneRow {
  title: string
  amount: string
  dueDate: string
}

const input =
  'w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand'
const border = (error?: string) => (error ? 'border-red-500' : 'border-gray-300')

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null
}

// Muahide ki shartein: naya muahida ya counter-offer (dono mein yahi form)
function TermsForm({ initial, errors, isSaving, submitLabel, onSubmit, onCancel }: TermsFormProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState(initial.title)
  const [scope, setScope] = useState(initial.scope)
  const [currency, setCurrency] = useState<Currency>(initial.currency)
  const [milestones, setMilestones] = useState<MilestoneRow[]>(
    initial.milestones.map((m) => ({
      title: m.title,
      amount: m.amount ? String(m.amount) : '',
      dueDate: m.dueDate ? m.dueDate.slice(0, 10) : '',
    })),
  )
  const [paymentTerms, setPaymentTerms] = useState(initial.paymentTerms ?? '')
  const [usageRights, setUsageRights] = useState(initial.usageRights ?? '')
  const [cancellationTerms, setCancellationTerms] = useState(initial.cancellationTerms ?? '')
  const [local, setLocal] = useState<Record<string, string>>({})
  const shown = { ...errors, ...local }

  const terms = (): AgreementTerms => ({
    title: title.trim(),
    scope: scope.trim(),
    currency,
    milestones: milestones.map((m) => ({
      title: m.title.trim(),
      amount: Number(m.amount) || 0,
      dueDate: m.dueDate || undefined,
    })),
    paymentTerms: paymentTerms.trim() || undefined,
    usageRights: usageRights.trim() || undefined,
    // Sign ke baad changes nahi maange ja sakte, is liye rounds of changes 0
    revisions: 0,
    cancellationTerms: cancellationTerms.trim() || undefined,
  })

  const setRow = (index: number, key: keyof MilestoneRow, value: string) =>
    setMilestones((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Pehle yahin jaanch, taake ghalti foran dikhe
    const found: Record<string, string> = {}
    if (title.trim().length < 3) found.title = t('agreements.errors.title')
    if (scope.trim().length < 20) found.scope = t('agreements.errors.scope')
    if (milestones.length === 0) found.milestones = t('agreements.errors.milestones')
    milestones.forEach((m, i) => {
      if (m.title.trim().length < 3) found[`milestones.${i}.title`] = t('agreements.errors.title')
    })
    setLocal(found)
    if (Object.keys(found).length) return
    onSubmit(terms())
  }

  const total = agreementTotal(terms())

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('agreements.fields.title')}</span>
        <input
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          className={`${input} ${border(shown.title)}`}
        />
        <FieldError message={shown.title} />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{t('agreements.fields.scope')}</span>
        <textarea
          rows={5}
          maxLength={3000}
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder={t('agreements.fields.scopePlaceholder')}
          className={`${input} ${border(shown.scope)}`}
        />
        <FieldError message={shown.scope} />
      </label>

      <fieldset>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <legend className="text-sm font-medium">{t('agreements.fields.milestones')}</legend>
          <label className="flex items-center gap-2 text-sm">
            {t('agreements.fields.currency')}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{t('agreements.fields.milestonesHint')}</p>
        <div className="mt-3 space-y-3">
          {milestones.map((row, index) => (
            <div key={index} className="rounded-xl border border-gray-200 p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_140px_160px_auto]">
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-500">
                    {t('agreements.fields.milestoneTitle', { number: index + 1 })}
                  </span>
                  <input
                    value={row.title}
                    maxLength={120}
                    onChange={(e) => setRow(index, 'title', e.target.value)}
                    className={`${input} ${border(shown[`milestones.${index}.title`])}`}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-500">
                    {t('agreements.fields.amount', { currency })}
                  </span>
                  <input
                    inputMode="numeric"
                    value={row.amount}
                    onChange={(e) => setRow(index, 'amount', e.target.value.replace(/[^\d]/g, ''))}
                    className={`${input} ${border(shown[`milestones.${index}.amount`])}`}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-500">
                    {t('agreements.fields.dueDate')}
                  </span>
                  <input
                    type="date"
                    value={row.dueDate}
                    onChange={(e) => setRow(index, 'dueDate', e.target.value)}
                    className={`${input} border-gray-300`}
                  />
                </label>
                {milestones.length > 1 && (
                  <button
                    type="button"
                    aria-label={t('agreements.fields.removeMilestone')}
                    onClick={() => setMilestones((rows) => rows.filter((_, i) => i !== index))}
                    className="self-end rounded-lg border border-gray-300 px-3 py-2 text-gray-500 hover:bg-gray-100"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
              <FieldError message={shown[`milestones.${index}.title`]} />
            </div>
          ))}
        </div>
        <FieldError message={shown.milestones} />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {milestones.length < MAX_MILESTONES && (
            <button
              type="button"
              onClick={() => setMilestones((rows) => [...rows, { title: '', amount: '', dueDate: '' }])}
              className="inline-flex items-center gap-1.5 text-sm underline"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              {t('agreements.fields.addMilestone')}
            </button>
          )}
          <p className="text-sm font-semibold">
            {t('agreements.total', { amount: money(total, currency) })}
          </p>
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('agreements.fields.paymentTerms')}</span>
          <textarea
            rows={3}
            maxLength={1000}
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            placeholder={t('agreements.fields.paymentTermsPlaceholder')}
            className={`${input} border-gray-300`}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('agreements.fields.usageRights')}</span>
          <textarea
            rows={3}
            maxLength={1000}
            value={usageRights}
            onChange={(e) => setUsageRights(e.target.value)}
            placeholder={t('agreements.fields.usageRightsPlaceholder')}
            className={`${input} border-gray-300`}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            {t('agreements.fields.cancellationTerms')}
          </span>
          <textarea
            rows={3}
            maxLength={1000}
            value={cancellationTerms}
            onChange={(e) => setCancellationTerms(e.target.value)}
            placeholder={t('agreements.fields.cancellationPlaceholder')}
            className={`${input} border-gray-300`}
          />
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:opacity-60"
        >
          {isSaving ? t('common.saving') : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default TermsForm
