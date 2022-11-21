import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      isSidebarMinimized: false,
      token: localStorage.getItem('token') || '',
      userName: (localStorage.getItem('settings') && JSON.parse(localStorage.getItem('settings') || '').username) || '',
      count: 0,
      unsplash: null,
      postgsail: null,
      openweather: null,
      monitor: null,
      status: 'pending',
      packageVersion: 0,
      pgsail_app_version: 0,
      pgsail_sys_version: 0,
    }
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
