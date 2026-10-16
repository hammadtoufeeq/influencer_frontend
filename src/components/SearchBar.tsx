import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchBarProps {
  initialValue?: string
  size?: 'md' | 'lg'
  tone?: 'default' | 'onDark'
}

function SearchBar({ initialValue = '', size = 'md', tone = 'default' }: SearchBarProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState(initialValue)
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = value.trim()
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
  }

  const padding = size === 'lg' ? 'py-3.5 text-base' : 'py-2.5 text-sm'

  const onDark = tone === 'onDark'

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex w-full gap-2 rounded-2xl transition duration-300 ${
        focused
          ? onDark
            ? 'ring-2 ring-white/60'
            : 'ring-2 ring-gray-900/20'
          : onDark
            ? 'ring-1 ring-white/20'
            : 'ring-1 ring-transparent'
      }`}
      style={{ padding: 0 }}
    >
      <div className="relative min-w-0 flex-1">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className={`pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-sm transition ${
            onDark ? 'text-white/60' : 'text-gray-400'
          } ${focused ? 'scale-110' : ''}`}
        />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t('site.search.placeholder')}
          aria-label={t('site.search.label')}
          className={`w-full rounded-2xl border-0 bg-white ps-11 pe-4 text-gray-900 outline-none placeholder:text-gray-400 shadow-sm ${padding}`}
        />
      </div>
      <button
        type="submit"
        aria-label={t('common.search')}
        className={`shrink-0 rounded-2xl px-5 font-semibold shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
          onDark
            ? 'bg-white text-gray-900 hover:bg-gray-100'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        } ${padding}`}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="sm:me-2" />
        <span className="hidden sm:inline">{t('common.search')}</span>
      </button>
    </form>
  )
}

export default SearchBar