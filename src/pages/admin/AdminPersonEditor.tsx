import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminGetPerson, createPerson, updatePerson } from '../../api/admin'
import PersonForm from '../../components/admin/PersonForm'
import type { PersonInput } from '../../types/admin'
import { getApiError } from '../../utils/apiError'

// /admin/people/new aur /admin/people/:id/edit dono yahi page hai
function AdminPersonEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    data: person,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin', 'person', id],
    queryFn: () => adminGetPerson(id!),
    enabled: !isNew,
    staleTime: 0,
  })

  const save = useMutation({
    mutationFn: (input: PersonInput) => (isNew ? createPerson(input) : updatePerson(id!, input)),
    onMutate: () => setErrors({}),
    onSuccess: (saved) => {
      toast.success(isNew ? 'Profile created' : 'Changes saved')
      queryClient.invalidateQueries({ queryKey: ['admin'] })
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

  if (!isNew && isLoading) return <p className="text-gray-500">Loading...</p>
  if (!isNew && (isError || !person)) return <p className="text-red-600">Profile not found.</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm underline">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-1.5" />
          Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          {isNew ? 'New profile' : `Edit ${person!.name}`}
        </h1>
      </div>
      {/* key: dusri profile kholne pe form naye data se shuru ho */}
      <PersonForm
        key={person?._id ?? 'new'}
        person={person}
        isSaving={save.isPending}
        errors={errors}
        onSubmit={(input) => save.mutate(input)}
      />
    </div>
  )
}

export default AdminPersonEditor
