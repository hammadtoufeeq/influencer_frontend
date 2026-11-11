import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { subscribeNewsletter } from '../api/newsletter'
import { getApiError } from '../utils/apiError'

// Footer: newsletter ke liye email. Login ke baghair koi bhi
function NewsletterForm() {
  const { t, i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const subscribe = useMutation({
    mutationFn: () => subscribeNewsletter(email.trim(), i18n.language),
    onMutate: () => setError(''),
    onError: (err) => {
      const { message, fields } = getApiError(err)
      setError(fields.email ?? message)
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t('forgot.errors.email'))
      return
    }
    subscribe.mutate()
  }

  if (subscribe.isSuccess) {
    return (
      <p role="status" className="flex items-start gap-2 text-sm text-green-400">
        <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5" />
        {t('footer.newsletterDone')}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="newsletter-email" className="text-sm font-semibold text-white">
        {t('footer.newsletterTitle')}
      </label>
      <p className="mt-1 text-xs text-gray-400">{t('footer.newsletterBody')}</p>
      <div className="mt-3 flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder={t('footer.newsletterPlaceholder')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'newsletter-error' : undefined}
          className={`min-w-0 flex-1 rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-white/40 ${
            error ? 'border-red-400' : 'border-white/15'
          }`}
        />
        <button
          type="submit"
          disabled={subscribe.isPending}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition hover:bg-brand-hover disabled:opacity-60"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
          {subscribe.isPending ? t('footer.newsletterSending') : t('footer.newsletterButton')}
        </button>
      </div>
      {error && (
        <p id="newsletter-error" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </form>
  )
}

export default NewsletterForm
