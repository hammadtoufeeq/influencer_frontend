import { Link } from 'react-router-dom'
import { PLATFORM_NAME } from '../constants/config'

function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold">
          {PLATFORM_NAME}
        </Link>
      </nav>
    </header>
  )
}

export default Navbar
