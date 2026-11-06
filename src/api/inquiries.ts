import api from './axios'
import type { ApiSuccess } from '../types/api'

export interface InquiryInput {
  personId: string
  name: string
  email: string
  phone?: string
  message: string
  // Spam bots ke liye chhupa khana (insaan khali chhorta hai)
  website?: string
}

// Kisi talent ke baare mein sawal: login ke baghair bhi, admin ke paas jata hai
export async function sendInquiry(input: InquiryInput) {
  const res = await api.post<ApiSuccess<{ inquiry: { _id?: string; status: string } }>>(
    '/inquiries',
    input,
  )
  return res.data.data.inquiry
}
