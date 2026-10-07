import { useTranslation } from 'react-i18next'
import type { AuditLogEntry } from '../../types/adminPanel'
import { formatDateTime } from '../../utils/adminFormat'

// Kisi cheez pe admin ki pichli kaarwaiyan (audit log se)
function HistoryList({ history }: { history: AuditLogEntry[] }) {
  const { t } = useTranslation()
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">{t('common.history')}</h2>
      {history.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">{t('common.noHistory')}</p>
      ) : (
        <ol className="mt-3 space-y-3 border-s border-gray-200 ps-4">
          {history.map((entry) => (
            <li key={entry._id} className="text-sm">
              <p className="font-medium">
                {t(`auditAction.${entry.action}`, { defaultValue: entry.action })}
              </p>
              <p className="text-xs text-gray-500">
                {t('common.by', { name: entry.actor?.name ?? entry.actorEmail })} ·{' '}
                {formatDateTime(entry.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export default HistoryList
