import api from './axios'
import type { ApiSuccess } from '../types/api'
import type { AdminPersonRow, PersonInput } from '../types/admin'
import type { Person } from '../types/person'

export async function adminListPeople(params: URLSearchParams) {
  const res = await api.get<ApiSuccess<{ people: AdminPersonRow[] }>>('/admin/people', { params })
  return { people: res.data.data.people, meta: res.data.meta! }
}

export async function adminGetPerson(id: string) {
  const res = await api.get<ApiSuccess<{ person: Person }>>(`/admin/people/${id}`)
  return res.data.data.person
}

export async function createPerson(input: PersonInput) {
  const res = await api.post<ApiSuccess<{ person: Person }>>('/people', input)
  return res.data.data.person
}

export async function updatePerson(id: string, input: PersonInput) {
  const res = await api.patch<ApiSuccess<{ person: Person }>>(`/people/${id}`, input)
  return res.data.data.person
}

export async function deletePerson(id: string) {
  await api.delete(`/people/${id}`)
}
