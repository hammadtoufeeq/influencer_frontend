import i18n from '../i18n'
import { getApiError } from './apiError'

// Tareekh aur waqt chuni hui zaban mein
export function formatDateTime(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatDate(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(i18n.language, { dateStyle: 'medium' })
}

// Backend ka error message, warna translated "Action failed"
export function adminErrorMessage(error: unknown) {
  const { message } = getApiError(error)
  return message || i18n.t('common.failed')
}
