import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import PostgSail from '../services/api-client'
import { computed, type MaybeRef, unref } from 'vue'
import type { JSObj } from '../data/types'
import { useGlobalStore } from '../stores/global-store'
import { handleUnauthorized } from '../utils/handleUnauthorized'

const api = new PostgSail()

export interface MoorageFilters {
  name?: string | null
  default_stay_ids?: number[]
  sortBy?: string
  sortingOrder?: string
}

// Map List.vue sort keys to actual moorages_view column names
const SORT_COLUMN_MAP: Record<string, string> = {
  total_stay: 'total_duration',
  moorage: 'moorage',
  arrivals_departures: 'arrivals_departures',
  default_stay: 'default_stay',
}

export const mooragesKeys = {
  all: ['moorages'] as const,
  lists: () => [...mooragesKeys.all, 'list'] as const,
  list: (filters?: any) => [...mooragesKeys.lists(), filters] as const,
}

async function fetchMooragesPage(filters: MoorageFilters, page: number, pageSize: number) {
  const baseURL = import.meta.env.VITE_PGSAIL_URL + '/'
  const token = useGlobalStore().token

  const offset = (page - 1) * pageSize
  const col = SORT_COLUMN_MAP[filters.sortBy ?? 'total_stay'] ?? 'total_duration'
  const dir = filters.sortingOrder === 'asc' ? 'asc' : 'desc'
  const parts: string[] = [`limit=${pageSize}`, `offset=${offset}`, `order=${col}.${dir}`]
  if (filters.name) {
    parts.push(`moorage=ilike.*${encodeURIComponent(filters.name)}*`)
  }
  if (filters.default_stay_ids?.length) {
    parts.push(`default_stay_id=in.(${filters.default_stay_ids.join(',')})`)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'count=exact',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseURL}moorages_view?${parts.join('&')}`, { headers })
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
 * Export all moorages matching current filters as CSV (uses PostgREST native CSV support)
 */
export async function exportMooragesCSV(filters: MoorageFilters): Promise<string> {
  const baseURL = import.meta.env.VITE_PGSAIL_URL + '/'
  const token = useGlobalStore().token

  let params = 'limit=10000'
  if (filters.name) {
    params += `&moorage=ilike.*${encodeURIComponent(filters.name)}*`
  }
  if (filters.default_stay_ids?.length) {
    params += `&default_stay_id=in.(${filters.default_stay_ids.join(',')})`
  }

  const headers: Record<string, string> = { Accept: 'text/csv' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseURL}moorages_view?${params}`, { headers })
  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(res.statusText)
  return res.text()
}

/**
 * Paginated moorages list with server-side filtering
 */
export function useMooragesList({
  page,
  pageSize = 20,
  filters,
}: {
  page: MaybeRef<number>
  pageSize?: number
  filters: MaybeRef<MoorageFilters>
}) {
  const resolvedPage = computed(() => unref(page))
  const resolvedFilters = computed(() => ({ ...unref(filters) }))

  const query = useQuery({
    queryKey: computed(() => [
      ...mooragesKeys.lists(),
      { ...resolvedFilters.value },
      { page: resolvedPage.value, pageSize },
      { sortBy: resolvedFilters.value.sortBy, sortingOrder: resolvedFilters.value.sortingOrder },
    ]),
    queryFn: () => fetchMooragesPage(resolvedFilters.value, resolvedPage.value, pageSize),
    staleTime: 60 * 60 * 1000,
    placeholderData: (previousData: any) => previousData,
  })

  return {
    items: computed(() => query.data.value?.data ?? []),
    totalCount: computed(() => query.data.value?.total ?? 0),
    totalPages: computed(() => Math.ceil((query.data.value?.total ?? 0) / pageSize)),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Update a moorage (e.g. default stay type)
 */
export function useUpdateMoorage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JSObj }) => api.moorage_update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mooragesKeys.all })
    },
  })
}

/**
 * Get moorages as GeoJSON for map display (uses moorages_geojson_view)
 */
export function useMooragesGeoJSON({ page = 1 } = {}) {
  const query = useQuery({
    queryKey: [...mooragesKeys.all, 'geojson', page],
    queryFn: () => api.moorages_map({}, page),
    staleTime: 60 * 60 * 1000,
  })

  const geoJSON = computed(() => {
    const items = Array.isArray(query.data.value) ? query.data.value : []
    return items.map((row: any, index: number) => {
      let iconUrl = '/anchoricon.png'
      const defaultStayId = row.geojson?.properties?.default_stay_id
      if (defaultStayId === 3) iconUrl = '/mooring_icon.png'
      else if (defaultStayId === 4) iconUrl = '/dock_icon.png'
      return {
        ...row.geojson,
        properties: { ...row.geojson?.properties, moorageIndex: index, iconUrl },
      }
    })
  })

  return { geoJSON, isLoading: query.isLoading }
}
