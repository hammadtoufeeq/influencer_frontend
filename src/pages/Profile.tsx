import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faGlobe, faLanguage, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { personQuery } from '../api/queries'
import Avatar from '../components/Avatar'
import ClaimAction from '../components/ClaimAction'
import VerifiedBadge from '../components/VerifiedBadge'
import { PLATFORM_ICONS, PLATFORM_LABELS, STATUS_LABELS } from '../constants/people'
import type { TaxonomyItem } from '../types/person'
import { countryName, formatCount, languageName } from '../utils/format'

function TagList({ title, items, param }: { title: string; items: TaxonomyItem[]; param: string }) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item._id}
            to={`/search?${param}=${item.slug}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  )
}

function Profile() {
  const { slug = '' } = useParams()

  const { data: person, isLoading, error } = useQuery({ ...personQuery(slug), retry: false })

  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>

  if (error || !person) {
    const notFound = axios.isAxiosError(error) && error.response?.status === 404
    return (
      <section className="text-center">
        <h1 className="text-2xl font-bold">
          {notFound ? 'Profile not found' : 'Could not load this profile'}
        </h1>
        <Link to="/search" className="mt-4 inline-block underline">
          Back to search
        </Link>
      </section>
    )
  }

  const location = [person.city, countryName(person.country)].filter(Boolean).join(', ')

  return (
    <div className="space-y-6">
      {person.isDemo && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This is a fictional sample profile used for testing.
        </p>
      )}

      {/* Identity */}
      <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={person.name} photoUrl={person.photoUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold md:text-3xl">{person.name}</h1>
              {person.verified && <VerifiedBadge />}
            </div>
            {person.headline && <p className="mt-1 text-gray-600">{person.headline}</p>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              {location && (
                <span>
                  <FontAwesomeIcon icon={faLocationDot} className="mr-1.5 text-gray-400" />
                  {location}
                </span>
              )}
              {person.languages.length > 0 && (
                <span>
                  <FontAwesomeIcon icon={faLanguage} className="mr-1.5 text-gray-400" />
                  {person.languages.map(languageName).join(', ')}
                </span>
              )}
              <span>
                <FontAwesomeIcon
                  icon={faCircle}
                  className={`mr-1.5 text-[8px] align-middle ${person.status === 'hireable' ? 'text-green-500' : 'text-gray-400'}`}
                />
                {STATUS_LABELS[person.status]}
              </span>
            </div>
          </div>

          {/* Contact agle phase mein */}
          <div className="flex flex-col gap-2 sm:w-44">
            <button
              disabled
              title="Coming soon"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white opacity-50"
            >
              Contact / Hire
            </button>
            <ClaimAction person={person} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {person.bio && (
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-3 whitespace-pre-line text-gray-700">{person.bio}</p>
            </section>
          )}

          <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
            <TagList title="Professions" items={person.professions} param="profession" />
            <TagList title="Industries" items={person.industries} param="industry" />
            <TagList title="Topics" items={person.topics} param="topic" />
          </section>
        </div>

        {/* Influence: har number alag, koi "mystery score" nahi */}
        <aside className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Influence</h2>
            <p className="mt-3 text-3xl font-bold">{formatCount(person.totalFollowers)}</p>
            <p className="text-sm text-gray-500">total followers across platforms</p>

            {person.socialAccounts.length > 0 && (
              <ul className="mt-5 divide-y divide-gray-100">
                {person.socialAccounts.map((account) => (
                  <li
                    key={`${account.platform}-${account.url}`}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <a
                      href={account.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 hover:underline"
                    >
                      <FontAwesomeIcon
                        icon={PLATFORM_ICONS[account.platform]}
                        className="w-4 text-base text-gray-700"
                      />
                      {PLATFORM_LABELS[account.platform]}
                    </a>
                    <span className="text-right text-gray-600">
                      {account.followers !== undefined && formatCount(account.followers)}
                      {account.engagementRate !== undefined && (
                        <span className="ml-2 text-xs text-gray-400">
                          {account.engagementRate}% eng.
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {person.websiteUrl && (
              <a
                href={person.websiteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 inline-flex items-center gap-2 text-sm underline"
              >
                <FontAwesomeIcon icon={faGlobe} />
                Website
              </a>
            )}
          </section>

          <section className="text-xs text-gray-500">
            <p>
              Information on unclaimed profiles comes from public sources. Last updated{' '}
              {new Date(person.updatedAt).toLocaleDateString()}.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Profile
