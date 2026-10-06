import { queryOptions } from '@tanstack/react-query'
import { getPerson, listPeople, listTaxonomy } from './people'
import { getMyProfile, listMyClaims } from './claims'
import type { TaxonomyType } from '../types/person'

// Har query ki key aur function ek jagah. Pages aur prefetch dono yahi use karte hain,
// is liye cache ki key hamesha same rehti hai

export function peopleQuery(params: URLSearchParams) {
  return queryOptions({
    queryKey: ['people', params.toString()],
    queryFn: () => listPeople(params),
  })
}

export function personQuery(slug: string) {
  return queryOptions({
    queryKey: ['person', slug],
    queryFn: () => getPerson(slug),
  })
}

export function taxonomyQuery(type: TaxonomyType) {
  return queryOptions({
    queryKey: ['taxonomy', type],
    queryFn: () => listTaxonomy(type),
    // Ye lists kam hi badalti hain
    staleTime: Infinity,
  })
}

// Logged-in user ka data: staleTime 0 taake hamesha taaza ho
export const myClaimsQuery = queryOptions({
  queryKey: ['claims', 'mine'],
  queryFn: listMyClaims,
  staleTime: 0,
})

export const myProfileQuery = queryOptions({
  queryKey: ['claims', 'my-profile'],
  queryFn: getMyProfile,
  staleTime: 0,
})
