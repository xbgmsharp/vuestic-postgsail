import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/vue-query'
import PostgSail from '../services/api-client'
import type { JSObj } from '../data/types'
import { computed, type MaybeRef, unref } from 'vue'
import { usePaginatedQuery } from './usePaginatedQuery'
import { useGlobalStore } from '../stores/global-store'
import { handleUnauthorized } from '../utils/handleUnauthorized'

export interface LogFilters {
  name?: string | null
  dateRange?: { start: Date; end: Date } | null
  tags?: string[]
}

function tagsOrFilter(tags: string[]): string {
  // tags column is jsonb; use cs (contains) per tag joined with or()
  return `or=(${tags.map((t) => `tags.cs.[${JSON.stringify(t)}]`).join(',')})`
}

async function fetchLogsPage(filters: LogFilters, page: number, pageSize: number) {
  const baseURL = import.meta.env.VITE_PGSAIL_URL + '/'
  const token = useGlobalStore().token

  const offset = (page - 1) * pageSize
  const parts: string[] = [`limit=${pageSize}`, `offset=${offset}`, `order=started.desc`]

  if (filters.name) {
    const q = encodeURIComponent(filters.name)
    parts.push(`or=(name.ilike.*${q}*,"from".ilike.*${q}*,"to".ilike.*${q}*)`)
  }
  if (filters.dateRange?.start && filters.dateRange?.end) {
    parts.push(`started=lte.${filters.dateRange.end.toISOString()}`)
    parts.push(`ended=gte.${filters.dateRange.start.toISOString()}`)
  }
  if (filters.tags?.length) {
    parts.push(tagsOrFilter(filters.tags))
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Prefer: 'count=exact',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseURL}logs_view?${parts.join('&')}`, { headers })
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

export async function exportLogsCSV(filters: LogFilters): Promise<string> {
  const baseURL = import.meta.env.VITE_PGSAIL_URL + '/'
  const token = useGlobalStore().token

  const parts: string[] = ['limit=10000', 'order=started.desc']
  if (filters.name) {
    const q = encodeURIComponent(filters.name)
    parts.push(`or=(name.ilike.*${q}*,"from".ilike.*${q}*,"to".ilike.*${q}*)`)
  }
  if (filters.dateRange?.start && filters.dateRange?.end) {
    parts.push(`started=lte.${filters.dateRange.end.toISOString()}`)
    parts.push(`ended=gte.${filters.dateRange.start.toISOString()}`)
  }
  if (filters.tags?.length) {
    parts.push(tagsOrFilter(filters.tags))
  }

  const headers: Record<string, string> = { Accept: 'text/csv' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${baseURL}logs_view?${parts.join('&')}`, { headers })
  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(res.statusText)
  return res.text()
}

export function useLogsList({
  page,
  pageSize = 20,
  filters,
}: {
  page: MaybeRef<number>
  pageSize?: number
  filters: MaybeRef<LogFilters>
}) {
  const resolvedPage = computed(() => unref(page))
  const resolvedFilters = computed(() => ({ ...unref(filters) }))

  const query = useQuery({
    queryKey: computed(() => [
      ...logKeys.lists(),
      { ...resolvedFilters.value },
      { page: resolvedPage.value, pageSize },
    ]),
    queryFn: () => fetchLogsPage(resolvedFilters.value, resolvedPage.value, pageSize),
    staleTime: 5 * 60 * 1000,
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

const api = new PostgSail()

// Query Keys
export const logKeys = {
  all: ['logs'] as const,
  lists: () => [...logKeys.all, 'list'] as const,
  list: (filters?: JSObj) => [...logKeys.lists(), filters] as const,
  details: () => [...logKeys.all, 'detail'] as const,
  detail: (id: string) => [...logKeys.details(), id] as const,
  map: () => [...logKeys.all, 'map'] as const,
  mapgl: (payload?: JSObj) => [...logKeys.all, 'mapgl', payload] as const,
}

/**
 * Paginated logs list with total count
 */
export function useTripsList({ page = 1, pageSize = 100, filters = {} } = {}) {
  return usePaginatedQuery({
    queryKey: logKeys.list(filters),
    queryFn: (p) => api.logs2_map(filters, p),
    page,
    pageSize,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch all logs (non-paginated) for stats
 */
export function useLogs(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: logKeys.lists(),
    queryFn: () => api.logs(),
    staleTime: (import.meta.env.DEV ? 10 : 60) * 60 * 1000,
    ...options,
  })
}

/**
 * Fetch a single log by ID
 */
export function useLog(id: string, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: logKeys.detail(id),
    queryFn: () => api.log_get(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
    ...options,
  })
}

/**
 * MapGL query
 */
export function useLogsMapGL(payload?: JSObj, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: logKeys.mapgl(payload),
    queryFn: () => api.logs_mapgl(payload || {}),
    enabled: !!payload,
    staleTime: 60 * 60 * 1000,
    ...options,
  })
}

// ============================================================================
// DERIVED DATA - Use with useLogs() for stats
// ============================================================================

export function useLogTags() {
  const { data: logs } = useLogs()

  const tags = computed(() => {
    if (!Array.isArray(logs.value) || logs.value.length === 0) return []
    const tagSet = new Set<string>()
    logs.value.forEach(({ tags }: { tags: Array<string> }) => {
      if (tags) tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  return { tags }
}

export function useLogsDistance() {
  const { data: logs } = useLogs()

  const totalDistance = computed(() => {
    if (!Array.isArray(logs.value)) return 0
    return logs.value.reduce((sum, { distance }: { distance: number }) => sum + (distance || 0), 0)
  })

  return { totalDistance }
}

export function useLogsByMonth() {
  const { data: logs } = useLogs()

  const statsByMonth = computed(() => {
    const stats = new Array(12).fill(0)
    if (!Array.isArray(logs.value) || logs.value.length === 0) return stats

    logs.value.forEach(({ started }: { started: string }) => {
      const month = new Date(started).getMonth()
      stats[month] += 1
    })
    return stats
  })

  return { statsByMonth }
}

// ============================================================================
// MUTATIONS (keep your existing mutations)
// ============================================================================

/**
 * Update a log
 */
export function useUpdateLog(options?: UseMutationOptions<any, Error, { id: string; payload: JSObj }>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: JSObj }) => api.log_update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: logKeys.lists() })
      queryClient.invalidateQueries({ queryKey: logKeys.detail(variables.id) })
    },
    ...options,
  })
}

