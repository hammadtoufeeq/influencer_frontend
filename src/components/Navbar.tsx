import { Link, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PLATFORM_NAME } from '../constants/config'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition sm:px-3 ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="truncate text-base font-bold sm:text-xl">
          {PLATFORM_NAME}
        </Link>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NavLink to="/search" className={linkClass}>
            Explore
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="whitespace-nowrap rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-100 sm:px-3"
              >
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Log in
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
