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

    async fetchLogs() {
      const api = new PostgSail()
      try {
        const response = await api.versions()
        this.postgsail.logs = response.data
        this.$state.postgsail.logs = response.data
        console.log(this.postgsail)
      } catch (error) {
        console.log(error)
      }
    },
    async fetchStays() {
      const api = new PostgSail()
      try {
        const response = await api.versions()
        this.postgsail.stays = response.data
        this.$state.postgsail.stays = response.data
        console.log(this.$state)
      } catch (error) {
        console.log(error)
      }
    },
    async fetchMoorage() {
      const api = new PostgSail()
      try {
        const response = await api.versions()
        this.postgsail.moorages = response.data
        this.$state.postgsail.moorages = response.data
        console.log(this.postgsail)
      } catch (error) {
        console.log(error)
      }
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
        this.userName = response.data.settings.username
        this.$state.userName = response.data.settings.username
        this.$state.settings = response.data.settings
        console.log(this.settings)
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
