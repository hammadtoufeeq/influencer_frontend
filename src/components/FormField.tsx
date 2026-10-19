import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

function FormField({ label, error, id, className = '', ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-gray-900 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...inputProps}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FormField