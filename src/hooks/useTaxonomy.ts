import { useQuery } from '@tanstack/react-query'
import { listTaxonomy } from '../api/people'
import type { TaxonomyType } from '../types/person'

// Ye lists kam hi badalti hain, is liye ek dafa la kar cache mein rakho
export function useTaxonomy(type: TaxonomyType) {
  return useQuery({
    queryKey: ['taxonomy', type],
    queryFn: () => listTaxonomy(type),
    staleTime: Infinity,
  })
}
