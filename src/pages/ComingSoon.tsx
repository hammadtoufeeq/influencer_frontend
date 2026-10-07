import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

interface ComingSoonProps {
  title: string
  icon: IconDefinition
  description: string
  // Is page pe kya kya aayega (document ke tasks)
  features: string[]
}

// Jo pages abhi bane nahi, unki jagah. Link toota hua (404) na lage
function ComingSoon({ title, icon, description, features }: ComingSoonProps) {
  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-sm">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-xl text-white">
        <FontAwesomeIcon icon={icon} />
      </span>
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <span className="mt-2 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
        Coming soon
      </span>
      <p className="mt-4 text-gray-600">{description}</p>
      <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-gray-700">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        to="/dashboard"
        className="mt-8 inline-block rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Back to dashboard
      </Link>
    </section>
  )
}

export default ComingSoon
