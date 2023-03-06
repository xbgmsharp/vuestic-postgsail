import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/api-client.js'
import mergeDeep from '../utils/mergeDeep.ts'

const defaultState = useStorage('global', {
  keepLoggedIn: false,
  isLoggedIn: false,
  isSidebarMinimized: false,
  currentTheme: 'light',
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

export const useGlobalStore = defineStore('global', {
  state: () => defaultState,
  actions: {
    login(token: string) {
      this.token = token
      this.isLoggedIn = true
      //this.fetchSettings()
    },
    logout() {
      // [WIP] for single-instance API:
      //delete new PostgSail().API.defaults.headers.Authorization
      this.$reset() // this line doesn't seem to do anything, so:
      //console.log('CacheStore.token after .$reset()', this.token, this)
      this.isLoggedIn = false
      this.token = ''
      mergeDeep(this.settings, defaultState.settings)
      console.log('GlobalStore.logout()', this.settings.email, this)
      // to update all refs pointing to preferences:
      //  [WIP] must update every single ref within preferences too
      //this.settings = { preferences: this.settings.preferences = {} }
      // not sure if above working, as changing accounts displays cached
      localStorage.removeItem('global')
    },
    toggleSidebar() {
      this.isSidebarMinimized = !this.isSidebarMinimized
    },
    changeUserName(username: string) {
      this.settings.username = username
    },

    async fetchVersions(web_version: string) {
      const api = new PostgSail()
      try {
        const response = await api.versions()
        this.versions = response
        this.versions.web_version = web_version
        console.log(this.versions)
      } catch (error) {
        console.log(error)
      }
    },
    async fetchSettings() {
      //if (this.userName) return this.settings
      const api = new PostgSail()
      try {
        return mergeDeep(this.settings, (await api.settings()).settings)
        //this.settings = (await api.settings()).settings
        // The following no longer requires syncing due to getters & actions:
        /*const response = await api.settings()
        this.settings = response.settings
        this.userName = response.settings?.username
        this.validEmail = response.settings?.preferences?.email_valid
        this.hasVessel = response.settings?.has_vessel
        this.$state.settings.preferences = {
          ...this.$state.settings.preferences,
          ...response.settings.preferences,
        }
        this.$state.userName = response.settings?.username
        this.$state.validEmail = response.settings?.preferences?.email_valid
        this.$state.hasVessel = response.settings?.has_vessel
        console.log(this.settings)*/
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
    userName: (state) => state.settings?.username,
    validEmail: (state) => state.settings?.preferences?.email_valid,
    hasVessel: (state) => state.settings?.has_vessel,
  },
})
