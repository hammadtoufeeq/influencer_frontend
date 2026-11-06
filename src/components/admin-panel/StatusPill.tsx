const STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-800',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  open: 'bg-amber-50 text-amber-800',
  reviewing: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-red-50 text-red-700',
  waiting_for_business: 'bg-yellow-50 text-yellow-800',
  otp_failed: 'bg-red-50 text-red-700',
  code_verified: 'bg-blue-50 text-blue-700',
  negotiating: 'bg-amber-50 text-amber-800',
  disputed: 'bg-red-50 text-red-700',
  completed: 'bg-green-600 text-white',
  delivered: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  invited: 'bg-violet-50 text-violet-700',
  requested: 'bg-violet-50 text-violet-700',
  ended: 'bg-gray-100 text-gray-600',
  new: 'bg-amber-50 text-amber-800',
  in_progress: 'bg-blue-50 text-blue-700',
  answered: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
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
