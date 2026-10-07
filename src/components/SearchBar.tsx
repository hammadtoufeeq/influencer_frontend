import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchBarProps {
  initialValue?: string
  size?: 'md' | 'lg'
}

// Enter dabane pe /search?q=... pe le jata hai
function SearchBar({ initialValue = '', size = 'md' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = value.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  const padding = size === 'lg' ? 'py-3.5 text-base' : 'py-2.5 text-sm'

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name or what they do..."
        aria-label="Search people"
        className={`min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 outline-none focus:ring-2 focus:ring-gray-900 ${padding}`}
      />
      <button
        type="submit"
        aria-label="Search"
        className={`rounded-xl bg-gray-900 px-5 font-medium text-white hover:bg-gray-800 ${padding}`}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="sm:mr-2" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  )
}

export default SearchBar
