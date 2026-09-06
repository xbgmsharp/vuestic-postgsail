import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import PostgSail from '../services/api-client'
const api = new PostgSail()

export interface FriendAlerts {
  departure?: boolean
  arrival?: boolean
  proximity_nm?: number
}

export interface Friend {
  id: number
  mmsi: number
  target_vessel_id: string | null
  label: string | null
  alerts: FriendAlerts | null
  created_at: string
  source: string | null
  data_quality: string | null
  state: string | null
  distance_nm: number | null
  proximity_nm: number | null
  last_contact: string | null
  position_time: string | null
  latitude: number | null
  longitude: number | null
  status: string | null
}

export interface Follower {
  id: number
  follower_vessel_id: string | null
  follower_vessel_name: string | null
  since: string | null
  mutual_possible: boolean
  follower_mmsi: number
}

const staleTime = (import.meta.env.DEV ? 10 : 60) * 60 * 1000

export const friendKeys = {
  all: ['friends'] as const,
  list: () => [...friendKeys.all, 'list'] as const,
  followers: () => [...friendKeys.all, 'followers'] as const,
}

export function useFriends() {
  return useQuery({
    queryKey: friendKeys.list(),
    queryFn: () => api.friends_list(),
    staleTime,
  })
}

export function useFollowers() {
  return useQuery({
    queryKey: friendKeys.followers(),
    queryFn: () => api.followers_list(),
    staleTime,
  })
}

export function useFollowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (mmsi: number) => api.friends_follow(mmsi),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: friendKeys.list() }),
  })
}

export function useRenameFollowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, label }: { id: number; label: string }) => api.friends_rename(id, label),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: friendKeys.list() }),
  })
}

export function useFollowAlertsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, alerts }: { id: number; alerts: FriendAlerts }) => api.friends_alerts(id, alerts),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: friendKeys.list() }),
  })
}

export function useUnfollowMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (mmsi: number) => api.friends_unfollow(mmsi),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: friendKeys.list() }),
  })
}

export function useGoPublicMutation() {
  return useMutation({
    mutationFn: () => api.friends_go_public(),
  })
}
