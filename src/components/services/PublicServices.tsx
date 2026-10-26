import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { categoryIcon } from '../../constants/services'
import type { Service } from '../../types/services'
import { formatPrice } from '../../utils/price'

// Public profile pe talent ki chalti services aur keematein
function PublicServices({ services }: { services: Service[] }) {
  const { t } = useTranslation()
  if (services.length === 0) return null
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70">
      <h2 className="text-lg font-semibold">{t('services.publicTitle')}</h2>
      <ul className="mt-4 divide-y divide-gray-100">
        {services.map((service) => (
          <li key={service._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <FontAwesomeIcon icon={categoryIcon(service.category)} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-semibold text-gray-900">{service.title}</h3>
                <p className="text-sm font-semibold whitespace-nowrap text-gray-900">
                  {formatPrice(service.pricing)}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {t(`services.category.${service.category}`)}
                {service.deliveryDays && (
                  <>
                    {' · '}
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    {t('services.deliveryIn', { count: service.deliveryDays })}
                  </>
                )}
              </p>
              {service.description && (
                <p className="mt-2 text-sm whitespace-pre-line text-gray-600">
                  {service.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PublicServices
