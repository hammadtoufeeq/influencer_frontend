import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCompass,
  faRightFromBracket,
  faRightToBracket,
  faTableColumns,
} from '@fortawesome/free-solid-svg-icons'
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

  // Bohat chhoti screen pe sirf icon, baqi sab pe icon + naam
  const labelClass = 'max-[420px]:sr-only'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition sm:px-3 ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="truncate text-base font-bold sm:text-xl">
          {PLATFORM_NAME}
        </Link>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NavLink to="/search" className={linkClass} aria-label="Explore">
            <FontAwesomeIcon icon={faCompass} />
            <span className={labelClass}>Explore</span>
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass} aria-label="Dashboard">
                <FontAwesomeIcon icon={faTableColumns} />
                <span className={labelClass}>Dashboard</span>
              </NavLink>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-100 sm:px-3"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                <span className={labelClass}>Log out</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass} aria-label="Log in">
              <FontAwesomeIcon icon={faRightToBracket} />
              <span className={labelClass}>Log in</span>
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
