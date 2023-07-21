import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/api-client'
import deepMerge from '../utils/deepMerge'
import WeatherForecast from '../services/openweathermap'
import * as moment from 'moment'

const defaultState = {
  keepLoggedIn: false,
  isLoggedIn: false,
  isSidebarMinimized: false,
  currentTheme: 'light',
  token: '',
  // de-duplication to reduce syncing requirements; now in getters:
  //userName: '',
  //validEmail: false,
  count: 0,
  unsplash: null,
  postgsail: {
    logs: [],
    stays: [],
    moorages: [],
  },
  openweather: null,
  currentweather: {},
  monitoring2: [],
  status: 'pending',
  versions: {
    web_version: '',
    api_version: '',
    sys_version: '',
    timescaledb: '',
    postgis: '',
  },
  settings: {
    email: '',
    first: '',
    last: '',
    preferences: {
      website: '',
      alerting: {
        enabled: false,
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
      badges: {},
      telegram: {},
      email_valid: false,
      public_logs: true,
      public_stats: false,
      pushover_user_key: '',
      public_profile: true,
      instagram_handle: '',
      public_logs_list: false,
      public_timelapse: true,
      preferred_homepage: 0,
      use_imperial_units: false,
      email_notifications: true,
      phone_notifications: false,
      /*cache_minutes: 10,
      cache_clear_on_logout: true*/
    },
    created_at: '',
    username: '',
    has_vessel: false,
  },
  vessel: {},
}

export const useGlobalStore = defineStore('global', {
  state: () =>
    useStorage(
      'global',
      structuredClone(defaultState),
      localStorage,
      { mergeDefaults: true },
      //{ mergeDefaults: (storageValue, defaults) => deepMerge(defaultState, storageValue) }
    ),
  actions: {
    login(token: string, keepLoggedIn: boolean) {
      this.token = token
      this.isLoggedIn = true
      this.keepLoggedIn = keepLoggedIn
      return token
      //return this.fetchSettings()
    },
    logout() {
      this.isLoggedIn = false
      this.token = ''
      // to update existing refs pointing to preferences:
      deepMerge(this.settings, defaultState.settings)
      localStorage.removeItem('global')
      localStorage.removeItem('cache')
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
        console.log('GlobalStore fetchVersions this.versions', this.versions)
      } catch (error) {
        console.log(error)
      }
    },
    async fetchSettings(_refresh = false): Promise<Record<string, any>> {
      console.log('fetchSettings', _refresh, this.userName, this.settings)
      if (!_refresh && this.userName) return this.settings /* Force refresh */
      const api = new PostgSail()
      try {
        const settings = await api.settings()
        if (Number.isInteger(settings) && settings === 401) {
          console.error('401')
          this.logout()
        } else {
          //this.settings = (await api.settings()).settings
          deepMerge(this.settings, settings.settings)
        }
      } catch (error) {
        console.error(error)
      }
      return this.settings
    },
    async updatePref(key: string, value: any): Promise<any> {
      const api = new PostgSail()
      try {
        const response = await api.update_user_preferences({ key: `{${key}}`, value: value })
        //const preferences: Record<string, any> = this.settings.preferences
        //preferences[key] = value
        console.log('updatePref response', response)
        return response
      } catch (error) {
        console.log(error)
      }
    },
    set_web_version(web_version: string) {
      this.versions.web_version = web_version
    },
    set_currentWeather() {
      if (this.openweather && this.openweather['current']) {
        //const openweatherTodayData = this.openweather['daily'][0]
        this.currentweather = Object.assign(
          { temp: this.openweather['current']['temp'] },
          this.openweather['current']['weather'][0],
          { img: `https://openweathermap.org/img/wn/${this.openweather['current']['weather'][0]['icon']}@2x.png` },
          {
            sunriseTime: moment.unix(this.openweather['current']['sunrise']).format('HH:mm'),
            sunsetTime: moment.unix(this.openweather['current']['sunset']).format('HH:mm'),
          },
        )
      }
    },
    async fetchWeatherForecast(coordinates: [number, number]) {
      const weather = new WeatherForecast()
      try {
        await weather.updateForecast(coordinates as [number, number])
        this.openweather = weather.data
        console.log('fetchWeatherForecast', weather.data)
        this.set_currentWeather()
        console.log('fetchWeatherForecast', this.currentweather)
        return this.openweather
      } catch (error) {
        console.log(error)
      }
    },
    async fetchMonitoring2() {
      const api = new PostgSail()
      try {
        const response = await api.monitoring2()
        this.monitoring2 = response
        console.log('fetchMonitoring response', response)
        return this.monitoring2
      } catch (error) {
        console.log(error)
      }
    },
  },
  getters: {
    userName: (state) => state.settings?.username,
    validEmail: (state) => state.settings?.preferences?.email_valid,
    hasVessel: (state) => state.settings?.has_vessel,
    preferredHomepage: (state) =>
      ['dashboard', 'logs', 'monitoring', 'stats'][state.settings?.preferences?.preferred_homepage || 0],
    imperialUnits: (state) => state.settings?.preferences?.use_imperial_units,
    doubleCount: (state) => state.count * 2,
    Monitoring2: (state) => state.monitoring2,
    openWeather: (state) => state.openweather,
    currentWeather: (state) => state.currentweather,
    Badges: (state) => state.settings?.preferences?.badges,
  },
})
export default useGlobalStore