/**
 * Delete a log
 */
export function useDeleteLog(options?: UseMutationOptions<any, Error, string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.log_delete(id),
    onSuccess: () => {
      // Invalidate all log queries
      queryClient.invalidateQueries({ queryKey: logKeys.all })
    },
    ...options,
  })
}

/**
 * Update trip notes
 */
export function useUpdateTripNotes(options?: UseMutationOptions<any, Error, JSObj>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: JSObj) => api.log_update_trip_notes(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: logKeys.lists() })
      if (variables._id) {
        queryClient.invalidateQueries({ queryKey: logKeys.detail(String(variables._id)) })
      }
    },
    ...options,
  })
}

/**
 * Delete trip entry
 */
export function useDeleteTripEntry(options?: UseMutationOptions<any, Error, JSObj>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: JSObj) => api.log_delete_trip_entry_fn(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: logKeys.lists() })
      if (variables._id) {
        queryClient.invalidateQueries({ queryKey: logKeys.detail(String(variables._id)) })
      }
    },
    ...options,
  })
}

/**
 * Merge logs
 */
export function useMergeLogs(options?: UseMutationOptions<any, Error, JSObj>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: JSObj) => api.logs_merge(payload),
    onSuccess: () => {
      // Invalidate all log-related queries
      queryClient.invalidateQueries({ queryKey: logKeys.all })
    },
    ...options,
  })
}

/**
 * Update observations
 */
export function useUpdateObservations(options?: UseMutationOptions<any, Error, JSObj>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: JSObj) => api.update_observations(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: logKeys.lists() })
      // If we know which log was affected, invalidate it specifically
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: logKeys.detail(String(variables.id)) })
      }
    },
    ...options,
  })
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export log as GPX
 */
export function useExportLogGPX(options?: UseMutationOptions<any, Error, JSObj>) {
  return useMutation({
    mutationFn: (payload: JSObj) => api.log_export_gpx(payload),
    ...options,
  })
}

/**
 * Export log as KML
 */
export function useExportLogKML(options?: UseMutationOptions<any, Error, JSObj>) {
  return useMutation({
    mutationFn: (payload: JSObj) => api.log_export_kml(payload),
    ...options,
  })
}

/**
 * Export log as GeoJSON
 */
export function useExportLogGeoJSON(options?: UseMutationOptions<any, Error, JSObj>) {
  return useMutation({
    mutationFn: (payload: JSObj) => api.log_export_geojson(payload),
    ...options,
  })
}

/**
 * Export multiple logs as GPX
 */
export function useExportLogsGPX(options?: UseMutationOptions<any, Error, JSObj>) {
  return useMutation({
    mutationFn: (payload: JSObj) => api.logs_export_gpx(payload),
    ...options,
  })
}

/**
 * Export multiple logs as KML
 */
export function useExportLogsKML(options?: UseMutationOptions<any, Error, JSObj>) {
  return useMutation({
    mutationFn: (payload: JSObj) => api.logs_export_kml(payload),
    ...options,
  })
}

/**
 * Export multiple logs as GeoJSON
 */
export function useExportLogsGeoJSON(options?: UseMutationOptions<any, Error, JSObj>) {
  return useMutation({
    mutationFn: (payload: JSObj) => api.logs_export_geojson(payload),
    ...options,
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Manually invalidate all log queries (useful for cache refresh)
 */
export function useInvalidateLogs() {
  const queryClient = useQueryClient()

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: logKeys.all })
  }

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: logKeys.lists() })
  }

  const invalidateDetail = (id: string) => {
    queryClient.invalidateQueries({ queryKey: logKeys.detail(id) })
  }

  return {
    invalidateAll,
    invalidateLists,
    invalidateDetail,
  }
}
