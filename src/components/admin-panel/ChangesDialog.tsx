import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faClockRotateLeft,
  faClock,
  faCrosshairs,
  faUserShield,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import type { AuditLogEntry } from '../../types/adminPanel'
import { formatDateTime } from '../../utils/adminFormat'
import { initials } from '../../utils/format'
import AuditChanges from './AuditChanges'
import Sentence from './Sentence'
import { SLOTS } from './sentenceSlots'

// Upar ke chhote cards: admin, waqt, target
function Meta({
  icon,
  label,
  children,
}: {
  icon: IconDefinition
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-gray-500 uppercase">
        <FontAwesomeIcon icon={icon} className="text-[10px] text-gray-400" />
        {label}
      </p>
      <div className="mt-1.5 min-w-0 text-sm text-gray-900">{children}</div>
    </div>
  )
}

// Audit log ki ek entry: kisne, kab, kis cheez pe aur kya badla
function ChangesDialog({ log, onClose }: { log: AuditLogEntry; onClose: () => void }) {
  const { t } = useTranslation()
  const closeRef = useRef<HTMLButtonElement>(null)
  const actorName = log.actor?.name ?? log.actorEmail
  const targetType = t(`auditTarget.${log.targetType}`)
  const targetName = log.targetLabel ?? targetType
  const actionLabel = t(`auditAction.${log.action}`, { defaultValue: log.action })

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    // Peeche wala page scroll na ho
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  // Portal: kisi parent ka transform / overflow backdrop ko na kaate
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="changes-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl ring-1 ring-black/5"
      >
        <header className="flex items-start gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
            <FontAwesomeIcon icon={faClockRotateLeft} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="changes-title" className="truncate text-base font-semibold text-gray-900">
              {actionLabel}
            </h2>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {targetType}
              {log.targetLabel && <span className="text-gray-400"> · </span>}
              {log.targetLabel && <span className="text-gray-700">{log.targetLabel}</span>}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('audit.close')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Meta icon={faUserShield} label={t('audit.colActor')}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-on-brand">
                  {initials(actorName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{actorName}</p>
                  {log.actor && log.actor.email !== actorName && (
                    <p className="truncate text-xs text-gray-500">{log.actor.email}</p>
                  )}
                </div>
              </div>
            </Meta>
            <Meta icon={faClock} label={t('audit.colTime')}>
              <p className="font-medium">{formatDateTime(log.createdAt)}</p>
            </Meta>
            <Meta icon={faCrosshairs} label={t('audit.colTarget')}>
              <p className="truncate font-medium">{targetName}</p>
              <p className="truncate text-xs text-gray-500">{targetType}</p>
            </Meta>
          </div>

          {/* Poora jumla: "Hammad Toufeeq ne profile X edit karke save kiya" */}
          <p className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm leading-6 text-gray-700">
            <Sentence
              template={t(`audit.sentence.${log.action}`, {
                ...SLOTS,
                defaultValue: t('audit.sentence.fallback', SLOTS),
              })}
              parts={{
                actor: <strong className="font-semibold text-gray-900">{actorName}</strong>,
                target: <strong className="font-semibold text-gray-900">{targetName}</strong>,
                action: actionLabel,
              }}
            />
          </p>

          <AuditChanges log={log} />
        </div>

        <footer className="flex justify-end border-t border-gray-200 bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('audit.close')}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

export default ChangesDialog
