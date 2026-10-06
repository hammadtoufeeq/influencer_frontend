import { useQuery } from '@tanstack/react-query'
import { taxonomyQuery } from '../api/queries'
import type { TaxonomyType } from '../types/person'

export function useTaxonomy(type: TaxonomyType) {
  return useQuery(taxonomyQuery(type))
}
