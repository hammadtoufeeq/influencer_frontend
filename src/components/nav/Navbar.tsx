import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faRightFromBracket,
  faRightToBracket,
  faTableColumns,
  faUserPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import toast from 'react-hot-toast'
import { PLATFORM_NAME } from '../../constants/config'
import {
  ACCOUNT_NAV,
  MAIN_NAV,
  UTILITY_NAV,
  canSee,
  isNavActive,
  type NavItem,
} from '../../constants/navigation'
import { ROLE_LABELS } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../Avatar'
import AccountMenu from './AccountMenu'
import LanguageMenu from './LanguageMenu'

function Navbar() {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    setMobileOpen(false)
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  const role = user?.role
  const mainItems = MAIN_NAV.filter((item) => canSee(item, role))
  const utilityItems = UTILITY_NAV.filter((item) => canSee(item, role))
  const active = (item: NavItem) => isNavActive(item, pathname, search)

  const linkClass = (isActive: boolean) =>
    `inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
    }`
  const iconButton = (isActive: boolean) =>
    `inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
      isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`

  const dashboardItem = ACCOUNT_NAV[0]

  return (
    <header className="relative border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="mr-2 truncate text-base font-bold sm:text-xl">
          {PLATFORM_NAME}
        </Link>

        {/* Desktop: beech wale links */}
        <div className="hidden flex-1 items-center gap-1 lg:flex">
          {mainItems.map((item) => (
            <Link key={item.to} to={item.to} className={linkClass(active(item))}>
              <FontAwesomeIcon icon={item.icon} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop: right side */}
        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <LanguageMenu />
          {!isLoading &&
            (user ? (
              <>
                {utilityItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    aria-label={item.label}
                    className={iconButton(active(item))}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                  </Link>
                ))}
                <Link to="/dashboard" className={`${linkClass(active(dashboardItem))} ml-1`}>
                  <FontAwesomeIcon icon={faTableColumns} />
                  Dashboard
                </Link>
                <div className="ml-1">
                  <AccountMenu onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass(pathname === '/login')}>
                  <FontAwesomeIcon icon={faRightToBracket} />
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  Sign up
                </Link>
              </>
            ))}
        </div>

        {/* Mobile: notifications + menu button */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          {user && (
            <Link
              to="/notifications"
              aria-label="Notifications"
              className={iconButton(pathname === '/notifications')}
              onClick={() => setMobileOpen(false)}
            >
              <FontAwesomeIcon icon={UTILITY_NAV[1].icon} />
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className={iconButton(mobileOpen)}
          >
            <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-30 max-h-[calc(100vh-60px)] overflow-y-auto border-b border-gray-200 bg-white shadow-lg lg:hidden">
          <div className="mx-auto max-w-6xl space-y-4 px-4 py-4">
            {user && (
              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <Avatar name={user.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-gray-500">{ROLE_LABELS[user.role]}</p>
                </div>
              </div>
            )}

            <ul className="space-y-1">
              {[
                ...mainItems,
                ...(user ? [dashboardItem, ...utilityItems, ACCOUNT_NAV[1]] : []),
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex w-full ${linkClass(active(item))} py-2.5`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <LanguageMenu />
              {user ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  Log out
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                  >
                    <FontAwesomeIcon icon={faRightToBracket} />
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white"
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
