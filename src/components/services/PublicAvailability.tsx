import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDay, faReply } from '@fortawesome/free-solid-svg-icons'
import { OPEN_TO_OPTIONS } from '../../constants/services'
import type { Availability } from '../../types/services'

// Profile ke sidebar mein: kaam le rahe hain ya nahi, kis cheez ke liye, kitni jaldi jawab
function PublicAvailability({ availability }: { availability?: Availability }) {
  const { t, i18n } = useTranslation()
  // Page khulne ka waqt (render mein Date.now() nahi)
  const [openedAt] = useState(Date.now)
  if (!availability) return null
  const { isOpen } = availability
  const from = availability.availableFrom ? new Date(availability.availableFrom) : null
  const showFrom = from && from.getTime() > openedAt

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70">
      <h2 className="text-lg font-semibold">{t('services.availability')}</h2>
      <p
        className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
          isOpen ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`}
          aria-hidden="true"
        />
        {isOpen ? t('services.availableForHire') : t('services.notAvailable')}
      </p>

      {isOpen && availability.openTo.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500">{t('services.openTo')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {OPEN_TO_OPTIONS.filter((o) => availability.openTo.includes(o.value)).map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm"
              >
                <FontAwesomeIcon icon={o.icon} className="text-xs text-gray-500" />
                {t(`services.openToOption.${o.value}`)}
              </span>
            ))}
          </div>
        </div>
      )}

      {isOpen && (availability.responseTime || showFrom) && (
        <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
          {availability.responseTime && (
            <li>
              <FontAwesomeIcon icon={faReply} className="me-2 w-4 text-gray-400" />
              {t('services.responseTime')}: {t(`services.response.${availability.responseTime}`)}
            </li>
          )}
          {showFrom && (
            <li>
              <FontAwesomeIcon icon={faCalendarDay} className="me-2 w-4 text-gray-400" />
              {t('services.fromDate', {
                date: from.toLocaleDateString(i18n.language, { dateStyle: 'medium' }),
              })}
            </li>
          )}
        </ul>
      )}

      {isOpen && availability.note && (
        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm whitespace-pre-line text-gray-700">
          {availability.note}
        </p>
      )}
    </section>
  )
}

export default PublicAvailability
