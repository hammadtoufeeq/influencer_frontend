import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export type ComingSoonPage = 'services' | 'inbox' | 'notifications' | 'shortlists' | 'talents' | 'settings'

interface ComingSoonProps {
  // Title, description aur features translation file (comingSoon.<page>) se aate hain
  page: ComingSoonPage
  icon: IconDefinition
}

// Jo pages abhi bane nahi, unki jagah. Link toota hua (404) na lage
function ComingSoon({ page, icon }: ComingSoonProps) {
  const { t } = useTranslation()
  const features = [t(`comingSoon.${page}.f1`), t(`comingSoon.${page}.f2`), t(`comingSoon.${page}.f3`)]

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-xl text-on-brand">
        <FontAwesomeIcon icon={icon} />
      </span>
      <h1 className="mt-4 text-2xl font-bold">{t(`comingSoon.${page}.title`)}</h1>
      <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
        {t('comingSoon.badge')}
      </span>
      <p className="mt-4 text-gray-600">{t(`comingSoon.${page}.description`)}</p>
      <ul className="mx-auto mt-6 max-w-md space-y-2 text-start text-sm text-gray-700">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        to="/dashboard"
        className="mt-8 inline-block rounded-lg bg-brand px-5 py-2 text-sm font-medium text-on-brand hover:bg-brand-hover"
      >
        {t('site.backToDashboard')}
      </Link>
    </section>
  )
}

export default ComingSoon
