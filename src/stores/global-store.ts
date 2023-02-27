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
      settings: {},
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
        this.$state.settings = response.data.settings
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
        const response = await api.update_user_preferences({ key: `{${key}}`, value: value })
        this.$state.settings.preferences[key] = value
        this.settings.preferences[key] = value
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
