const STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800',
  code_sent: 'bg-blue-50 text-blue-700',
  code_verified: 'bg-green-100 text-green-800',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  open: 'bg-amber-50 text-amber-800',
  reviewing: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-red-50 text-red-700',
}

function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {label}
    </span>
  )
}

export default StatusPill
