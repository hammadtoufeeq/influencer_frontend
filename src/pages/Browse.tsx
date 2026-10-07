import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBriefcase,
  faEarthAsia,
  faHashtag,
  faIndustry,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { COUNTRY_OPTIONS } from '../constants/people'
import { useTaxonomy } from '../hooks/useTaxonomy'
import { countryName } from '../utils/format'

interface Chip {
  key: string
  label: string
  to: string
}

function BrowseSection({
  title,
  icon,
  chips,
}: {
  title: string
  icon: IconDefinition
  chips: Chip[]
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="flex items-center gap-3 text-lg font-semibold">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-sm text-white">
          <FontAwesomeIcon icon={icon} />
        </span>
        {title}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.length === 0 && <p className="text-sm text-gray-500">Loading...</p>}
        {chips.map((chip) => (
          <Link
            key={chip.key}
            to={chip.to}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:border-gray-900 hover:bg-gray-50"
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </section>
  )
}

// /browse -> profession, industry, topic aur country ke hisaab se dhoondo
function Browse() {
  const { data: professions = [] } = useTaxonomy('professions')
  const { data: industries = [] } = useTaxonomy('industries')
  const { data: topics = [] } = useTaxonomy('topics')

  const toChips = (items: { _id: string; name: string; slug: string }[], param: string) =>
    items.map((item) => ({ key: item._id, label: item.name, to: `/search?${param}=${item.slug}` }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Browse</h1>
        <p className="mt-1 text-gray-600">
          Find people by what they do, the industry they work in, the topics they cover, or where
          they are.
        </p>
      </div>
      <BrowseSection title="Industries" icon={faIndustry} chips={toChips(industries, 'industry')} />
      <BrowseSection
        title="Professions"
        icon={faBriefcase}
        chips={toChips(professions, 'profession')}
      />
      <BrowseSection title="Topics" icon={faHashtag} chips={toChips(topics, 'topic')} />
      <BrowseSection
        title="Countries"
        icon={faEarthAsia}
        chips={COUNTRY_OPTIONS.map((code) => ({
          key: code,
          label: countryName(code),
          to: `/search?country=${code}`,
        }))}
      />
    </div>
  )
}

export default Browse
