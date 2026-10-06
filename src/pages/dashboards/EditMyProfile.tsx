import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { updatePerson } from '../../api/admin'
import { myProfileQuery } from '../../api/queries'
import PersonForm from '../../components/admin/PersonForm'
import type { PersonInput } from '../../types/admin'
import { getApiError } from '../../utils/apiError'

// /dashboard/profile/edit -> talent apni claimed profile edit karta hai
function EditMyProfile() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { data: profile, isLoading } = useQuery(myProfileQuery)

  const save = useMutation({
    mutationFn: (input: PersonInput) => updatePerson(profile!._id, input),
    onMutate: () => setErrors({}),
    onSuccess: (saved) => {
      toast.success('Profile updated')
      queryClient.invalidateQueries({ queryKey: ['claims'] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['person', saved.slug] })
      navigate('/dashboard')
    },
    onError: (error) => {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  })

  if (isLoading) return <p className="text-gray-500">Loading...</p>
  // Profile claim nahi hui to edit ka sawal hi nahi
  if (!profile) return <Navigate to="/dashboard" replace />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit your profile</h1>
        <p className="text-sm text-gray-500">These details are shown on your public profile.</p>
      </div>
      <PersonForm
        key={profile._id}
        person={profile}
        mode="owner"
        isSaving={save.isPending}
        errors={errors}
        onSubmit={(input) => save.mutate(input)}
      />
    </div>
  )
}

export default EditMyProfile
