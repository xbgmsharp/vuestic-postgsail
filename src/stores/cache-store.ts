import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useCacheStore = defineStore('cache', {
  state: () => {
    return useStorage('cache', {})
  },
  actions: {},
  getters: {},
})
