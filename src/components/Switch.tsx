interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

// On/off button (aria switch). label screen reader ke liye
function Switch({ checked, onChange, label, disabled, size = 'md' }: SwitchProps) {
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'
  const knob = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
  const move =
    size === 'sm' ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-5 rtl:-translate-x-5'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`keep-dark relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${track} ${
        checked ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`${knob} rounded-full bg-white shadow-sm transition-transform ${checked ? move : 'translate-x-0'}`}
      />
    </button>
  )
}

export default Switch
