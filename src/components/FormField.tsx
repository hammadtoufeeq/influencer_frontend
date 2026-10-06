import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...inputProps}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FormField
