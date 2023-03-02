import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/postgsail.js'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return useStorage('global', {
      isLoggedIn: false,
      isSidebarMinimized: false,
      token: '',
      userName: '',
      validEmail: false,
      hasVessel: false,
      count: 0,
      unsplash: null,
      postgsail: {
        logs: [],
        stays: [],
        moorages: [],
      },
      openweather: null,
      monitor: null,
      status: 'pending',
      versions: {
        web_version: '',
        api_version: '',
        sys_version: '',
      },
      settings: {
        email: '',
        first: '',
        last: '',
        preferences: {
          website: '',
          alerting: {
            min_notification_interval: 6,
            low_pressure_threshold: 990,
            high_wind_speed_threshold: 30,
            low_water_depth_threshold: 1.0,
            high_pressure_drop_threshold: 12,
            low_battery_charge_threshold: 50,
            low_battery_voltage_threshold: 12.5,
            low_water_temperature_threshold: 10.0,
            low_indoor_temperature_threshold: 7.0,
            low_outdoor_temperature_threshold: 3.0,
          },
          pushover: {} /* not used */,
          telegram: {},
          email_valid: false,
          public_logs: true,
          public_stats: true,
          pushover_user_key: '',
          public_profile: true,
          instagram_handle: '',
          public_logs_list: false,
          public_timelapse: true,
          preferred_homepage: 0,
          use_imperial_units: false,
          email_notifications: true,
          phone_notifications: false,
        },
        created_at: '',
        username: '',
      },
      vessel: {},
    })
  },
  actions: {
    login() {
      this.isLoggedIn = true
    },
    logout() {
      this.isLoggedIn = false
    },
    toggleSidebar() {
      this.isSidebarMinimized = !this.isSidebarMinimized
    },
    changeUserName(username: string) {
      this.userName = username
    },

    async fetchVersions(web_version: string) {
      const api = new PostgSail()
      try {
        const response = await api.versions()
        this.versions = response.data
        this.versions.web_version = web_version
        console.log(this.versions)
      } catch (error) {
        console.log(error)
      }
    },
    async fetchSettings() {
      const api = new PostgSail()
      try {
        const response = await api.settings()
        this.settings = response.data.settings
        this.userName = response.data.settings?.username
        this.validEmail = response.data.settings?.preferences?.email_valid
        this.hasVessel = response.data.settings?.has_vessel
        this.$state.settings.preferences = {
          ...this.$state.settings.preferences,
          ...response.data.settings.preferences,
        }
        //this.$state.settings = response.data.settings
        this.$state.userName = response.data.settings?.username
        this.$state.validEmail = response.data.settings?.preferences?.email_valid
        this.$state.hasVessel = response.data.settings?.has_vessel
        console.log(this.settings)
      } catch (error) {
        console.log(error)
      }
    },
    async updatePref(key: string, value: any) {
      const api = new PostgSail()
      try {
        const response = await api.update_user_preferences({ key: `{${key}}`, value: value }),
          preferences: Record<string, any> = this.settings.preferences
        //preferences: Record<string, any> = this.$state.settings.preferences
        preferences[key] = value
        console.log(response)
        return response
      } catch (error) {
        console.log(error)
      }
    },
    set_web_version(web_version: string) {
      this.versions.web_version = web_version
    },
  },
  getters: {
    doubleCount: (state) => state.count * 2,
    username: (state) => state.userName,
  },
})
