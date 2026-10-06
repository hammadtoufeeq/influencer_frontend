import { Link, NavLink } from 'react-router-dom'
import { PLATFORM_NAME } from '../constants/config'

// Navbar mein sirf do links. Login/Logout Dashboard ke andar hai
function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-1.5 text-sm transition ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="text-lg font-bold sm:text-xl">
          {PLATFORM_NAME}
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/search" className={linkClass}>
            Explore
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
