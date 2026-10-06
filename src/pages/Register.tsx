import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import FormField from '../components/FormField'
import { SIGNUP_ROLE_OPTIONS } from '../constants/roles'
import { useAuth } from '../hooks/useAuth'
import type { SignupRole } from '../types/user'
import { getApiError } from '../utils/apiError'

function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<SignupRole | ''>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    if (!role) {
      setErrors({ role: 'Choose an account type' })
      return
    }

    setIsSubmitting(true)
    try {
      const created = await register({ name, email, password, role })
      toast.success(`Welcome, ${created.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-gray-500">First, tell us who you are.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">I am a...</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SIGNUP_ROLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  role === option.value
                    ? 'border-gray-900 ring-2 ring-gray-900'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />
                <span className="block font-medium">{option.label}</span>
                <span className="mt-1 block text-sm text-gray-500">
                  {option.description}
                </span>
              </label>
            ))}
          </div>
          {errors.role && <p className="mt-2 text-sm text-red-600">{errors.role}</p>}
        </fieldset>

        <div className="space-y-4">
          <FormField
            id="name"
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gray-900 underline">
          Log in
        </Link>
      </p>
    </section>
  )
}

export default Register
