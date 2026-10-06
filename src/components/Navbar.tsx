import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PLATFORM_NAME } from '../constants/config'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-lg font-bold sm:text-xl">
          {PLATFORM_NAME}
        </Link>

        {!isLoading && (
          <div className="flex items-center gap-2 text-sm sm:gap-4">
            <Link to="/search" className="hover:underline">
              Explore
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-100"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
