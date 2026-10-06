import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { getApiError } from '../utils/apiError'

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) return <Navigate to={redirectTo} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsSubmitting(true)

    try {
      const loggedIn = await login({ email, password })
      toast.success(`Welcome back, ${loggedIn.name}!`)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-gray-500">Welcome back! Enter your details.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-gray-900 underline">
          Sign up
        </Link>
      </p>
    </section>
  )
}

export default Login
