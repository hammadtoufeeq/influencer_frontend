import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import type { ApiSuccess } from '../types/api'

interface HealthData {
  status: string
}

function Home() {
  // Backend se /api/health check karte hain taake pata chale dono connect hain
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get<ApiSuccess<HealthData>>('/health')
      return res.data.data
    },
  })

  return (
    <section className="text-center">
      <h1 className="text-3xl font-bold md:text-4xl">
        Discover the people who influence your world
      </h1>
      <p className="mt-6 text-sm text-gray-600">
        Backend status:{' '}
        {isLoading && 'checking...'}
        {isError && <span className="text-red-600">not connected</span>}
        {data && <span className="text-green-600">{data.status}</span>}
      </p>
    </section>
  )
}

export default Home
