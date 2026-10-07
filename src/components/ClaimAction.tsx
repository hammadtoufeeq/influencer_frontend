import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faHourglassHalf, faPen } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { myClaimsQuery, myProfileQuery } from '../api/queries'
import { isOpenClaim } from '../types/claim'
import { useAuth } from '../hooks/useAuth'
import type { Person } from '../types/person'

const outline = 'rounded-lg border border-gray-300 px-4 py-2 text-center text-sm hover:bg-gray-100'

// Profile page pe Claim wala hissa. Faisla user ki apni TAAZA maloomat se hota hai
// (meri profile kaunsi hai, mera claim pending hai?), kyunke public profile ka data
// cache se aata hai aur thoda purana ho sakta hai
function ClaimAction({ person }: { person: Person }) {
  const { user } = useAuth()
  const isTalent = user?.role === 'talent'
  const myProfile = useQuery({ ...myProfileQuery, enabled: isTalent })
  const myClaims = useQuery({ ...myClaimsQuery, enabled: isTalent })

  // Talent ki maloomat aane tak kuch na dikhao (button flash na ho)
  if (isTalent && (myProfile.isLoading || myClaims.isLoading)) return null

  // 1. Ye meri apni profile hai
  if (isTalent && myProfile.data?._id === person._id) {
    return (
      <>
        <span className="rounded-lg bg-green-50 px-4 py-2 text-center text-sm text-green-700">
          <FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" />
          This is your profile
        </span>
        <Link to="/dashboard/profile/edit" className={outline}>
          <FontAwesomeIcon icon={faPen} className="mr-1.5" />
          Edit profile
        </Link>
      </>
    )
  }

  // 2. Kisi aur ki claimed profile
  if (person.claimedBy) {
    return (
      <span className="rounded-lg bg-green-50 px-4 py-2 text-center text-sm text-green-700">
        <FontAwesomeIcon icon={faCircleCheck} className="mr-1.5" />
        Claimed profile
      </span>
    )
  }

  // 3. Login nahi: login ke baad seedha claim form
  if (!user) {
    return (
      <Link to="/login" state={{ from: `/people/${person.slug}/claim` }} className={outline}>
        Is this you? Claim
      </Link>
    )
  }

  // 4. Business, agency waghera claim nahi kar sakte
  if (!isTalent) {
    return (
      <button
        onClick={() => toast('Only talent accounts can claim a profile')}
        className={`${outline} text-gray-500`}
      >
        Is this you? Claim
      </button>
    )
  }

  // 5. Talent ki pehle se apni profile hai: kahin bhi Claim nahi
  if (myProfile.data) return null

  // 6. Claim pending: sirf usi profile pe status, baqi sab pe kuch nahi
  const pending = myClaims.data?.find((claim) => isOpenClaim(claim.status))
  if (pending) {
    return pending.person._id === person._id ? (
      <span className="rounded-lg bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
        <FontAwesomeIcon icon={faHourglassHalf} className="mr-1.5" />
        Claim under review
      </span>
    ) : null
  }

  // 7. Talent jis ki koi profile nahi
  return (
    <Link to={`/people/${person.slug}/claim`} className={outline}>
      Is this you? Claim
    </Link>
  )
}

export default ClaimAction
