// src/queries/stay-types.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import PostgSail from '../services/api-client'

const api = new PostgSail()

export const stayTypeKeys = {
  all: ['stayTypes'] as const,
  list: () => [...stayTypeKeys.all, 'list'] as const,
}

export function useStayTypes() {
  return useQuery({
    queryKey: stayTypeKeys.list(),
    queryFn: () => api.stay_types_list(),
    staleTime: (import.meta.env.DEV ? 10 : 60) * 60 * 1000,
  })
}

interface CreateStayTypeVars {
  description: string
  // The built-in stay_code this custom type rolls up to if deleted — read
  // by public.badges_moorages_fn. null is a legitimate choice ("no
  // rollup"), not a missing value.
  parentCode: number | null
}

export function useCreateStayType() {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, CreateStayTypeVars>({
    mutationFn: ({ description, parentCode }) => api.stay_type_create(description, parentCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stayTypeKeys.list() }),
  })
}

interface RenameStayTypeVars {
  stayCode: number
  description: string
  parentCode: number | null
}

export function useRenameStayType() {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, RenameStayTypeVars>({
    mutationFn: ({ stayCode, description, parentCode }) => api.stay_type_rename(stayCode, description, parentCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stayTypeKeys.list() }),
  })
}

export function useDeleteStayType() {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, number>({
    mutationFn: (stayCode) => api.stay_type_delete(stayCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stayTypeKeys.list() }),
  })
}
