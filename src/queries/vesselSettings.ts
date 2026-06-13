// src/queries/vesselSettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import PostgSail from '../services/api-client'

export const vesselSettingsKeys = {
  all: ['vessel-settings'] as const,
  detail: () => [...vesselSettingsKeys.all, 'detail'] as const,
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlertingThresholds {
  min_wind_speed?: number
  max_wind_speed?: number
  min_water_depth?: number
  max_water_temp?: number
  min_water_temp?: number
  min_battery_voltage?: number
  max_battery_voltage?: number
  [key: string]: number | undefined
}

export interface AlarmsState {
  [key: string]: boolean | string | number | null
}

export interface WindyCredentials {
  station_id?: string
  password?: string
  last_metric?: string | null
}

export interface VesselSettingsData {
  alerting?: AlertingThresholds
  alarms?: AlarmsState
  alert_last_metric?: string | null
  windy?: WindyCredentials
  configuration?: Record<string, any>
}

// ─── Query ────────────────────────────────────────────────────────────────────

export function useVesselSettings() {
  return useQuery({
    queryKey: vesselSettingsKeys.detail(),
    queryFn: async (): Promise<VesselSettingsData> => {
      const api = new PostgSail()
      const response = await api.vessel_settings_fn()
      // vessel_settings_fn returns { user_data, configuration }
      // Flatten into a single shape the UI works with
      return {
        alerting: response?.user_data?.alerting ?? {},
        alarms: response?.user_data?.alarms ?? {},
        alert_last_metric: response?.user_data?.alert_last_metric ?? null,
        windy: response?.user_data?.windy ?? {},
        configuration: response?.configuration ?? {},
      }
    },
    staleTime: (import.meta.env.DEV ? 10 : 60) * 60 * 1000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useUpdateVesselSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Partial<VesselSettingsData>) => {
      const api = new PostgSail()
      // vessel_settings_fn write path: POST with user_data shape
      return await api.vessel_settings_fn({
        user_data: {
          alerting: payload.alerting,
          windy: payload.windy,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vesselSettingsKeys.all })
    },
  })
}
