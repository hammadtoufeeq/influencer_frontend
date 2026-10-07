import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { myProfileQuery } from '../api/queries'

// /my-profile -> talent ki apni public profile, ya dashboard (agar abhi claim nahi ki)
function MyProfileRedirect() {
  const { data: profile, isLoading } = useQuery(myProfileQuery)
  if (isLoading) return <p className="text-center text-gray-500">Loading...</p>
  return <Navigate to={profile ? `/people/${profile.slug}` : '/dashboard'} replace />
}

export default MyProfileRedirect
