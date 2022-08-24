import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      isSidebarMinimized: false,
      token: localStorage.getItem('token') || '',
      userName: 'F Lacroix',
      count: 0,
      unsplash: null,
      postgsail: null,
      openweather: null,
      monitor: null,
      status: 'pending',
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
  },
})
