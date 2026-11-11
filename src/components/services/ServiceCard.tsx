import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import Switch from '../Switch'
import { categoryIcon } from '../../constants/services'
import type { Service } from '../../types/services'
import { formatPrice } from '../../utils/price'

interface ServiceCardProps {
  service: Service
  isBusy: boolean
  onToggle: (isActive: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

// Talent ke dashboard pe ek service: keemat, waqt, on/off, edit, delete
function ServiceCard({ service, isBusy, onToggle, onEdit, onDelete }: ServiceCardProps) {
  const { t } = useTranslation()
  return (
    <article
      className={`w-full rounded-2xl border bg-white p-4 transition sm:p-5 ${
        service.isActive ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
            service.isActive ? 'bg-brand text-on-brand' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <FontAwesomeIcon icon={categoryIcon(service.category)} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`min-w-0 break-words text-base font-semibold sm:text-lg ${
                service.isActive ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {service.title}
            </h3>
            {!service.isActive && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {t('services.hidden')}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 sm:text-sm">
            {t(`services.category.${service.category}`)}
          </p>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-lg font-semibold text-gray-900 sm:text-xl">
              {formatPrice(service.pricing)}
            </p>
            {service.deliveryDays && (
              <p className="text-sm text-gray-500">
                <FontAwesomeIcon icon={faClock} className="me-1" />
                {t('services.deliveryIn', { count: service.deliveryDays })}
              </p>
            )}
          </div>

          {service.description && (
            <p className="mt-2 line-clamp-3 text-sm text-gray-600 sm:text-base">
              {service.description}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <Switch
            size="sm"
            checked={service.isActive}
            disabled={isBusy}
            onChange={onToggle}
            label={t('services.fields.active')}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3 sm:justify-end sm:gap-3 sm:pt-4">
        <button
          type="button"
          onClick={onEdit}
          disabled={isBusy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 sm:flex-none"
        >
          <FontAwesomeIcon icon={faPen} className="text-xs" />
          {t('services.edit')}
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isBusy}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:flex-none"
        >
          <FontAwesomeIcon icon={faTrash} className="text-xs" />
          {t('services.delete')}
        </button>
      </div>
    </article>
  )
}

export default ServiceCard