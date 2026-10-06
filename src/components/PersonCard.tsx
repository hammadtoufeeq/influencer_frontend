import { Link } from 'react-router-dom'
import type { PersonSummary } from '../types/person'
import { countryName, formatCount } from '../utils/format'
import Avatar from './Avatar'
import VerifiedBadge from './VerifiedBadge'

function PersonCard({ person }: { person: PersonSummary }) {
  const location = [person.city, countryName(person.country)].filter(Boolean).join(', ')

  return (
    <Link
      to={`/people/${person.slug}`}
      className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-400 hover:shadow-sm"
    >
      <Avatar name={person.name} photoUrl={person.photoUrl} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{person.name}</h3>
          {person.verified && <VerifiedBadge />}
        </div>
        {person.headline && (
          <p className="mt-0.5 line-clamp-2 text-sm text-gray-600">{person.headline}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          {person.professions.map((p) => p.name).join(' · ')}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {location && <span>📍 {location}</span>}
          {person.totalFollowers > 0 && (
            <span>👥 {formatCount(person.totalFollowers)} followers</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default PersonCard
