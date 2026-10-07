import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFlag } from '@fortawesome/free-solid-svg-icons'

// Har profile pe "Report an error / request removal" (document ka rule)
function ReportProfileLink({ slug }: { slug: string }) {
  const { t } = useTranslation()
  return (
    <Link
      to={`/people/${slug}/report`}
      className="mt-2 inline-flex items-center gap-2 underline hover:text-gray-900"
    >
      <FontAwesomeIcon icon={faFlag} />
      {t('reportForm.link')}
    </Link>
  )
}

export default ReportProfileLink
