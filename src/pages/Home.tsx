import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listPeople } from '../api/people'
import PersonCard from '../components/PersonCard'
import SearchBar from '../components/SearchBar'
import { useTaxonomy } from '../hooks/useTaxonomy'

function Home() {
  const { data: industries } = useTaxonomy('industries')

  // Sab se zyada followers wale 6 log
  const { data: featured, isLoading } = useQuery({
    queryKey: ['people', 'featured'],
    queryFn: () => listPeople(new URLSearchParams({ limit: '6', sort: 'followers' })),
  })

  return (
    <div className="space-y-14">
      <section className="py-6 text-center md:py-12">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          Discover the people who influence your world
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 md:text-lg">
          Find journalists, creators, speakers, experts and public figures. See their
          real reach, then connect or hire.
        </p>
        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBar size="lg" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Browse by industry</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {industries?.map((industry) => (
            <Link
              key={industry._id}
              to={`/search?industry=${industry.slug}`}
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm hover:border-gray-900"
            >
              {industry.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Most followed</h2>
          <Link to="/search" className="text-sm underline">
            See all
          </Link>
        </div>
        {isLoading && <p className="mt-4 text-gray-500">Loading...</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {featured?.people.map((person) => (
            <PersonCard key={person._id} person={person} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
