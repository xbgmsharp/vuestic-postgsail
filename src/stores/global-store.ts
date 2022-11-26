import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return useStorage('global', {
      isSidebarMinimized: false,
      token: '',
      userName: '',
      count: 0,
      unsplash: null,
      postgsail: null,
      openweather: null,
      monitor: null,
      status: 'pending',
      packageVersion: 0,
      pgsail_app_version: 0,
      pgsail_sys_version: 0,
    })
  },
  actions: {
    toggleSidebar() {
      this.isSidebarMinimized = !this.isSidebarMinimized
    },

    changeUserName(userName: string) {
      this.userName = userName
    },
  },
  getters: {
    monitor_fn: (state) => state.monitor,
    postgrest_fn: (state) => state.postgsail,
    status_fn: (state) => state.status,
    count_fn: (state) => state.count,
    appVersion: (state) => {
      return state.packageVersion
    },
    pgSailVersion: (state) => {
      return state.pgsail_app_version + ' ' + state.pgsail_sys_version
    },
  },
})
