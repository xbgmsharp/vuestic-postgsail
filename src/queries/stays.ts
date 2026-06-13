import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import PostgSail from '../services/api-client'
import { computed, type MaybeRef, unref } from 'vue'
import type { JSObj } from '../data/types'
import { useGlobalStore } from '../stores/global-store'
import { handleUnauthorized } from '../utils/handleUnauthorized'

const api = new PostgSail()

export interface StaysFilters {
  name?: string | null
  dateRange?: { start: Date; end: Date } | null
  stayed_at_ids?: number[]
}

export const staysKeys = {
  all: ['stays'] as const,
  lists: () => [...staysKeys.all, 'list'] as const,
  list: (filters?: any) => [...staysKeys.lists(), filters] as const,
}

async function fetchStaysPage(filters: StaysFilters, page: number, pageSize: number) {
  const baseURL = import.meta.env.VITE_PGSAIL_URL + '/'
  const token = useGlobalStore().token

  const offset = (page - 1) * pageSize
  const parts: string[] = [`limit=${pageSize}`, `offset=${offset}`]

  if (filters.name) {
    parts.push(
      `or=(name.ilike.*${encodeURIComponent(filters.name)}*,moorage.ilike.*${encodeURIComponent(filters.name)}*)`,
    )
  }
  if (filters.dateRange?.start && filters.dateRange?.end) {
    parts.push(`arrived=lte.${filters.dateRange.end.toISOString()}`)
    parts.push(`departed=gte.${filters.dateRange.start.toISOString()}`)
  }
  if (filters.stayed_at_ids?.length) {
    parts.push(`stayed_at_id=in.(${filters.stayed_at_ids.join(',')})`)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'count=exact',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseURL}stays_view?${parts.join('&')}`, { headers })
  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(res.statusText)

  const contentRange = res.headers.get('Content-Range')
  const total = contentRange ? parseInt(contentRange.split('/')[1] ?? '0') : 0
  const data = await res.json()

  return { data: (data as any[]) || [], total, page, pageSize }
}

/**
 * Export all stays matching current filters as CSV (uses PostgREST native CSV support)
 */
export async function exportStaysCSV(filters: StaysFilters): Promise<string> {
  const baseURL = import.meta.env.VITE_PGSAIL_URL + '/'
  const token = useGlobalStore().token

  const parts: string[] = ['limit=10000']
  if (filters.name) {
    parts.push(
      `or=(name.ilike.*${encodeURIComponent(filters.name)}*,moorage.ilike.*${encodeURIComponent(filters.name)}*)`,
    )
  }
  if (filters.dateRange?.start && filters.dateRange?.end) {
    parts.push(`arrived=lte.${filters.dateRange.end.toISOString()}`)
    parts.push(`departed=gte.${filters.dateRange.start.toISOString()}`)
  }
  if (filters.stayed_at_ids?.length) {
    parts.push(`stayed_at_id=in.(${filters.stayed_at_ids.join(',')})`)
  }

  const headers: Record<string, string> = { Accept: 'text/csv' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseURL}stays_view?${parts.join('&')}`, { headers })
  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(res.statusText)
  return res.text()
}

/**
 * Paginated stays list with server-side filtering
 */
export function useStaysList({
  page,
  pageSize = 20,
  filters,
}: {
  page: MaybeRef<number>
  pageSize?: number
  filters: MaybeRef<StaysFilters>
}) {
  const resolvedPage = computed(() => unref(page))
  const resolvedFilters = computed(() => ({ ...unref(filters) }))

  const query = useQuery({
    queryKey: computed(() => [
      ...staysKeys.lists(),
      { ...resolvedFilters.value },
      { page: resolvedPage.value, pageSize },
    ]),
    queryFn: () => fetchStaysPage(resolvedFilters.value, resolvedPage.value, pageSize),
    staleTime: 60 * 60 * 1000,
    placeholderData: (previousData: any) => previousData,
  })

  return {
    items: computed(() => query.data.value?.data ?? []),
    totalCount: computed(() => query.data.value?.total ?? 0),
    totalPages: computed(() => Math.ceil((query.data.value?.total ?? 0) / pageSize)),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Update a stay (e.g. stay type)
 */
export function useUpdateStay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JSObj }) => api.stay_update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staysKeys.all })
    },
  })
}

/**
 * Get stays as GeoJSON for map display
 */
export function useStaysGeoJSON({ page = 1 } = {}) {
  const query = useQuery({
    queryKey: [...staysKeys.all, 'geojson', page],
    queryFn: () => api.stays_map({}, page),
    staleTime: 60 * 60 * 1000,
  })

  const geoJSON = computed(() => {
    const items = Array.isArray(query.data.value) ? query.data.value : []
    return items.map((row: any, index: number) => ({
      ...row.geojson,
      properties: {
        ...row.geojson?.properties,
        stayIndex: index,
      },
    }))
  })

  return { geoJSON, isLoading: query.isLoading }
}
