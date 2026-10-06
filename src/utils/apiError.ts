import axios from 'axios'
import type { ApiError } from '../types/api'

// Backend ke error response se message aur field errors nikalta hai
export function getApiError(error: unknown) {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data?.error) {
    const { code, message, fields } = error.response.data.error
    return {
      message: code === 'VALIDATION_ERROR' ? 'Please fix the highlighted fields' : message,
      fields: fields ?? {},
    }
  }
  return { message: 'Something went wrong. Please try again.', fields: {} }
}
