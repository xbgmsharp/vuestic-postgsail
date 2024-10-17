import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/api-client'
import deepMerge from '../utils/deepMerge'
import OpenMeteo from '../services/openmeteo'
import moment from 'moment'
import { userBadges, WMO } from '../utils/PostgSail'

const demo_pattern = /^[A-Za-z0-9._%+-]+@openplotter.cloud$/

const defaultState = {
  keepLoggedIn: false,
  isLoggedIn: false,
  isSidebarMinimized: false,
  isMobile: false,
  doShowAsCards: 1,
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
  stats: {
    stats_logs: [],
    stats_moorages: [],
  },
  status: 'pending',
  versions: {
    web_version: '',
    api_version: '',
    sys_version: '',
    timescaledb: '',
    postgis: '',
    postgrest: '',
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
      monitoring: {
        depthKey: 'environment.depth.belowTransducer',
        waterTemperatureKey: 'environment.water.temperature',
        windSpeedKey: 'environment.wind.speedTrue',
        windDirectionKey: 'environment.wind.directionTrue',
        insidePressureKey: 'environment.inside.pressure',
        outsidePressureKey: 'environment.outside.pressure',
        insideTemperatureKey: 'environment.inside.temperature',
        outsideTemperatureKey: 'environment.outside.temperature',
        insideHumidityKey: 'environment.inside.humidity',
        outsideHumidityKey: 'environment.outside.humidity',
        stateOfChargeKey: 'electrical.batteries.House.capacity.stateOfCharge',
        voltageKey: 'electrical.batteries.House.voltage',
      },
      badges: {},
      telegram: {},
      email_valid: false,
      pushover_user_key: '',
      instagram_handle: '',
      public_profile: false,
      public_logs: false,
      public_stats: false,
      public_logs_list: false,
      public_timelapse: false,
      public_vessel: '',
      public_windy: false,
      public_monitoring: false,
      preferred_homepage: 0,
      use_imperial_units: false,
      email_notifications: true,
      phone_notifications: false,
      windy: null,
      /*cache_minutes: 10,
      cache_clear_on_logout: true*/
    },
    created_at: '',
    username: '',
    has_vessel: false,
    public_vessel: '',
  },
  vessel: {},
  badges: {},
  ispublic: false,
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
      //deepMerge(this.settings, defaultState.settings)
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
      //if (this.ispublic) return this.settings /* Ignore on anonymous access */
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
      await this.set_userBadges()
      this.settings.public_vessel = this.settings?.preferences?.public_vessel || 'no_public_vessel'
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
      if (this.openweather && this.openweather['daily']) {
        this.currentweather = Object.assign({
          temp: this.openweather['current']['temperature_2m'],
          description: WMO[this.openweather['current']['weather_code']]['day']['description'],
          img: WMO[this.openweather['current']['weather_code']]['day']['image'],
          sunriseTime: moment.unix(this.openweather['daily']['sunrise'][0]).format('HH:mm'),
          sunsetTime: moment.unix(this.openweather['daily']['sunset'][0]).format('HH:mm'),
        })
      }
    },
    async fetchWeatherForecast(coordinates: [number, number]) {
      const weather = new OpenMeteo()
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
    async fetchStats() {
      const payload = {
        start_date: null,
        end_date: null,
      }
      const api = new PostgSail()
      try {
        const response = await api.stats(payload)
        this.stats = response.stats || {}
        console.log('fetchStats response', response)
        return this.stats
      } catch (error) {
        console.log(error)
      }
    },
    async set_userBadges() {
      const user_badges = this.settings?.preferences?.badges || {}
      console.log('set_userBadges', user_badges)
      this.badges = await userBadges(user_badges)
      //return this.badges
    },
    async is_public(boat: string, type: string, id = 0 as number) {
      const api = new PostgSail()
      try {
        const response = await api.is_public({ boat: boat, _type: type, _id: id })
        this.ispublic = response
        console.log('is_public response', response)
        if (this.ispublic == true) {
          api.setHeader('x-is-public', btoa(`${boat},${type},${id}`))
          this.settings.public_vessel = boat
        }
        return this.ispublic
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
    imperialUnits: (state) => state.settings?.preferences?.use_imperial_units || false,
    doubleCount: (state) => state.count * 2,
    Monitoring2: (state) => state.monitoring2,
    stats_logs: (state) => state.stats?.stats_logs || [],
    stats_moorages: (state) => state.stats?.stats_moorages || [],
    openWeather: (state) => state.openweather,
    currentWeather: (state) => state.currentweather,
    Badges: (state) => state.settings?.preferences?.badges || {},
    userBadges: (state) => state?.badges || {},
    publicVessel: (state) => state.settings?.public_vessel || null,
    publicTimelapse: (state) => state.settings?.preferences?.public_timelapse || false,
    isPublic: (state) => state.ispublic || false,
    firstName: (state) => state.settings?.first,
    instagram: (state) => state.settings?.preferences?.instagram_handle,
    website: (state) => state.settings?.preferences?.website,
    windy: (state) => state.settings?.preferences?.windy,
    readOnly: (state) => {
      const demo_email = state.settings?.email.match(demo_pattern)
      console.debug('readOnly', demo_email)
      if (demo_email != null && import.meta.env.PROD) {
        return true
      }
      return false
    },
  },
})
export default useGlobalStore
