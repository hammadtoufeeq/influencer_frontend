import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
function VerifiedBadge() {
  return (
    <span
      title="Verified profile"
      className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
    >
      <FontAwesomeIcon icon={faCircleCheck} className="mr-1" />
      Verified
    </span>
  )
}

export default VerifiedBadge
