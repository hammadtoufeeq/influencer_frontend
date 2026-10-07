import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { ACCOUNT_NAV, canSee } from '../../constants/navigation'
import { ROLE_LABELS } from '../../constants/roles'
import { useAuth } from '../../hooks/useAuth'
import { useDismiss } from '../../hooks/useDismiss'
import Avatar from '../Avatar'

// Desktop pe naam wala button: Dashboard, Settings, Log out
function AccountMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  if (!user) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3 hover:bg-gray-50"
      >
        <Avatar name={user.name} size="sm" />
        <FontAwesomeIcon icon={faChevronDown} className="text-xs text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-60 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
          <div className="border-b border-gray-100 px-4 pb-3">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-xs text-gray-500">
              {ROLE_LABELS[user.role]} · {user.email}
            </p>
          </div>
          {ACCOUNT_NAV.filter((item) => canSee(item, user.role)).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={item.icon} className="w-4 text-gray-500" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              close()
              onLogout()
            }}
            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default AccountMenu
