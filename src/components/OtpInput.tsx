import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  // Saare khane bhar jayen to (jaise paste ke baad) khud submit
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  invalid?: boolean
  label: string
}

// 6 alag khane: likhte hi agla khana, backspace pe pichla, poora code paste bhi chalta hai
function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
  invalid,
  label,
}: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focus = (index: number) => refs.current[Math.max(0, Math.min(length - 1, index))]?.focus()

  function update(next: string, focusIndex: number) {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    focus(focusIndex)
    if (clean.length === length) onComplete?.(clean)
  }

  function handleChange(index: number, raw: string) {
    const typed = raw.replace(/\D/g, '')
    if (!typed) return
    // Ek se zyada hindse (autofill) aaye to wahan se aage bhar do
    const chars = [...digits]
    typed.split('').forEach((d, i) => {
      if (index + i < length) chars[index + i] = d
    })
    update(chars.join(''), index + typed.length)
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const chars = [...digits]
      if (chars[index]) {
        chars[index] = ''
        update(chars.join(''), index)
      } else if (index > 0) {
        chars[index - 1] = ''
        update(chars.join(''), index - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focus(index - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focus(index + 1)
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) update(pasted, pasted.length)
  }

  return (
    // Hindse hamesha baayen se daayen, Urdu/Arabic mein bhi
    <div dir="ltr" role="group" aria-label={label} className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          disabled={disabled}
          aria-label={`${label} ${index + 1}`}
          aria-invalid={invalid}
          className={`h-12 w-10 rounded-xl border bg-white text-center font-mono text-xl font-semibold outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-60 sm:h-14 sm:w-12 sm:text-2xl ${
            invalid ? 'border-red-500 text-red-600' : digit ? 'border-gray-400' : 'border-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

export default OtpInput
