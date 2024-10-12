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
  timelapse: {
    map_type: null,
    boat_type: null,
    speed: 250,
    delay: 0,
    zoom: 13,
    color: 'dodgerblue',
    map_height: '80vh',
    moorage_overlay: true,
    instruments: true,
  },
}

export const useGlobalStore = defineStore('appui', {
  state: () => useStorage('appui', structuredClone(defaultState), localStorage, { mergeDefaults: true }),
  actions: {},
  getters: {},
})
export default useGlobalStore
