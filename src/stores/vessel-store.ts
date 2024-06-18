import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import PostgSail from '../services/api-client'

const defaultState = {
  vessel: {
    name: '',
    mmsi: '',
    vessel_id: '',
    created_at: '',
    first_contact: '',
    last_contact: '',
    geojson: {},
    ship_type: 0,
    country: '',
    alpha_2: '',
    length: 0,
    beam: 0,
    height: 0,
    plugin_version: '',
    platform: '',
  },
}

export const useVesselStore = defineStore('vessel', {
  state: () => useStorage('vessel', structuredClone(defaultState), localStorage, { mergeDefaults: true }),
  actions: {
    async fetchVessel() {
      const api = new PostgSail()
      try {
        const response = await api.vessel_get()
        // API return null when vessel is pending metadata
        if (response && response.vessel) {
          this.vessel = response.vessel
          //console.log(this.vessel)
        } else {
          throw { response }
        }
        console.debug('VesselStore', this.vessel)
      } catch (error) {
        console.log(error)
      }
    },
  },
  getters: {
    vesselName: (state) => state.vessel?.name,
    vesselType: (state) => state.vessel?.ship_type,
    vesselId: (state) => state.vessel?.vessel_id,
  },
})
export default useVesselStore
