// Backend har response isi shape mein bhejta hai

export interface ApiMeta {
  page: number
  limit: number
  total: number
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: ApiMeta
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
