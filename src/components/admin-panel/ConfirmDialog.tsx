import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

interface ConfirmDialogProps {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel?: string
  tone?: 'default' | 'danger' | 'success'
  isBusy?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const TONES = {
  default: 'bg-brand hover:bg-brand-hover',
  danger: 'bg-red-600 hover:bg-red-700',
  success: 'bg-green-600 hover:bg-green-700',
}

function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  tone = 'default',
  isBusy,
  confirmDisabled,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const cancelRef = useRef<HTMLButtonElement>(null)

  // ✅ Latest callbacks ko ref mein rakho — effect unpar depend nahi karega
  const onCancelRef = useRef(onCancel)
  useEffect(() => {
    onCancelRef.current = onCancel
  })

  // ✅ Effect sirf `open` par chalta hai.
  // Pehla focusable field (textarea/input) ko focus karta hai, warna cancel button.
  // Escape key se cancel.
  useEffect(() => {
    if (!open) return

    // Defer focus taake DOM ready ho
    const id = window.setTimeout(() => {
      const dialog = cancelRef.current?.closest('[role="dialog"]')
      const firstField = dialog?.querySelector<HTMLElement>('textarea, input')
      ;(firstField ?? cancelRef.current)?.focus()
    }, 0)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelRef.current()
    }
    document.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(id)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])   // ✅ SIRF `open` — `onCancel` nahi

  if (!open) return null

  // Body pe portal: kisi parent ka transform / overflow parda chhota na kare (poora page dhaka rahe)
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && !isBusy && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        {children && <div className="mt-3 text-sm text-gray-600">{children}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy || confirmDisabled}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${TONES[tone]}`}
          >
            {isBusy ? t('common.saving') : (confirmLabel ?? t('common.confirm'))}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmDialog