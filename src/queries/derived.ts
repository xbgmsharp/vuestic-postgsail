import { computed } from 'vue'
import { useTripsList } from './logs'

export function useLogTags(page = 1) {
  const { items: trips } = useTripsList({ page })

  return computed(() => {
    const tagSet = new Set<string>()
    trips.value?.forEach((log: any) => log.tags?.forEach((tag: []) => tagSet.add(tag as unknown as string)))
    return Array.from(tagSet).sort()
  })
}

export function useTripsByMonth(page = 1) {
  const { items: trips } = useTripsList({ page })

  return computed(() => {
    const stats = Array(12).fill(0)
    trips.value?.forEach((log: any) => {
      stats[new Date(log.started).getMonth()] += 1
    })
    return stats
  })
}
