import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faHandshake, faHourglassHalf } from '@fortawesome/free-solid-svg-icons'
import { createHire } from '../../api/business'
import { myBusinessQuery, myHiresQuery } from '../../api/queries'
import { useAuth } from '../../hooks/useAuth'
import { isOpenBusiness, type HireInput } from '../../types/business'
import type { Person } from '../../types/person'
import { getApiError } from '../../utils/apiError'
import HireDialog from './HireDialog'

const primary = 'rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white'

// Profile page ka "Hire" button. Sirf verified business, sirf verified talent ko hire kare.
// Baqi sab ke liye pehle jaisa "Contact / Hire (Coming soon)"
function HireAction({ person }: { person: Person }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const queryClient = useQueryClient()
  const isBusiness = user?.role === 'business'
  const business = useQuery({ ...myBusinessQuery, enabled: isBusiness })
  const hires = useQuery({ ...myHiresQuery, enabled: isBusiness })
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const close = useCallback(() => setOpen(false), [])

  const send = useMutation({
    mutationFn: (input: HireInput) => createHire(input),
    onMutate: () => setErrors({}),
    onSuccess: () => {
      toast.success(t('hire.sent'))
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: myHiresQuery.queryKey })
    },
    onError: (error) => {
      const { message, fields } = getApiError(error)
      setErrors(fields)
      toast.error(message)
    },
  })

  // Guest: login pe bhejo, login ke baad wapas isi profile pe
  if (!user) {
    return (
      <Link
        to="/login"
        state={{ from: location.pathname }}
        className={`${primary} transition hover:bg-gray-800`}
      >
        {t('profile.contact')}
      </Link>
    )
  }

  if (!isBusiness) {
    return (
      <button disabled title={t('profile.comingSoon')} className={`${primary} opacity-50`}>
        {t('profile.contact')}
      </button>
    )
  }

  if (business.isLoading || hires.isLoading) return null

  // Sirf verified (claimed + verified) talent
  if (!person.verified || !person.claimedBy) {
    return (
      <p className="rounded-lg bg-gray-100 px-3 py-2 text-center text-xs text-gray-600">
        {t('hire.onlyVerifiedTalents')}
      </p>
    )
  }

  // Business khud verified nahi
  if (business.data?.status !== 'approved') {
    return (
      <>
        <button disabled className={`${primary} opacity-50`}>
          <FontAwesomeIcon icon={faHandshake} className="me-1.5" />
          {t('hire.button')}
        </button>
        <Link to="/dashboard" className="text-center text-xs text-gray-600 underline">
          {business.data && isOpenBusiness(business.data.status)
            ? t('hire.businessPending')
            : t('hire.verifyBusinessFirst')}
        </Link>
      </>
    )
  }

  const latest = hires.data?.find((hire) => hire.person?._id === person._id)
  if (latest?.status === 'pending') {
    return (
      <span className="rounded-lg bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
        <FontAwesomeIcon icon={faHourglassHalf} className="me-1.5" />
        {t('hire.requestSent')}
      </span>
    )
  }

  return (
    <>
      {latest?.status === 'accepted' && (
        <span className="rounded-lg bg-green-50 px-4 py-2 text-center text-sm text-green-700">
          <FontAwesomeIcon icon={faCircleCheck} className="me-1.5" />
          {t('hire.alreadyAccepted')}
        </span>
      )}
      <button onClick={() => setOpen(true)} className={`${primary} hover:bg-gray-800`}>
        <FontAwesomeIcon icon={faHandshake} className="me-1.5" />
        {t('hire.button')}
      </button>
      {open && (
        <HireDialog
          person={person}
          isSaving={send.isPending}
          errors={errors}
          onSend={(input) => send.mutate(input)}
          onClose={close}
        />
      )}
    </>
  )
}

export default HireAction
