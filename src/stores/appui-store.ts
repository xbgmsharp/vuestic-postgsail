import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/api-client'

const defaultState = {
  keepLoggedIn: false,
  isLoggedIn: false,
  isSidebarMinimized: false,
  isMobile: false,
  doShowAsCards: 1,
  currentTheme: 'light',
  unsplash: null,
  openweather: null,
  currentweather: {},
}

export const useGlobalStore = defineStore('appui', {
  state: () => useStorage('appui', structuredClone(defaultState), localStorage, { mergeDefaults: true }),
  actions: {},
  getters: {},
})
export default useGlobalStore
