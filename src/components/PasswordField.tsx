import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

// Password input + dikhao/chhupao button
function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  inputClassName,
}: {
  id: string
  label: ReactNode
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete: string
  // Poori input class badalni ho (login / signup ka bara input)
  inputClassName?: string
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className={
            inputClassName
              ? `${inputClassName} pe-11 ${error ? 'border-red-500' : ''}`
              : `w-full rounded-lg border bg-white py-2 ps-3 pe-10 outline-none focus:ring-2 focus:ring-gray-900 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`
          }
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t('settings.hidePassword') : t('settings.showPassword')}
          className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-gray-400 hover:text-gray-700"
        >
          <FontAwesomeIcon icon={visible ? faEyeSlash : faEye} />
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default PasswordField
