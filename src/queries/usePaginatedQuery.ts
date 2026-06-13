import { computed, unref, reactive, type MaybeRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface UsePaginatedQueryOptions<T> {
  queryKey: readonly unknown[]
  queryFn: (page: number) => Promise<PaginatedResponse<T>>
  page?: MaybeRef<number>
  pageSize?: number
  enabled?: MaybeRef<boolean>
  staleTime?: number
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  page = 1,
  pageSize = 100,
  enabled = true,
  staleTime = 5 * 60 * 1000,
}: UsePaginatedQueryOptions<T>) {
  const currentPage = computed(() => unref(page))

  const query = useQuery({
    queryKey: computed(() => [...queryKey, { page: currentPage.value, pageSize }] as const),
    queryFn: () => {
      console.log('🔍 Fetching page:', currentPage.value)
      return queryFn(currentPage.value)
    },
    enabled: computed(() => unref(enabled)),
    staleTime,
    placeholderData: (previousData) => previousData,
  })

  // Return direct access to query properties (they're already refs from useQuery)
  return {
    // Data - these are computed, so they're reactive
    items: computed(() => query.data.value?.data ?? []),
    totalCount: computed(() => query.data.value?.total ?? 0),
    totalPages: computed(() => Math.ceil((query.data.value?.total ?? 0) / pageSize)),
    hasNextPage: computed(() => currentPage.value < Math.ceil((query.data.value?.total ?? 0) / pageSize)),
    hasPreviousPage: computed(() => currentPage.value > 1),
    currentPage,
    pageSize,

    // Query states - use the refs directly from useQuery
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,
    status: query.status,
    fetchStatus: query.fetchStatus,

    // Methods
    refetch: query.refetch,
  }
}
