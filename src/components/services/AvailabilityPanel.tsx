import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import Switch from '../Switch'
import { OPEN_TO_OPTIONS, RESPONSE_TIMES } from '../../constants/services'
import type { Availability, AvailabilityInput, OpenTo, ResponseTime } from '../../types/services'

interface AvailabilityPanelProps {
  availability: Availability | null
  isSaving: boolean
  onSave: (input: AvailabilityInput) => void
}

const toDateInput = (iso?: string) => (iso ? iso.slice(0, 10) : '')

// "Abhi kaam le raha hoon?" + kis qism ka + kitni jaldi jawab
function AvailabilityPanel({ availability, isSaving, onSave }: AvailabilityPanelProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(availability?.isOpen ?? false)
  const [openTo, setOpenTo] = useState<OpenTo[]>(availability?.openTo ?? [])
  const [responseTime, setResponseTime] = useState<ResponseTime | ''>(
    availability?.responseTime ?? '',
  )
  const [availableFrom, setAvailableFrom] = useState(toDateInput(availability?.availableFrom))
  const [note, setNote] = useState(availability?.note ?? '')

  const saved = {
    isOpen: availability?.isOpen ?? false,
    openTo: [...(availability?.openTo ?? [])].sort().join(),
    responseTime: availability?.responseTime ?? '',
    availableFrom: toDateInput(availability?.availableFrom),
    note: availability?.note ?? '',
  }
  const dirty =
    saved.isOpen !== isOpen ||
    saved.openTo !== [...openTo].sort().join() ||
    saved.responseTime !== responseTime ||
    saved.availableFrom !== availableFrom ||
    saved.note !== note.trim()

  const toggle = (value: OpenTo) =>
    setOpenTo((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]))

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200/70 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          <FontAwesomeIcon icon={faCalendarCheck} />
        </span>
        <div>
          <h2 className="font-semibold text-gray-900">{t('services.availability')}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{t('services.availabilityText')}</p>
        </div>
      </div>

      {/* Bara switch: kaam le raha hoon ya nahi */}
      <div
        className={`mt-5 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition ${
          isOpen ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div>
          <p className={`text-sm font-semibold ${isOpen ? 'text-green-800' : 'text-gray-900'}`}>
            {isOpen ? t('services.openForWork') : t('services.notTakingWork')}
          </p>
          <p className="text-xs text-gray-500">
            {isOpen ? t('services.openHint') : t('services.closedHint')}
          </p>
        </div>
        <Switch checked={isOpen} onChange={setIsOpen} label={t('services.openForWork')} />
      </div>

      <fieldset className="mt-5" disabled={!isOpen}>
        <legend className="mb-2 text-sm font-medium">{t('services.openTo')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {OPEN_TO_OPTIONS.map((option) => {
            const active = openTo.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(option.value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-start text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? 'border-gray-900 ring-1 ring-gray-900'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                <FontAwesomeIcon icon={option.icon} className="w-4 text-gray-500" />
                {t(`services.openToOption.${option.value}`)}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('services.responseTime')}</span>
          <select
            value={responseTime}
            onChange={(e) => setResponseTime(e.target.value as ResponseTime | '')}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">{t('services.notSet')}</option>
            {RESPONSE_TIMES.map((value) => (
              <option key={value} value={value}>
                {t(`services.response.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('services.availableFrom')}</span>
          <input
            type="date"
            value={availableFrom}
            onChange={(e) => setAvailableFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium">{t('services.note')}</span>
        <textarea
          rows={3}
          maxLength={280}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('services.notePlaceholder')}
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-brand"
        />
        <span className="mt-1 block text-end text-xs text-gray-400">{note.length}/280</span>
      </label>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">{dirty ? t('services.unsaved') : ''}</p>
        <button
          type="button"
          disabled={!dirty || isSaving}
          onClick={() =>
            onSave({
              isOpen,
              openTo,
              responseTime: responseTime || null,
              availableFrom: availableFrom || null,
              note: note.trim(),
            })
          }
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-on-brand hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? t('settings.saving') : t('services.saveAvailability')}
        </button>
      </div>
    </section>
  )
}

export default AvailabilityPanel
